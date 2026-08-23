from typing import Optional
from dataclasses import dataclass
from routing.router import intent_router
from routing.agent_selector import agent_selector

class UnsupportedDomainError(Exception):
    pass

@dataclass
class QueryResult:
    domain: str
    response: str

class QueryOrchestrator:
    async def run(self, query: str) -> QueryResult:
        domain = await intent_router.classify(query)

        agent = agent_selector.select_agent(domain)

        if agent is None:
            raise UnsupportedDomainError(
                f"No agent registered for domain: '{domain}'. "
                f"The query was classified as '{domain}' but this domain is not yet supported."
            )

        response = await agent.process(query)

        return QueryResult(domain=domain, response=response)

query_orchestrator = QueryOrchestrator()
