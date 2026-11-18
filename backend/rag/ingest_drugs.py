"""
FDA Structured Product Labels (SPL) Ingestion Script for MediOrchestrator RAG.
Extracts brand & generic names, indications & usage, dosage & administration,
contraindications, and adverse reactions from drug-label-0001-of-0014.json.zip,
then chunks and indexes them into ChromaDB under domain='general_medicine' and domain='pharmacy'.
"""
import os
import sys
import zipfile
import json
import time
from typing import Dict, List, Any

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.vector_store import vector_store

ZIP_PATH = os.path.join(BASE_DIR, "agents", "general_medicine", "drug-label-0001-of-0014.json.zip")

def clean_section(text_list, max_chars: int = 500) -> str:
    """Combines and truncates long clinical sections to relevant summaries."""
    if not text_list:
        return ""
    full_text = " ".join(text_list)
    # Collapse multiple whitespace
    cleaned = " ".join(full_text.split())
    if len(cleaned) > max_chars:
        cleaned = cleaned[:max_chars].rsplit(" ", 1)[0] + "..."
    return cleaned

def ingest_fda_drugs(max_drugs: int = 800):
    print("=" * 65)
    print(" MediOrchestrator: FDA Drug Label Knowledge Base Ingestion")
    print("=" * 65)

    if not os.path.exists(ZIP_PATH):
        print(f"Error: FDA ZIP file not found at {ZIP_PATH}")
        return

    print(f"Reading archive: {os.path.basename(ZIP_PATH)}")
    start_time = time.time()

    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    ids: List[str] = []
    seen_names = set()

    with zipfile.ZipFile(ZIP_PATH, "r") as z:
        with z.open("drug-label-0001-of-0014.json") as f:
            data = json.load(f)
            results = data.get("results", [])
            print(f"Loaded {len(results)} raw drug records from archive.")

            for r in results:
                if len(documents) >= max_drugs:
                    break

                openfda = r.get("openfda", {})
                brand_list = openfda.get("brand_name") or []
                generic_list = openfda.get("generic_name") or []

                if not brand_list and not generic_list:
                    continue

                primary_name = (brand_list[0] if brand_list else generic_list[0]).strip()
                name_key = primary_name.lower()
                if name_key in seen_names:
                    continue
                seen_names.add(name_key)

                generic_name = generic_list[0].strip() if generic_list else "Not specified"
                indications = clean_section(r.get("indications_and_usage"), max_chars=450)
                dosage = clean_section(r.get("dosage_and_administration"), max_chars=400)
                contra = clean_section(r.get("contraindications"), max_chars=300)
                warnings = clean_section(r.get("warnings") or r.get("boxed_warning"), max_chars=300)
                adverse = clean_section(r.get("adverse_reactions"), max_chars=250)

                # Skip entries without clinical guidance
                if not indications and not dosage:
                    continue

                # Build clinical reference document
                doc_lines = [
                    f"Drug: {primary_name} (Generic: {generic_name})",
                    f"Regulatory Source: FDA Structured Product Label",
                ]
                if indications:
                    doc_lines.append(f"Indications & Clinical Usage:\n{indications}")
                if dosage:
                    doc_lines.append(f"Dosage & Administration Overview:\n{dosage}")
                if contra:
                    doc_lines.append(f"Contraindications:\n{contra}")
                if warnings:
                    doc_lines.append(f"Warnings & Precautions:\n{warnings}")
                if adverse:
                    doc_lines.append(f"Key Adverse Reactions:\n{adverse}")

                doc_text = "\n\n".join(doc_lines)

                documents.append(doc_text)
                metadatas.append({
                    "domain": "general_medicine",
                    "secondary_domain": "pharmacy",
                    "source": "FDA Structured Product Label",
                    "item_name": primary_name,
                    "generic_name": generic_name
                })
                doc_id = f"fda_{len(documents):04d}_{name_key[:20].replace(' ', '_')}"
                ids.append(doc_id)

    print(f"Constructed {len(documents)} clinical drug monographs.")
    print("Embedding documents and indexing into ChromaDB (collection: clinical_knowledge)...")

    vector_store.add_texts(
        texts=documents,
        metadatas=metadatas,
        ids=ids,
        collection_name="clinical_knowledge"
    )

    elapsed = round(time.time() - start_time, 2)
    print(f"SUCCESS: FDA Drug Ingestion complete in {elapsed}s! Vector store updated.")

if __name__ == "__main__":
    ingest_fda_drugs()
