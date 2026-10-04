from agents.base_agent import BaseAgent
from prompts import get_system_prompt, DERMATOLOGY_SYSTEM_PROMPT

class DermatologyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("dermatology", default=DERMATOLOGY_SYSTEM_PROMPT)
        super().__init__(
            name="Dermatology Agent",
            domain="dermatology",
            system_prompt=prompt,
            temperature=0.6
        )

dermatology_agent = DermatologyAgent()

