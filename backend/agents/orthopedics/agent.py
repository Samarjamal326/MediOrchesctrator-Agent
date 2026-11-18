from agents.base_agent import BaseAgent
from prompts import get_system_prompt, ORTHOPEDICS_SYSTEM_PROMPT

class OrthopedicsAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("orthopedics", default=ORTHOPEDICS_SYSTEM_PROMPT)
        super().__init__(
            name="Orthopedics & Sports Medicine Agent",
            domain="orthopedics",
            system_prompt=prompt,
            temperature=0.6
        )

orthopedics_agent = OrthopedicsAgent()
