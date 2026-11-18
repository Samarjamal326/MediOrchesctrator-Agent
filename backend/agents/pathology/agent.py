from agents.base_agent import BaseAgent
from prompts import get_system_prompt, PATHOLOGY_SYSTEM_PROMPT

class PathologyAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("pathology", default=PATHOLOGY_SYSTEM_PROMPT)
        super().__init__(
            name="Pathology & Laboratory Medicine Agent",
            domain="pathology",
            system_prompt=prompt,
            temperature=0.4
        )

pathology_agent = PathologyAgent()
