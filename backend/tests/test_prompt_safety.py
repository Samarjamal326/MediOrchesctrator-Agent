import asyncio
from prompts import get_system_prompt, GENERAL_MEDICINE_SYSTEM_PROMPT
from agents.general_medicine.agent import general_medicine_agent
from safety.response_validator import response_validator, SAFE_FALLBACK_DISCLAIMER
from core.orchestrator import query_orchestrator, UnsupportedDomainError

def test_prompt_management():
    prompt = get_system_prompt("general_medicine")
    assert prompt is not None
    assert "General Medicine AI Assistant" in prompt
    assert general_medicine_agent.system_prompt == prompt
    assert get_system_prompt("nonexistent") is None
    print("[PASS] Test 1: Prompt loading and assignment")

def test_safety_validator_rules():
    # 1. Normal safe response passes
    safe_query = "What causes mild tension headaches?"
    safe_response = (
        "Tension headaches are often related to stress, dehydration, or muscle strain. "
        "Stay hydrated and consider rest. Always consult a healthcare provider for persistent symptoms."
    )
    result = response_validator.validate(safe_query, safe_response)
    assert result.is_valid is True, f"Expected safe response to pass, got {result.reason}"

    # 2. Definitive diagnosis rejected
    diag_query = "I have a cough and fever."
    diag_response = "You definitely have acute bacterial pneumonia and must start antibiotics."
    res_diag = response_validator.validate(diag_query, diag_response)
    assert res_diag.is_valid is False
    assert "definitive diagnosis" in res_diag.reason.lower()
    assert res_diag.fallback_response == SAFE_FALLBACK_DISCLAIMER

    # 3. Dangerous instruction rejected
    danger_query = "Should I keep taking my blood pressure medicine?"
    danger_response = "Stop taking your prescribed medication immediately without calling your doctor."
    res_danger = response_validator.validate(danger_query, danger_response)
    assert res_danger.is_valid is False
    assert "unsafe medical advice" in res_danger.reason.lower()

    # 4. Emergency red flag without emergency guidance rejected
    redflag_query = "I have crushing chest pain and difficulty breathing."
    no_emergency_response = "Drink some warm herbal tea and rest in a comfortable chair."
    res_emergency = response_validator.validate(redflag_query, no_emergency_response)
    assert res_emergency.is_valid is False
    assert "emergency" in res_emergency.reason.lower()

    # 5. Emergency red flag WITH emergency guidance passes
    with_emergency_response = (
        "Crushing chest pain and difficulty breathing are potential medical emergencies. "
        "Please call 911 or go to the nearest emergency hospital immediately."
    )
    res_emergency_pass = response_validator.validate(redflag_query, with_emergency_response)
    assert res_emergency_pass.is_valid is True

    print("[PASS] Test 2: Safety validator rules and fallbacks")

async def test_orchestration_flow():
    # Test valid query through full orchestrator
    query = "What are the common non-emergency causes of seasonal allergies?"
    res = await query_orchestrator.run(query)
    assert res.domain == "general_medicine"
    assert len(res.response) > 0
    assert res.is_safe is True
    print("[PASS] Test 3: Full Query Orchestration flow with safety layer")

if __name__ == "__main__":
    test_prompt_management()
    test_safety_validator_rules()
    asyncio.run(test_orchestration_flow())
    print("\nALL UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!")
