from backend.rag.query_preprocessor import normalize_clinical_query

def test_abbreviation_expansion():
    raw = "Patient diagnosed with t2d and severe htn"
    normalized = normalize_clinical_query(raw)
    assert "type 2 diabetes" in normalized
    assert "hypertension" in normalized
