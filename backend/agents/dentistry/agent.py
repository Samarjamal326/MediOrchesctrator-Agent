from agents.base_agent import BaseAgent
from prompts import get_system_prompt, DENTISTRY_SYSTEM_PROMPT

class DentistryAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("dentistry", default=DENTISTRY_SYSTEM_PROMPT)
        super().__init__(
            name="Dentistry & Oral Health Agent",
            domain="dentistry",
            system_prompt=prompt,
            temperature=0.6
        )

dentistry_agent = DentistryAgent()
