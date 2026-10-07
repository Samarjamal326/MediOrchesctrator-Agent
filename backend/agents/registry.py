from typing import Dict, List, Optional
from agents.base_agent import BaseAgent
from agents.general_medicine.agent import general_medicine_agent
from agents.nutrition.agent import nutrition_agent
from agents.dermatology.agent import dermatology_agent
from prompts import (
    DENTISTRY_SYSTEM_PROMPT,
    CARDIOLOGY_SYSTEM_PROMPT,
    ORTHOPEDICS_SYSTEM_PROMPT,
    NEUROLOGY_SYSTEM_PROMPT,
    MENTAL_HEALTH_SYSTEM_PROMPT,
    PHARMACY_SYSTEM_PROMPT,
    EMERGENCY_SYSTEM_PROMPT,
    WOMENS_HEALTH_SYSTEM_PROMPT,
    PATHOLOGY_SYSTEM_PROMPT,
)

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self) -> None:
        # Existing dedicated agent classes
        self.register(general_medicine_agent)
        self.register(nutrition_agent)
        self.register(dermatology_agent)

        # Register specialized agents initialized with their domain prompts
        specialized_agents = [
            BaseAgent(name="Dentistry & Oral Health Agent", domain="dentistry", system_prompt=DENTISTRY_SYSTEM_PROMPT, temperature=0.6),
            BaseAgent(name="Cardiology Agent", domain="cardiology", system_prompt=CARDIOLOGY_SYSTEM_PROMPT, temperature=0.5),
            BaseAgent(name="Orthopedics & Sports Medicine Agent", domain="orthopedics", system_prompt=ORTHOPEDICS_SYSTEM_PROMPT, temperature=0.6),
            BaseAgent(name="Neurology Agent", domain="neurology", system_prompt=NEUROLOGY_SYSTEM_PROMPT, temperature=0.5),
            BaseAgent(name="Mental Health & Behavioral Agent", domain="mental_health", system_prompt=MENTAL_HEALTH_SYSTEM_PROMPT, temperature=0.7),
            BaseAgent(name="Pharmacology & Therapeutics Agent", domain="pharmacy", system_prompt=PHARMACY_SYSTEM_PROMPT, temperature=0.4),
            BaseAgent(name="Emergency Medicine & Triage Agent", domain="emergency", system_prompt=EMERGENCY_SYSTEM_PROMPT, temperature=0.3),
            BaseAgent(name="Women's & Reproductive Health Agent", domain="womens_health", system_prompt=WOMENS_HEALTH_SYSTEM_PROMPT, temperature=0.6),
            BaseAgent(name="Pathology & Laboratory Medicine Agent", domain="pathology", system_prompt=PATHOLOGY_SYSTEM_PROMPT, temperature=0.4),
        ]

        for agent in specialized_agents:
            self.register(agent)

    def register(self, agent: BaseAgent) -> None:
        domain_key = agent.domain.strip().lower()
        self._agents[domain_key] = agent

    def get(self, domain: str) -> Optional[BaseAgent]:
        if not domain:
            return None
        domain_key = domain.strip().lower()
        return self._agents.get(domain_key)

    def list_domains(self) -> List[str]:
        return list(self._agents.keys())

    def has_domain(self, domain: str) -> bool:
        if not domain:
            return False
        domain_key = domain.strip().lower()
        return domain_key in self._agents

agent_registry = AgentRegistry()
