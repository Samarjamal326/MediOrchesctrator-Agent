from agents.base_agent import BaseAgent
from prompts import get_system_prompt, WOMENS_HEALTH_SYSTEM_PROMPT

class WomensHealthAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("womens_health", default=WOMENS_HEALTH_SYSTEM_PROMPT)
        super().__init__(
            name="Women's & Reproductive Health Agent",
            domain="womens_health",
            system_prompt=prompt,
            temperature=0.6
        )

womens_health_agent = WomensHealthAgent()
