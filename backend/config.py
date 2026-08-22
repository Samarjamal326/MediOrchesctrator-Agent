import os
from typing import List

class Settings:
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    OLLAMA_TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "60.0"))

    ALLOWED_DOMAINS: List[str] = ["general_medicine", "nutrition", "dermatology"]
    DEFAULT_DOMAIN: str = "general_medicine"

settings = Settings()
