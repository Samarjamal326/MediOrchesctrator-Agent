from typing import Dict, Optional
from prompts.general_medicine import GENERAL_MEDICINE_SYSTEM_PROMPT
from prompts.nutrition import NUTRITION_SYSTEM_PROMPT
from prompts.dermatology import DERMATOLOGY_SYSTEM_PROMPT
from prompts.dentistry import DENTISTRY_SYSTEM_PROMPT
from prompts.cardiology import CARDIOLOGY_SYSTEM_PROMPT
from prompts.orthopedics import ORTHOPEDICS_SYSTEM_PROMPT
from prompts.neurology import NEUROLOGY_SYSTEM_PROMPT
from prompts.mental_health import MENTAL_HEALTH_SYSTEM_PROMPT
from prompts.pharmacy import PHARMACY_SYSTEM_PROMPT
from prompts.emergency import EMERGENCY_SYSTEM_PROMPT
from prompts.womens_health import WOMENS_HEALTH_SYSTEM_PROMPT
from prompts.pathology import PATHOLOGY_SYSTEM_PROMPT

PROMPT_REGISTRY: Dict[str, str] = {
    "general_medicine": GENERAL_MEDICINE_SYSTEM_PROMPT,
    "nutrition": NUTRITION_SYSTEM_PROMPT,
    "dermatology": DERMATOLOGY_SYSTEM_PROMPT,
    "dentistry": DENTISTRY_SYSTEM_PROMPT,
    "cardiology": CARDIOLOGY_SYSTEM_PROMPT,
    "orthopedics": ORTHOPEDICS_SYSTEM_PROMPT,
    "neurology": NEUROLOGY_SYSTEM_PROMPT,
    "mental_health": MENTAL_HEALTH_SYSTEM_PROMPT,
    "pharmacy": PHARMACY_SYSTEM_PROMPT,
    "emergency": EMERGENCY_SYSTEM_PROMPT,
    "womens_health": WOMENS_HEALTH_SYSTEM_PROMPT,
    "pathology": PATHOLOGY_SYSTEM_PROMPT,
}

def get_system_prompt(domain: str, default: Optional[str] = None) -> Optional[str]:
    if not domain:
        return default
    return PROMPT_REGISTRY.get(domain.strip().lower(), default)

__all__ = [
    "GENERAL_MEDICINE_SYSTEM_PROMPT",
    "NUTRITION_SYSTEM_PROMPT",
    "DERMATOLOGY_SYSTEM_PROMPT",
    "DENTISTRY_SYSTEM_PROMPT",
    "CARDIOLOGY_SYSTEM_PROMPT",
    "ORTHOPEDICS_SYSTEM_PROMPT",
    "NEUROLOGY_SYSTEM_PROMPT",
    "MENTAL_HEALTH_SYSTEM_PROMPT",
    "PHARMACY_SYSTEM_PROMPT",
    "EMERGENCY_SYSTEM_PROMPT",
    "WOMENS_HEALTH_SYSTEM_PROMPT",
    "PATHOLOGY_SYSTEM_PROMPT",
    "PROMPT_REGISTRY",
    "get_system_prompt",
]
