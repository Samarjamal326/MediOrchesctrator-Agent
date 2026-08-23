from typing import Optional
from dataclasses import dataclass
from routing.router import intent_router
from routing.agent_selector import agent_selector
from safety.response_validator import response_validator, ResponseValidator

class UnsupportedDomainError(Exception):
    pass

@dataclass
class QueryResult:
    domain: str
    response: str
    is_safe: bool = True
    safety_note: Optional[str] = None

class QueryOrchestrator:
    def __init__(self, validator: ResponseValidator = response_validator):
        self.validator = validator

    async def run(self, query: str) -> QueryResult:
        domain = await intent_router.classify(query)

        agent = agent_selector.select_agent(domain)
        if agent is None:
            raise UnsupportedDomainError(
                f"No agent registered for domain: '{domain}'. "
                f"The query was classified as '{domain}' but this domain is not yet supported."
            )

        raw_response = await agent.process(query)

        validation = self.validator.validate(query=query, response=raw_response)

        if not validation.is_valid:
            final_response = validation.fallback_response or raw_response
            return QueryResult(
                domain=domain,
                response=final_response,
                is_safe=False,
                safety_note=validation.reason
            )

        return QueryResult(
            domain=domain,
            response=raw_response,
            is_safe=True
        )

query_orchestrator = QueryOrchestrator()
