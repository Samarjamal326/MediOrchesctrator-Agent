"""
Output Safety Guardrails
========================
Validates LLM responses AFTER generation but BEFORE returning to the user.
Checks:
  - Mandatory clinical disclaimer present
  - Specific dosage hallucinations flagged
  - Dangerous drug-interaction mentions flagged
  - Disclaimer appended if missing
"""

import re
from dataclasses import dataclass, field
from typing import List


# ---------------------------------------------------------------------------
# Disclaimer patterns & canonical disclaimer text
# ---------------------------------------------------------------------------
_DISCLAIMER_PATTERNS = [
    r"consult\s+(a|your|the)?\s*(doctor|physician|healthcare\s+provider|medical\s+professional|specialist|clinician)",
    r"seek\s+(medical|professional|immediate)\s+(attention|advice|help|care)",
    r"this\s+is\s+not\s+(a\s+substitute\s+for|medical)\s+(professional\s+)?advice",
    r"not\s+a\s+substitute\s+for\s+(professional\s+)?medical\s+(advice|care)",
    r"speak\s+(to|with)\s+(a|your)\s+(doctor|physician|provider)",
    r"please\s+consult",
    r"medical\s+disclaimer",
    r"always\s+consult",
]
_DISCLAIMER_RE = [re.compile(p, re.IGNORECASE) for p in _DISCLAIMER_PATTERNS]

MANDATORY_DISCLAIMER = (
    "\n\n---\n"
    "⚕️ **Medical Disclaimer:** This information is for educational purposes only and is not a "
    "substitute for professional medical advice, diagnosis, or treatment. "
    "Always consult a qualified healthcare provider before making any medical decisions."
)


# ---------------------------------------------------------------------------
# Dosage patterns — specific mg/mcg/mL/unit amounts that could be hallucinated
# ---------------------------------------------------------------------------
_DOSAGE_PATTERNS = [
    # e.g. "500mg", "250 mg", "0.5 mcg", "10 mL", "1000 IU"
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|μg|g|mL|ml|IU|units?)\b",
    # Specific "Take X tablets / capsules"
    r"\btake\s+\d+\s+(?:tablet|capsule|pill|drop|unit)s?\b",
    # "X times a day / per day"
    r"\b\d+\s+times?\s+(a|per)\s+day\b",
    # "every X hours"
    r"\bevery\s+\d+\s+hours?\b",
]
_DOSAGE_RE = [re.compile(p, re.IGNORECASE) for p in _DOSAGE_PATTERNS]

# Phrases that make dosage mentions safe (e.g., standard reference ranges)
_SAFE_DOSAGE_CONTEXT = [
    r"recommended\s+daily\s+(allowance|intake|value)",
    r"reference\s+range",
    r"normal\s+range",
    r"typical\s+dose\s+(range|is\s+typically)",
    r"as\s+(prescribed|directed)\s+by",
]
_SAFE_DOSAGE_RE = [re.compile(p, re.IGNORECASE) for p in _SAFE_DOSAGE_CONTEXT]


# ---------------------------------------------------------------------------
# Drug interaction patterns
# ---------------------------------------------------------------------------
_DRUG_INTERACTION_PAIRS = [
    # Format: (drug_a_pattern, drug_b_pattern, warning)
    (r"\bwarfarin\b", r"\b(aspirin|ibuprofen|naproxen|NSAIDs?)\b",
     "Warfarin + NSAIDs/Aspirin: increased bleeding risk — flag for review"),
    (r"\bMAOI\b|monoamine\s+oxidase\s+inhibitor", r"\bSSRI\b|serotonin\b|fluoxetine|sertraline",
     "MAOI + SSRI: risk of serotonin syndrome — flag for review"),
    (r"\bmetformin\b", r"\biodine\s+contrast\b|\bcontrast\s+dye\b",
     "Metformin + iodine contrast: risk of lactic acidosis — flag for review"),
    (r"\bstatins?\b|atorvastatin|simvastatin|rosuvastatin", r"\bfibrates?\b|gemfibrozil",
     "Statin + Fibrate: risk of rhabdomyolysis — flag for review"),
    (r"\bACE\s+inhibitor|lisinopril|enalapril", r"\bpotassium\b|\bspironolactone\b",
     "ACE inhibitor + potassium/spironolactone: risk of hyperkalemia — flag for review"),
    (r"\bdigoxin\b", r"\bamiodarone\b|verapamil|diltiazem",
     "Digoxin + amiodarone/verapamil: digoxin toxicity risk — flag for review"),
]


