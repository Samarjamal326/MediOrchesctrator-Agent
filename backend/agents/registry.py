from typing import Dict, List, Optional
from agents.base_agent import BaseAgent
from agents.general_medicine.agent import general_medicine_agent
from agents.nutrition.agent import nutrition_agent
from agents.dermatology.agent import dermatology_agent
from agents.dentistry.agent import dentistry_agent
from agents.cardiology.agent import cardiology_agent
from agents.orthopedics.agent import orthopedics_agent
from agents.neurology.agent import neurology_agent
from agents.mental_health.agent import mental_health_agent
from agents.pharmacy.agent import pharmacy_agent
from agents.emergency.agent import emergency_agent
from agents.womens_health.agent import womens_health_agent
from agents.pathology.agent import pathology_agent

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self) -> None:
        for agent in (
            general_medicine_agent,
            nutrition_agent,
            dermatology_agent,
            dentistry_agent,
            cardiology_agent,
            orthopedics_agent,
            neurology_agent,
            mental_health_agent,
            pharmacy_agent,
            emergency_agent,
            womens_health_agent,
            pathology_agent,
        ):
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
