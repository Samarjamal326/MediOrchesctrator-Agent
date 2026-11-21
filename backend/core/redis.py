"""
Redis Connection Manager for MediOrchestrator.
Supports both async Redis client and an in-memory fallback dict
so development and testing work without a running Redis server.
"""

import os
import json
import logging
from typing import Optional, Any

logger = logging.getLogger("mediorchestrator.redis")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class InMemoryCacheFallback:
    """Fast in-memory cache mimicking redis.asyncio client methods."""
    def __init__(self):
        self._store = {}
        self._ttls = {}

    async def get(self, key: str) -> Optional[str]:
        return self._store.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self._store[key] = str(value)
        if ex:
            self._ttls[key] = ex
        return True

    async def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._store:
                del self._store[k]
                count += 1
        return count

    async def exists(self, key: str) -> int:
        return 1 if key in self._store else 0

    async def keys(self, pattern: str = "*") -> list[str]:
        import fnmatch
        return [k for k in self._store.keys() if fnmatch.fnmatch(k, pattern)]

    async def ping(self) -> bool:
        return True


class RedisManager:
    _instance: Optional['RedisManager'] = None
    _client = None
    _is_fallback: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisManager, cls).__new__(cls)
        return cls._instance

    async def get_client(self):
        if self._client is not None:
            return self._client

        try:
            import redis.asyncio as aioredis
            client = aioredis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=1.5,
                socket_timeout=1.5
            )
            await client.ping()
            self._client = client
            self._is_fallback = False
            logger.info(f"Connected to Redis at {REDIS_URL}")
        except Exception as err:
            logger.warning(f"Could not connect to Redis at {REDIS_URL} ({err}). Using in-memory cache fallback.")
            self._client = InMemoryCacheFallback()
            self._is_fallback = True

        return self._client

    @property
    def is_fallback(self) -> bool:
        return self._is_fallback


redis_manager = RedisManager()
