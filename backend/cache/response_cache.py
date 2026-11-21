"""
Exact Key-Value Response Cache.
Uses SHA-256 of normalized user query to cache full LLM responses.
If repeated exact (or normalized) query comes in, returns instantly (< 5ms).
"""

import hashlib
import json
import logging
from typing import Optional, Dict, Any
from core.redis import redis_manager

logger = logging.getLogger("mediorchestrator.cache.response")

class ResponseCache:
    def __init__(self, default_ttl_sec: int = 3600):
        self.default_ttl = default_ttl_sec

    @staticmethod
    def compute_key(query: str, domain: Optional[str] = None) -> str:
        normalized = query.strip().lower()
        key_raw = f"{normalized}::{domain or 'any'}"
        hashed = hashlib.sha256(key_raw.encode("utf-8")).hexdigest()
        return f"cache:response:{hashed}"

    async def get(self, query: str, domain: Optional[str] = None) -> Optional[Dict[str, Any]]:
        try:
            client = await redis_manager.get_client()
            key = self.compute_key(query, domain)
            raw = await client.get(key)
            if raw:
                logger.info(f"Response cache HIT for query: '{query[:30]}...'")
                return json.loads(raw)
            return None
        except Exception as e:
            logger.warning(f"ResponseCache.get failed: {e}")
            return None

    async def set(self, query: str, payload: Dict[str, Any], domain: Optional[str] = None, ttl: Optional[int] = None) -> bool:
        try:
            client = await redis_manager.get_client()
            key = self.compute_key(query, domain)
            serialized = json.dumps(payload)
            ex = ttl or self.default_ttl
            await client.set(key, serialized, ex=ex)
            logger.info(f"Response cached under key {key[:25]}... (TTL: {ex}s)")
            return True
        except Exception as e:
            logger.warning(f"ResponseCache.set failed: {e}")
            return False

response_cache = ResponseCache()
