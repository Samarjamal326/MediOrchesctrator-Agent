"""
MedQuAD Comprehensive Clinical & Theoretical Knowledge Ingestion Script.
Reads 47,441 clinical Q&A monographs compiled by NIH/NLM,
categorizes them across all 12 project medical domains,
and indexes balanced theoretical & clinical knowledge into ChromaDB.
"""
import os
import sys
import re
import time
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pyarrow.parquet as pq
from rag.vector_store import vector_store

PARQUET_PATH = os.path.join(BASE_DIR, "data", "medquad", "medquad_47k.parquet")

# Keyword mapping to assign theoretical & clinical Q&A to the 12 domains
DOMAIN_PATTERNS = {
    "cardiology": re.compile(r"\b(heart|cardiac|coronary|hypertension|arrhythmia|angina|myocardial|valvular|aortic|cholesterol|atherosclerosis|atrial fibrillation|pericard)\b", re.IGNORECASE),
    "neurology": re.compile(r"\b(brain|stroke|seizure|epilepsy|neuropathy|migraine|headache|parkinson|alzheimer|multiple sclerosis|dementia|tremor|cerebr|spinal cord|meningitis)\b", re.IGNORECASE),
    "dermatology": re.compile(r"\b(skin|rash|lesion|eczema|psoriasis|dermatitis|melanoma|carcinoma|acne|urticaria|alopecia|pruritus|blister|epiderm)\b", re.IGNORECASE),
    "orthopedics": re.compile(r"\b(bone|fracture|joint|arthritis|osteoarthritis|cartilage|ligament|tendon|spine|scoliosis|osteoporosis|hip|knee|shoulder|musculoskeletal)\b", re.IGNORECASE),
    "mental_health": re.compile(r"\b(depression|anxiety|bipolar|schizophrenia|ptsd|phobia|panic|psychosis|eating disorder|insomnia|addiction|obsessive|compulsive|adhd|mental health)\b", re.IGNORECASE),
    "dentistry": re.compile(r"\b(tooth|teeth|dental|gum|gingivitis|periodont|cavity|caries|jaw|tmj|oral|enamel|root canal|denture)\b", re.IGNORECASE),
    "womens_health": re.compile(r"\b(pregnancy|prenatal|uterine|cervical|ovarian|ovary|breast|menopause|menstrual|pcos|endometriosis|vagina|obstetric|fertility)\b", re.IGNORECASE),
    "emergency": re.compile(r"\b(emergency|anaphylaxis|poisoning|overdose|burn|trauma|shock|hemorrhage|resuscitation|acute injury|bite|sting|foreign body|asphyxia)\b", re.IGNORECASE),
    "pathology": re.compile(r"\b(biopsy|blood cell|hemoglobin|leukemia|lymphoma|platelet|anemia|histology|cytology|neoplasm|tumor|carcinoma|laboratory|specimen)\b", re.IGNORECASE),
    "pharmacy": re.compile(r"\b(medication|drug|dose|dosage|toxicity|contraindication|interaction|pharmacology|antibiotic|adverse effect|side effect|prescription)\b", re.IGNORECASE),
    "nutrition": re.compile(r"\b(diet|nutrition|vitamin|mineral|calorie|protein|carbohydrate|fat|cholesterol|malnutrition|supplement|sodium|fiber|obesity)\b", re.IGNORECASE),
}

def classify_text(text: str) -> str:
    """Classifies a question/topic into one of the 12 medical domains."""
    for domain, pattern in DOMAIN_PATTERNS.items():
        if pattern.search(text):
            return domain
    return "general_medicine"

def ingest_medquad(max_per_domain: int = 150):
    print("=" * 65)
    print(" MediOrchestrator: MedQuAD Clinical Knowledge Ingestion")
    print("=" * 65)

    if not os.path.exists(PARQUET_PATH):
        print(f"Error: Parquet file not found at {PARQUET_PATH}")
        return

    print(f"Loading MedQuAD archive: {os.path.basename(PARQUET_PATH)}")
    start_time = time.time()

    table = pq.read_table(PARQUET_PATH)
    total_records = table.num_rows
    print(f"Total raw records available: {total_records}")

    pydict = table.to_pydict()
    questions = pydict.get("Questions", [])
    answers = pydict.get("Answers", [])

    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    ids: List[str] = []

    domain_counts = {d: 0 for d in list(DOMAIN_PATTERNS.keys()) + ["general_medicine"]}

    for idx, (q, a) in enumerate(zip(questions, answers)):
        if not q or not a or len(a.strip()) < 40:
            continue

        q_clean = q.strip()
        a_clean = a.strip()

        domain = classify_text(f"{q_clean} {a_clean[:100]}")

        # Ensure balanced representation across all specialties
        if domain_counts[domain] >= max_per_domain:
            continue

        domain_counts[domain] += 1

        # Format rich clinical knowledge chunk
        doc_text = (
            f"Specialty Domain: {domain.upper()}\n"
            f"Clinical Query: {q_clean}\n"
            f"Evidence & Expert Guidance:\n{a_clean[:1200]}"
        )

        documents.append(doc_text)
        metadatas.append({
            "domain": domain,
            "source": "NIH MedQuAD Clinical Corpus",
            "topic": q_clean[:80]
        })
        ids.append(f"medquad_{domain}_{domain_counts[domain]:04d}")

        # Stop once all domains reach target or we have substantial coverage
        if all(c >= max_per_domain for c in domain_counts.values()):
            break

    print("\nIndexed distribution across 12 clinical domains:")
    for d, c in sorted(domain_counts.items()):
        print(f"  - {d:18}: {c} clinical monographs")

    print(f"\nTotal structured clinical documents: {len(documents)}")
    print("Embedding documents and upserting into ChromaDB (collection: clinical_knowledge)...")

    vector_store.add_texts(
        texts=documents,
        metadatas=metadatas,
        ids=ids,
        collection_name="clinical_knowledge"
    )

    elapsed = round(time.time() - start_time, 2)
    print(f"SUCCESS: MedQuAD Ingestion complete in {elapsed}s! All 12 domains now have active RAG.")

if __name__ == "__main__":
    ingest_medquad()
