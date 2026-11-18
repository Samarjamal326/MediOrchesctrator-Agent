from agents.base_agent import BaseAgent
from prompts import get_system_prompt, CARDIOLOGY_SYSTEM_PROMPT

class CardiologyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("cardiology", default=CARDIOLOGY_SYSTEM_PROMPT)
        super().__init__(
            name="Cardiology Agent",
            domain="cardiology",
            system_prompt=prompt,
            temperature=0.5
        )

cardiology_agent = CardiologyAgent()
