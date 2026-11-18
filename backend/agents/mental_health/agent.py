from agents.base_agent import BaseAgent
from prompts import get_system_prompt, MENTAL_HEALTH_SYSTEM_PROMPT

class MentalHealthAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("mental_health", default=MENTAL_HEALTH_SYSTEM_PROMPT)
        super().__init__(
            name="Mental Health & Behavioral Agent",
            domain="mental_health",
            system_prompt=prompt,
            temperature=0.7
        )

mental_health_agent = MentalHealthAgent()
