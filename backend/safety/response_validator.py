import re
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ValidationResult:
    is_valid: bool
    reason: Optional[str] = None
    fallback_response: Optional[str] = None

SAFE_FALLBACK_DISCLAIMER = (
    "I cannot provide specific diagnostic or treatment instructions for this situation. "
    "Please consult a qualified healthcare professional or seek immediate emergency medical care "
    "if you are experiencing severe or worsening symptoms."
)

EMERGENCY_RED_FLAGS: List[str] = [
    "chest pain",
    "shortness of breath",
    "difficulty breathing",
    "cannot breathe",
    "severe bleeding",
    "heavy bleeding",
    "loss of consciousness",
    "passed out",
    "stroke symptoms",
    "face drooping",
    "slurred speech",
    "anaphylaxis",
    "throat closing",
    "suicidal",
    "overdose"
]

EMERGENCY_ADVICE_KEYWORDS: List[str] = [
    "emergency",
    "911",
    "urgent",
    "immediate medical",
    "hospital",
    "doctor",
    "healthcare provider",
    "seek medical"
]

DEFINITIVE_DIAGNOSIS_PATTERNS = [
    r"\byou (?:definitely|certainly|undoubtedly) have\b",
    r"\byou are suffering from [a-z\s]+ and (?:must|need to) take\b",
    r"\bi (?:hereby )?diagnose you with\b",
    r"\bmy diagnosis is that you have\b"
]

DANGEROUS_ADVICE_PATTERNS = [
    r"\bstop taking your (?:prescribed |prescription )?medication\b",
    r"\bdo not go to the (?:hospital|doctor|emergency)\b",
    r"\bdo not seek (?:medical|professional) (?:help|attention|care)\b",
    r"\bignore your doctor\b",
    r"\bno need to see a doctor\b"
]

class ResponseValidator:
    def __init__(self, fallback_message: str = SAFE_FALLBACK_DISCLAIMER):
        self.fallback_message = fallback_message

    def _contains_red_flag_query(self, query: str) -> bool:
        lower_query = query.lower()
        return any(flag in lower_query for flag in EMERGENCY_RED_FLAGS)

    def _contains_emergency_guidance(self, response: str) -> bool:
        lower_resp = response.lower()
        return any(keyword in lower_resp for keyword in EMERGENCY_ADVICE_KEYWORDS)

    def validate(self, query: str, response: str) -> ValidationResult:
        if not response or not response.strip():
            return ValidationResult(
                is_valid=False,
                reason="Empty response generated",
                fallback_response=self.fallback_message
            )

        lower_resp = response.lower()

        for pattern in DANGEROUS_ADVICE_PATTERNS:
            if re.search(pattern, lower_resp):
                return ValidationResult(
                    is_valid=False,
                    reason="Response contains unsafe medical advice",
                    fallback_response=self.fallback_message
                )

        for pattern in DEFINITIVE_DIAGNOSIS_PATTERNS:
            if re.search(pattern, lower_resp):
                return ValidationResult(
                    is_valid=False,
                    reason="Response claims definitive diagnosis",
                    fallback_response=self.fallback_message
                )

        if self._contains_red_flag_query(query) and not self._contains_emergency_guidance(response):
            return ValidationResult(
                is_valid=False,
                reason="Query contains emergency red flags but response lacks emergency guidance",
                fallback_response=(
                    "Your query describes potentially critical symptoms. "
                    "Please seek emergency medical attention (such as calling emergency services or visiting the nearest emergency department) immediately."
                )
            )

        return ValidationResult(is_valid=True)

response_validator = ResponseValidator()
