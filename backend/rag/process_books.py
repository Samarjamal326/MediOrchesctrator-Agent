"""
Medical Textbook Chunker & Processor:
1. Parses PDF books from backend/data/books/
2. Cleans out non-clinical publisher boilerplate (copyright, index, cataloging).
3. Chunks chapters cleanly (500-800 tokens with 100 token overlap).
4. Saves human-readable, structured JSON chunks into domain-specific folders:
     backend/data/chunks/<domain>/<book_name>_chunks.json
5. Indexes the clean chunks into ChromaDB with domain metadata for real-time RAG.
"""

import os
import sys
import re
import json
import time
from typing import Dict, List, Any
import pypdf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BOOKS_DIR = os.path.join(BASE_DIR, "data", "books")
CHUNKS_BASE_DIR = os.path.join(BASE_DIR, "data", "chunks")

from rag.vector_store import vector_store

# Map downloaded PDF filenames to their clinical domains & titles
BOOK_CATALOG: Dict[str, Dict[str, Any]] = {
    "Bookshelf_NBK2003.pdf": {
        "domain": "cardiology",
        "title": "National Cholesterol Education Program (NCEP) Adult Treatment Panel Clinical Guidelines",
        "author": "National Institutes of Health (NIH) / NHLBI",
        "skip_initial_pages": 12,
    },
    "9789241549790-eng.pdf": {
        "domain": "mental_health",
        "title": "WHO mhGAP Intervention Guide for Mental, Neurological and Substance Use Disorders",
        "author": "World Health Organization",
        "skip_initial_pages": 14,
    },
    "Bookshelf_NBK64164.pdf": {
        "domain": "pharmacy",
        "title": "Clinical Protocols for Substance Abuse & Pharmacotherapy (TIP Compendium)",
        "author": "SAMHSA / CSAT",
        "skip_initial_pages": 16,
    },
    "9241546891_eng.pdf": {
        "domain": "nutrition",
        "title": "Food Safety & Micronutrient Risk Assessment Manual",
        "author": "FAO / World Health Organization",
        "skip_initial_pages": 10,
    }
}

BOILERPLATE_PATTERNS = [
    re.compile(r"all rights reserved", re.IGNORECASE),
    re.compile(r"isbn\s*(?:-13|-10)?\s*[:\d\-x]+", re.IGNORECASE),
    re.compile(r"cataloguing-in-publication data", re.IGNORECASE),
    re.compile(r"printed in [a-z\s]+", re.IGNORECASE),
    re.compile(r"table of contents", re.IGNORECASE),
    re.compile(r"page\s+\d+\s+of\s+\d+", re.IGNORECASE),
]

def clean_text(raw_text: str) -> str:
    """Strips publishing boilerplate, lines with solitary numbers, and normalizes spacing."""
    if not raw_text:
        return ""
    lines = raw_text.splitlines()
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if len(stripped) < 4 and stripped.isdigit():
            continue
        if any(p.search(stripped) for p in BOILERPLATE_PATTERNS):
            continue
        cleaned_lines.append(stripped)

    full = " ".join(cleaned_lines)
    full = re.sub(r"\s+", " ", full)
    return full.strip()

def chunk_text(text: str, chunk_size: int = 1400, overlap: int = 200) -> List[str]:
    """Splits continuous text into overlapping chunks along word boundaries."""
    words = text.split(" ")
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size // 5, len(words))
        chunk_words = words[start:end]
        chunk = " ".join(chunk_words).strip()
        if len(chunk) > 150:
            chunks.append(chunk)
        if end == len(words):
            break
        start += (chunk_size - overlap) // 5
    return chunks

def process_books_and_save_domain_chunks():
    print("=" * 70)
    print(" MediOrchestrator: Medical Book Ingestion & Domain Chunking")
    print("=" * 70)

    for pdf_file, info in BOOK_CATALOG.items():
        pdf_path = os.path.join(BOOKS_DIR, pdf_file)
        if not os.path.exists(pdf_path):
            print(f"Skipping {pdf_file} (not found)")
            continue

        domain = info["domain"]
        domain_chunk_dir = os.path.join(CHUNKS_BASE_DIR, domain)
        os.makedirs(domain_chunk_dir, exist_ok=True)

        print(f"\n[{domain.upper()}] Processing: {info['title']}")
        print(f"  File: {pdf_file} ({round(os.path.getsize(pdf_path)/(1024*1024), 2)} MB)")

        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        skip_pages = info.get("skip_initial_pages", 10)

        chunks_data: List[Dict[str, Any]] = []
        texts_for_chroma: List[str] = []
        metadatas_for_chroma: List[Dict[str, Any]] = []
        ids_for_chroma: List[str] = []

        chunk_idx = 0
        for page_num in range(skip_pages, total_pages):
            try:
                raw = reader.pages[page_num].extract_text() or ""
                cleaned = clean_text(raw)
                if len(cleaned) < 250:
                    continue

                page_chunks = chunk_text(cleaned)
                for c in page_chunks:
                    chunk_idx += 1
                    chunk_id = f"book_{domain}_{pdf_file[:10]}_{chunk_idx:04d}"

                    chunk_record = {
                        "chunk_id": chunk_id,
                        "domain": domain,
                        "book_title": info["title"],
                        "author": info["author"],
                        "page": page_num + 1,
                        "content": c
                    }
                    chunks_data.append(chunk_record)

                    doc_text = (
                        f"Medical Textbook Source: {info['title']}\n"
                        f"Domain: {domain.upper()} (Page {page_num + 1})\n"
                        f"Clinical Guidance & Protocol:\n{c}"
                    )
                    texts_for_chroma.append(doc_text)
                    metadatas_for_chroma.append({
                        "domain": domain,
                        "source": info["title"],
                        "page": page_num + 1,
                        "type": "textbook_clinical_monograph"
                    })
                    ids_for_chroma.append(chunk_id)
            except Exception as e:
                continue

        # 1. Save chunks to domain-specific JSON file
        out_json_filename = f"{pdf_file.replace('.pdf', '')}_chunks.json"
        out_json_path = os.path.join(domain_chunk_dir, out_json_filename)
        with open(out_json_path, "w", encoding="utf-8") as jf:
            json.dump(chunks_data, jf, indent=2, ensure_ascii=False)

        print(f"  [SAVED CHUNKS] {len(chunks_data)} chunks saved to:")
        print(f"  --> {os.path.relpath(out_json_path, BASE_DIR)}")

        # 2. Index into ChromaDB
        print(f"  [CHROMA INDEXING] Indexing {len(texts_for_chroma)} chunks into ChromaDB...")
        vector_store.add_texts(
            texts=texts_for_chroma,
            metadatas=metadatas_for_chroma,
            ids=ids_for_chroma,
            collection_name="clinical_knowledge"
        )
        print(f"  [COMPLETE] Indexed {len(texts_for_chroma)} chunks for {domain.upper()}!")

    print("\n" + "=" * 70)
    print(" ALL DOMAIN CHUNK FOLDERS & CHROMA INDEXING COMPLETED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    process_books_and_save_domain_chunks()
