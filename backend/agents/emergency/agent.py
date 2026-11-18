from agents.base_agent import BaseAgent
from prompts import get_system_prompt, EMERGENCY_SYSTEM_PROMPT

class EmergencyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("emergency", default=EMERGENCY_SYSTEM_PROMPT)
        super().__init__(
            name="Emergency Medicine & Triage Agent",
            domain="emergency",
            system_prompt=prompt,
            temperature=0.3
        )

emergency_agent = EmergencyAgent()
