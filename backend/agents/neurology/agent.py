from agents.base_agent import BaseAgent
from prompts import get_system_prompt, NEUROLOGY_SYSTEM_PROMPT

class NeurologyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("neurology", default=NEUROLOGY_SYSTEM_PROMPT)
        super().__init__(
            name="Neurology Agent",
            domain="neurology",
            system_prompt=prompt,
            temperature=0.5
        )

neurology_agent = NeurologyAgent()
