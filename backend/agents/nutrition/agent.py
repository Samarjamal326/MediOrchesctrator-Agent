from agents.base_agent import BaseAgent
from prompts import get_system_prompt, NUTRITION_SYSTEM_PROMPT

class NutritionAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("nutrition", default=NUTRITION_SYSTEM_PROMPT)
        super().__init__(
            name="Nutrition & Metabolic Agent",
            domain="nutrition",
            system_prompt=prompt,
            temperature=0.6
        )

nutrition_agent = NutritionAgent()

