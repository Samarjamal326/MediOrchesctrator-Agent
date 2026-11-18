"""
USDA FoodData Central Ingestion Script for MediOrchestrator RAG.
Parses foods and their clinical nutrient profiles directly from the ZIP archive
and indexes them into ChromaDB with domain='nutrition'.
"""
import os
import sys
import zipfile
import io
import csv
import time
from typing import Dict, List, Any

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.vector_store import vector_store

ZIP_PATH = os.path.join(BASE_DIR, "agents", "nutrition", "FoodData_Central_csv_2026-10-29.zip")

# Key clinical/dietary nutrients to extract (Nutrient ID -> Common Name)
CLINICAL_NUTRIENTS = {
    "1008": "Calories (kcal)",
    "2047": "Energy (kcal)",
    "1003": "Protein (g)",
    "1004": "Total Fat (g)",
    "1005": "Carbohydrates (g)",
    "1079": "Fiber (g)",
    "2000": "Total Sugars (g)",
    "1087": "Calcium (mg)",
    "1089": "Iron (mg)",
    "1093": "Sodium (mg)",
    "1092": "Potassium (mg)",
    "1106": "Vitamin A (mcg)",
    "1162": "Vitamin C (mg)",
    "1114": "Vitamin D (IU)",
    "1258": "Saturated Fatty Acids (g)",
    "1253": "Cholesterol (mg)",
}

def load_nutrient_names(z: zipfile.ZipFile, prefix: str) -> Dict[str, str]:
    """Load nutrient id to name mapping from nutrient.csv."""
    nutrient_map = {}
    with z.open(f"{prefix}nutrient.csv") as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
        for row in reader:
            n_id = row.get("id")
            name = row.get("name")
            unit = row.get("unit_name", "")
            if n_id:
                nutrient_map[n_id] = f"{name} ({unit})" if unit else name
    return nutrient_map

def ingest_nutrition_data(max_items: int = 1200):
    print("=" * 65)
    print(" MediOrchestrator: USDA FoodData Central RAG Ingestion")
    print("=" * 65)
    
    if not os.path.exists(ZIP_PATH):
        print(f"Error: ZIP file not found at {ZIP_PATH}")
        return

    print(f"Loading FoodData archive: {os.path.basename(ZIP_PATH)}")
    start_time = time.time()
    
    with zipfile.ZipFile(ZIP_PATH, "r") as z:
        names = z.namelist()
        prefix = "FoodData_Central_csv_2026-10-29/" if any(n.startswith("FoodData_Central_csv_2026-10-29/") for n in names) else ""
        
        # 1. Identify food items from foundation_food and sr_legacy_food (highest nutritional quality)
        target_fdc_ids = set()
        
        if f"{prefix}foundation_food.csv" in names:
            with z.open(f"{prefix}foundation_food.csv") as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
                for row in reader:
                    target_fdc_ids.add(row["fdc_id"])
                    
        if f"{prefix}sr_legacy_food.csv" in names:
            with z.open(f"{prefix}sr_legacy_food.csv") as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
                for row in reader:
                    target_fdc_ids.add(row["fdc_id"])
                    if len(target_fdc_ids) >= max_items:
                        break

        print(f"Identified {len(target_fdc_ids)} clinical core reference foods.")

        # 2. Get descriptions from food.csv
        food_meta = {}
        with z.open(f"{prefix}food.csv") as f:
            reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
            for row in reader:
                fdc_id = row.get("fdc_id")
                if fdc_id in target_fdc_ids:
                    desc = row.get("description", "").strip()
                    cat_id = row.get("food_category_id", "")
                    food_meta[fdc_id] = {
                        "description": desc,
                        "data_type": row.get("data_type", "Reference Food"),
                        "nutrients": {}
                    }

        print(f"Loaded descriptions for {len(food_meta)} target items.")

        # 3. Read food_nutrient.csv and attach key nutrients
        with z.open(f"{prefix}food_nutrient.csv") as f:
            reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
            for row in reader:
                fdc_id = row.get("fdc_id")
                if fdc_id in food_meta:
                    n_id = row.get("nutrient_id")
                    if n_id in CLINICAL_NUTRIENTS:
                        val = row.get("amount", "")
                        if val:
                            food_meta[fdc_id]["nutrients"][CLINICAL_NUTRIENTS[n_id]] = val

    # 4. Format rich clinical documents for ChromaDB embedding
    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    ids: List[str] = []

    for fdc_id, data in food_meta.items():
        desc = data["description"]
        if not desc or not data["nutrients"]:
            continue
            
        nutrient_lines = [f"  - {name}: {val}" for name, val in data["nutrients"].items()]
        nutrients_str = "\n".join(nutrient_lines)
        
        doc_text = (
            f"Food Item: {desc}\n"
            f"Category/Source: USDA FoodData Central ({data['data_type']})\n"
            f"Portion Reference: 100g standard serving\n"
            f"Nutritional & Macro Profile:\n"
            f"{nutrients_str}"
        )
        
        documents.append(doc_text)
        metadatas.append({
            "domain": "nutrition",
            "source": "USDA FoodData Central",
            "item_name": desc,
            "fdc_id": str(fdc_id)
        })
        ids.append(f"usda_{fdc_id}")

    print(f"Generated {len(documents)} structured nutritional reference documents.")
    print("Embedding documents and indexing into ChromaDB (collection: clinical_knowledge)...")
    
    vector_store.add_texts(
        texts=documents,
        metadatas=metadatas,
        ids=ids,
        collection_name="clinical_knowledge"
    )

    elapsed = round(time.time() - start_time, 2)
    print(f"SUCCESS: Ingestion complete in {elapsed}s! Vector store persisted to backend/rag/chroma_db/")

if __name__ == "__main__":
    ingest_nutrition_data()
