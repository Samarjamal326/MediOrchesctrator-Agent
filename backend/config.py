import os
from typing import List
from dotenv import load_dotenv

# Load common .env from the root of the project
root_dir = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(root_dir, ".env"))

class Settings:
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    OLLAMA_TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "60.0"))

    # Supabase Integration (falls back to local SQLite if empty)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Langfuse Observability
    LANGFUSE_PUBLIC_KEY: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    LANGFUSE_SECRET_KEY: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    LANGFUSE_HOST: str = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

    # Cloud LLM Provider Keys (system-level fallbacks — user keys take priority)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    ALLOWED_DOMAINS: List[str] = [
        "general_medicine",
        "nutrition",
        "dermatology",
        "dentistry",
        "cardiology",
        "orthopedics",
        "neurology",
        "mental_health",
        "pharmacy",
        "emergency",
        "womens_health",
        "pathology",
    ]
    DEFAULT_DOMAIN: str = "general_medicine"

settings = Settings()
