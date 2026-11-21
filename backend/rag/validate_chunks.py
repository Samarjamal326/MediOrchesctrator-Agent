"""Chunk Metadata Validator Utility."""
import os
import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

def validate_all_chunks():
    total_valid = 0
    errors = 0
    if not CHUNKS_DIR.exists():
        print("No chunks directory found.")
        return
    for domain_folder in sorted(CHUNKS_DIR.iterdir()):
        if domain_folder.is_dir():
            for json_file in domain_folder.glob("*_chunks.json"):
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for item in data:
                    if "content" in item and "metadata" in item and "domain" in item["metadata"]:
                        total_valid += 1
                    else:
                        errors += 1
    print(f"Validated {total_valid} clinical chunks across domains. Errors: {errors}")

if __name__ == "__main__":
    validate_all_chunks()
