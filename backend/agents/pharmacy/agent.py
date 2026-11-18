from agents.base_agent import BaseAgent
from prompts import get_system_prompt, PHARMACY_SYSTEM_PROMPT

class PharmacyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("pharmacy", default=PHARMACY_SYSTEM_PROMPT)
        super().__init__(
            name="Pharmacology & Therapeutics Agent",
            domain="pharmacy",
            system_prompt=prompt,
            temperature=0.4
        )

pharmacy_agent = PharmacyAgent()
