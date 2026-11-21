"""
Semantic Cache.
Caches query embeddings and compares incoming queries via cosine similarity.
If a similar question was answered previously (similarity >= 0.90), returns the cached answer.
"""

import json
import logging
import math
from typing import Optional, Dict, Any, List
from core.redis import redis_manager
from rag.embeddings import local_embeddings

logger = logging.getLogger("mediorchestrator.cache.semantic")

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.85, default_ttl_sec: int = 7200):
        self.similarity_threshold = similarity_threshold
        self.default_ttl = default_ttl_sec
        self._index_key = "cache:semantic:index"

    async def get_similar(self, query: str, domain: Optional[str] = None) -> Optional[Dict[str, Any]]:
        try:
            query_emb = local_embeddings.embed_query(query)
            if not query_emb:
                return None

            client = await redis_manager.get_client()
            raw_index = await client.get(self._index_key)
            if not raw_index:
                return None

            entries = json.loads(raw_index)
            best_match = None
            highest_sim = 0.0

            for item in entries:
                if domain and item.get("domain") and item.get("domain") != domain:
                    continue
                sim = cosine_similarity(query_emb, item.get("embedding", []))
                if sim > highest_sim:
                    highest_sim = sim
                    best_match = item

            if best_match and highest_sim >= self.similarity_threshold:
                logger.info(f"Semantic Cache HIT (similarity: {highest_sim:.4f}): '{best_match.get('query')[:40]}'")
                return {
                    "response": best_match.get("response"),
                    "domain": best_match.get("domain"),
                    "matched_query": best_match.get("query"),
                    "similarity": round(highest_sim, 4),
                    "execution_trace": best_match.get("execution_trace"),
                    "is_safe": best_match.get("is_safe", True)
                }
            return None
        except Exception as e:
            logger.warning(f"SemanticCache.get_similar error: {e}")
            return None

    async def store(self, query: str, response: str, domain: str, execution_trace: Optional[Dict] = None, is_safe: bool = True):
        try:
            query_emb = local_embeddings.embed_query(query)
            if not query_emb:
                return False

            client = await redis_manager.get_client()
            raw_index = await client.get(self._index_key)
            entries = json.loads(raw_index) if raw_index else []

            if len(entries) >= 200:
                entries.pop(0)

            new_entry = {
                "query": query,
                "embedding": query_emb,
                "domain": domain,
                "response": response,
                "execution_trace": execution_trace,
                "is_safe": is_safe
            }
            entries.append(new_entry)
            await client.set(self._index_key, json.dumps(entries), ex=self.default_ttl)
            return True
        except Exception as e:
            logger.warning(f"SemanticCache.store error: {e}")
            return False

semantic_cache = SemanticCache()
