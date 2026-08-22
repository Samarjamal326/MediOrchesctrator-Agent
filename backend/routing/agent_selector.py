from typing import Optional
from agents.base_agent import BaseAgent
from agents.registry import agent_registry, AgentRegistry

class AgentSelector:
    def __init__(self, registry: AgentRegistry = agent_registry):
        self.registry = registry

    def select_agent(self, domain: str) -> Optional[BaseAgent]:
        if not domain:
            return None
        return self.registry.get(domain)

    def is_supported(self, domain: str) -> bool:
        if not domain:
            return False
        return self.registry.has_domain(domain)

agent_selector = AgentSelector()
