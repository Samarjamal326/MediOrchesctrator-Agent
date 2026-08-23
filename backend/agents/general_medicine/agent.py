from agents.base_agent import BaseAgent
from prompts import get_system_prompt, GENERAL_MEDICINE_SYSTEM_PROMPT

class GeneralMedicineAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("general_medicine", default=GENERAL_MEDICINE_SYSTEM_PROMPT)
        super().__init__(
            name="General Medicine Agent",
            domain="general_medicine",
            system_prompt=prompt,
            temperature=0.6
        )

general_medicine_agent = GeneralMedicineAgent()