# ---------------------------------------------------------------------------
# Data Classes
# ---------------------------------------------------------------------------
@dataclass
class OutputSafetyResult:
    is_safe: bool
    modified_response: str
    issues: List[str] = field(default_factory=list)
    disclaimer_added: bool = False
    dosage_flags: List[str] = field(default_factory=list)
    interaction_flags: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Core Functions
# ---------------------------------------------------------------------------

def check_disclaimer_present(response: str) -> bool:
    """Returns True if the response already contains an adequate clinical disclaimer."""
    for pattern in _DISCLAIMER_RE:
        if pattern.search(response):
            return True
    return False


def detect_specific_dosages(response: str) -> List[str]:
    """
    Returns a list of flagged dosage strings found in the response.
    Skips matches that appear in safe/reference contexts.
    """
    flags: List[str] = []
    for pattern in _DOSAGE_RE:
        for match in pattern.finditer(response):
            # Check surrounding context (±80 chars) for safe phrases
            start = max(0, match.start() - 80)
            end = min(len(response), match.end() + 80)
            context_window = response[start:end]
            is_safe_context = any(sp.search(context_window) for sp in _SAFE_DOSAGE_RE)
            if not is_safe_context:
                flags.append(match.group(0).strip())
    return list(set(flags))  # deduplicate


def check_drug_interactions(response: str) -> List[str]:
    """
    Checks for known dangerous drug interaction mentions in the response.
    Returns a list of warning strings.
    """
    warnings: List[str] = []
    for drug_a, drug_b, warning in _DRUG_INTERACTION_PAIRS:
        if re.search(drug_a, response, re.IGNORECASE) and re.search(drug_b, response, re.IGNORECASE):
            warnings.append(warning)
    return warnings


def append_mandatory_disclaimer(response: str) -> str:
    """Appends the mandatory medical disclaimer if not already present."""
    if not check_disclaimer_present(response):
        return response + MANDATORY_DISCLAIMER
    return response


def validate_output(query: str, response: str) -> OutputSafetyResult:
    """
    Full output safety validation pipeline:
    1. Check for mandatory disclaimer — append if missing
    2. Detect specific dosage hallucinations
    3. Check for dangerous drug interactions
    4. Determine overall safety status and collect issues

    Always returns a (potentially modified) response — never blocks output entirely.
    """
    issues: List[str] = []
    is_safe = True

    # --- Step 1: Disclaimer check & append ---
    had_disclaimer = check_disclaimer_present(response)
    modified_response = append_mandatory_disclaimer(response)
    disclaimer_added = not had_disclaimer

    # --- Step 2: Dosage detection ---
    dosage_flags = detect_specific_dosages(response)
    if dosage_flags:
        is_safe = False
        issues.append(
            f"Response contains specific dosage values ({', '.join(dosage_flags[:5])}). "
            "These should be verified against clinical guidelines before actioning."
        )
        # Append a dosage caution inline if dosages flagged
        if "dosage" not in modified_response.lower()[-300:]:
            modified_response += (
                "\n\n> ⚠️ **Dosage Note:** Specific doses mentioned above are for informational reference only. "
                "Actual dosing must be determined by your prescribing clinician based on your individual circumstances."
            )

    # --- Step 3: Drug interaction check ---
    interaction_flags = check_drug_interactions(response)
    if interaction_flags:
        is_safe = False
        for warn in interaction_flags:
            issues.append(f"Drug interaction detected: {warn}")
        modified_response += (
            "\n\n> ⚠️ **Drug Interaction Alert:** One or more potentially significant drug interactions "
            "were identified in this response. Please consult your pharmacist or physician before "
            "combining these medications."
        )

    return OutputSafetyResult(
        is_safe=is_safe,
        modified_response=modified_response,
        issues=issues,
        disclaimer_added=disclaimer_added,
        dosage_flags=dosage_flags,
        interaction_flags=interaction_flags,
    )
