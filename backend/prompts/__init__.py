from typing import Dict, Optional
from prompts.general_medicine import GENERAL_MEDICINE_SYSTEM_PROMPT

PROMPT_REGISTRY: Dict[str, str] = {
    "general_medicine": GENERAL_MEDICINE_SYSTEM_PROMPT
}

def get_system_prompt(domain: str, default: Optional[str] = None) -> Optional[str]:
    if not domain:
        return default
    return PROMPT_REGISTRY.get(domain.strip().lower(), default)

__all__ = [
    "GENERAL_MEDICINE_SYSTEM_PROMPT",
    "PROMPT_REGISTRY",
    "get_system_prompt"
]
