import pytest
from pathlib import Path
import json

def test_chunk_json_structure():
    chunks_dir = Path(__file__).resolve().parent.parent / "backend" / "data" / "chunks"
    if not chunks_dir.exists():
        pytest.skip("Chunks directory not present in local test environment")
    for domain_folder in chunks_dir.iterdir():
        if domain_folder.is_dir():
            for chunk_file in domain_folder.glob("*_chunks.json"):
                with open(chunk_file, "r", encoding="utf-8") as f:
                    chunks = json.load(f)
                assert isinstance(chunks, list)
                if len(chunks) > 0:
                    first = chunks[0]
                    assert "content" in first
                    assert "metadata" in first
                    assert "domain" in first["metadata"]
