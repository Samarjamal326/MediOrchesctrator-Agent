"""
Input Safety Guardrails
=======================
Performs PII redaction, prompt-injection detection, and jailbreak prevention
BEFORE the query reaches the orchestrator/LLM pipeline.
"""

import re
from dataclasses import dataclass, field
from typing import List, Tuple


# ---------------------------------------------------------------------------
# PII Patterns
# ---------------------------------------------------------------------------
_PII_PATTERNS: List[Tuple[str, str, str]] = [
    # (label, regex, replacement)
    ("SSN",        r"\b\d{3}-\d{2}-\d{4}\b",                              "[SSN REDACTED]"),
    ("CREDIT_CARD", r"\b(?:\d[ -]?){13,16}\b",                            "[CC REDACTED]"),
    ("PHONE",      r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE REDACTED]"),
    ("EMAIL",      r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", "[EMAIL REDACTED]"),
    # Date of Birth: common formats
    ("DOB",        r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b",
                   "[DOB REDACTED]"),
    # Medical Record / Patient ID
    ("MRN",        r"\b(?:MR|MRN|Patient\s?ID|ID)[:\s#]*\d{4,10}\b",     "[ID REDACTED]"),
    # ZIP codes (5-digit standalone)
    ("ZIP",        r"(?<!\d)\b\d{5}\b(?!\d)",                             "[ZIP REDACTED]"),
    # Full name heuristic: Capitalized First + Last
    ("NAME",       r"\b([A-Z][a-z]{1,20}) ([A-Z][a-z]{1,20})(?:\s[A-Z][a-z]{1,20})?\b", "[NAME REDACTED]"),
]

# Medical terms that look like proper nouns — prevent false-positive name redaction
_MEDICAL_PROPER_NOUNS = {
    "Type Diabetes", "Blood Pressure", "Heart Rate", "Blood Sugar",
    "Emergency Room", "Urgent Care", "Medical Center", "Health System",
    "Chest Pain", "Joint Pain", "Back Pain", "Head Ache",
}

# ---------------------------------------------------------------------------
# Injection / Jailbreak Patterns
# ---------------------------------------------------------------------------
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)",
    r"disregard\s+(all\s+)?(previous|prior|system)\s+",
    r"forget\s+(all\s+)?(previous|prior|your)\s+",
    r"you\s+are\s+now\s+(a|an|the)\s+",
    r"act\s+as\s+(if\s+you\s+(are|were)|a|an)\s+",
    r"pretend\s+(you\s+are|to\s+be)\s+",
    r"role\s*play\s+as\s+",
    r"simulate\s+(being|a|an)\s+",
    r"\bDAN\b", r"\bjailbreak\b", r"\bdo\s+anything\s+now\b",
    r"developer\s+mode",
    r"enable\s+(unrestricted|unsafe|unfiltered)\s+mode",
    r"bypass\s+(safety|filter|restriction|guideline)",
    r"override\s+(safety|filter|restriction)",
    r"reveal\s+(your\s+)?(system\s+)?prompt",
    r"print\s+(your\s+)?(system\s+)?prompt",
    r"what\s+(are|is)\s+your\s+(system\s+)?instructions",
]

_INJECTION_RE = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _INJECTION_PATTERNS]


# ---------------------------------------------------------------------------
# Data Classes
# ---------------------------------------------------------------------------
@dataclass
class InputSafetyResult:
    is_safe: bool
    redacted_query: str
    pii_found: List[str] = field(default_factory=list)
    injection_detected: bool = False
    reason: str = ""


# ---------------------------------------------------------------------------
# Core Functions
# ---------------------------------------------------------------------------

def redact_pii(query: str) -> Tuple[str, List[str]]:
    """
    Redact PII from query text.
    Returns (redacted_text, list_of_pii_labels_found).
    """
    found: List[str] = []
    text = query

    for label, pattern, replacement in _PII_PATTERNS:
        if label == "NAME":
            def replace_name(m: re.Match, _found=found, _repl=replacement) -> str:
                matched = m.group(0)
                for safe in _MEDICAL_PROPER_NOUNS:
                    if safe.lower() in matched.lower():
                        return matched
                _found.append("NAME")
                return _repl
            text = re.sub(pattern, replace_name, text)
        else:
            compiled = re.compile(pattern, re.IGNORECASE)
            new_text, n = compiled.subn(replacement, text)
            if n > 0:
                found.append(label)
            text = new_text

    # De-duplicate labels while preserving order
    seen = set()
    unique_found = []
    for lbl in found:
        if lbl not in seen:
            seen.add(lbl)
            unique_found.append(lbl)

    return text, unique_found


def detect_injection(query: str) -> bool:
    """Returns True if the query contains prompt-injection or jailbreak patterns."""
    for pattern in _INJECTION_RE:
        if pattern.search(query):
            return True
    return False


def validate_input(query: str) -> InputSafetyResult:
    """
    Full input safety check pipeline:
    1. Detect prompt injection / jailbreak → reject immediately
    2. Redact PII from query text

    Returns InputSafetyResult with is_safe=False if injection detected,
    otherwise is_safe=True with the (possibly redacted) query.
    """
    if not query or not query.strip():
        return InputSafetyResult(
            is_safe=False,
            redacted_query="",
            reason="Empty query."
        )

    # --- Step 1: Injection detection (before any redaction) ---
    if detect_injection(query):
        return InputSafetyResult(
            is_safe=False,
            redacted_query=query,
            injection_detected=True,
            reason=(
                "Your message contains instructions that attempt to override system guidelines. "
                "This is not permitted in a clinical context. Please rephrase your medical question."
            )
        )

    # --- Step 2: PII Redaction ---
    redacted, pii_labels = redact_pii(query)

    return InputSafetyResult(
        is_safe=True,
        redacted_query=redacted,
        pii_found=pii_labels,
        reason="" if not pii_labels else f"PII redacted: {', '.join(pii_labels)}"
    )
