"""Clinical Query Preprocessor & Keyword Normalizer."""
import re

CLINICAL_ABBREVIATIONS = {
    "t2d": "type 2 diabetes",
    "htn": "hypertension",
    "copd": "chronic obstructive pulmonary disease",
    "tia": "transient ischaemic attack",
    "mi": "myocardial infarction",
    "afib": "atrial fibrillation",
    "gerd": "gastroesophageal reflux disease"
}

def normalize_clinical_query(query: str) -> str:
    cleaned = query.strip()
    words = cleaned.split()
    expanded = [CLINICAL_ABBREVIATIONS.get(w.lower().rstrip(",.?!"), w) for w in words]
    return " ".join(expanded)
