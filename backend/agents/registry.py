from typing import Dict, List, Optional
from agents.base_agent import BaseAgent
from agents.general_medicine.agent import general_medicine_agent

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self) -> None:
        self.register(general_medicine_agent)

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
