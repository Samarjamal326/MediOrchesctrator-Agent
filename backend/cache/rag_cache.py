"""
RAG Retrieval Cache.
Caches retrieved document chunks for repeated knowledge queries to save vector search latencies.
"""

import hashlib
import json
import logging
from typing import Optional, List, Dict, Any
from core.redis import redis_manager

logger = logging.getLogger("mediorchestrator.cache.rag")

class RagCache:
    def __init__(self, default_ttl_sec: int = 1800):
        self.default_ttl = default_ttl_sec

    @staticmethod
    def compute_key(query: str, domain: str) -> str:
        raw = f"rag::{domain}::{query.strip().lower()}"
        hashed = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        return f"cache:rag:{hashed}"

    async def get(self, query: str, domain: str) -> Optional[List[str]]:
        try:
            client = await redis_manager.get_client()
            key = self.compute_key(query, domain)
            raw = await client.get(key)
            if raw:
                logger.info(f"RAG Cache HIT for domain {domain}")
                return json.loads(raw)
            return None
        except Exception as e:
            logger.warning(f"RagCache.get failed: {e}")
            return None

    async def set(self, query: str, domain: str, chunks: List[str], ttl: Optional[int] = None) -> bool:
        try:
            client = await redis_manager.get_client()
            key = self.compute_key(query, domain)
            await client.set(key, json.dumps(chunks), ex=ttl or self.default_ttl)
            return True
        except Exception as e:
            logger.warning(f"RagCache.set failed: {e}")
            return False

rag_cache = RagCache()
