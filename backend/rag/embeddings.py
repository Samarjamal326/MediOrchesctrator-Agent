"""
Local SentenceTransformers Embeddings wrapper for RAG.
Uses all-MiniLM-L6-v2 (fast, lightweight, completely free, runs locally).
"""
from typing import List
import threading

_model_instance = None
_lock = threading.Lock()

def get_embedding_model():
    global _model_instance
    if _model_instance is None:
        with _lock:
            if _model_instance is None:
                from sentence_transformers import SentenceTransformer
                # all-MiniLM-L6-v2 produces 384-dimensional dense vectors
                _model_instance = SentenceTransformer("all-MiniLM-L6-v2")
    return _model_instance

class LocalEmbeddings:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        model = get_embedding_model()
        embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        model = get_embedding_model()
        embedding = model.encode(text, show_progress_bar=False, normalize_embeddings=True)
        return embedding.tolist()

local_embeddings = LocalEmbeddings()
