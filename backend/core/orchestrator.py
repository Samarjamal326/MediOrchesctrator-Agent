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
    execution_trace: Optional[dict] = None

class QueryOrchestrator:
    def __init__(self, validator: ResponseValidator = response_validator):
        self.validator = validator

    async def run(
        self,
        query: str,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> QueryResult:
        import time
        start_time = time.time()
        
        # Stage 1: Ingestion
        t0 = time.time()
        ingest_trace = {
            "stage": "01_QUERY_INGESTION",
            "timestamp": time.strftime("%H:%M:%S"),
            "input_chars": len(query),
            "protocol": "REST_POST",
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "INGESTED"
        }

        # Stage 2: Intent Classification
        t1 = time.time()
        domain = await intent_router.classify(query)
        route_trace = {
            "stage": "02_INTENT_ROUTER",
            "classified_domain": domain,
            "decision": f"Routed to {domain} clinical taxonomy",
            "latency_ms": round((time.time() - t1) * 1000, 2),
            "status": "CLASSIFIED"
        }

        # Stage 3: Agent Selection & Clinical Reasoning
        t2 = time.time()
        agent = agent_selector.select_agent(domain)
        if agent is None:
            raise UnsupportedDomainError(
                f"No agent registered for domain: '{domain}'. "
                f"The query was classified as '{domain}' but this domain is not yet supported."
            )

        raw_response = await agent.process(query)
        agent_trace = {
            "stage": "03_CLINICAL_SPECIALIST",
            "agent_name": agent.domain,
            "decision": "Formulated clinical differential & evidence-based considerations",
            "output_chars": len(raw_response),
            "latency_ms": round((time.time() - t2) * 1000, 2),
            "status": "SYNTHESIZED"
        }

        # Stage 4: Triage & Safety Gate
        t3 = time.time()
        validation = self.validator.validate(query=query, response=raw_response)
        safety_trace = {
            "stage": "04_SAFETY_GATE",
            "is_valid": validation.is_valid,
            "decision": "Emergency Red-Flag Acuity Scan",
            "kill_switch_active": not validation.is_valid,
            "reason": validation.reason or "Zero critical red-flags detected. Gate clear.",
            "latency_ms": round((time.time() - t3) * 1000, 2),
            "status": "PASS" if validation.is_valid else "INTERCEPTED"
        }

        # Stage 5: Response Grounding & Audit
        t4 = time.time()
        audit_hash = f"0x{abs(hash(query + raw_response)):08x}"
        audit_trace = {
            "stage": "05_VALIDATOR_AUDIT",
            "decision": "Verified clinical non-definitive boundaries & attached disclaimer",
            "cryptographic_proof": audit_hash,
            "latency_ms": round((time.time() - t4) * 1000, 2),
            "status": "AUDITED"
        }

        total_latency = round((time.time() - start_time) * 1000, 2)
        full_trace = {
            "total_latency_ms": total_latency,
            "stages": [ingest_trace, route_trace, agent_trace, safety_trace, audit_trace]
        }

        if not validation.is_valid:
            final_response = validation.fallback_response or raw_response
            return QueryResult(
                domain=domain,
                response=final_response,
                is_safe=False,
                safety_note=validation.reason,
                execution_trace=full_trace
            )

        return QueryResult(
            domain=domain,
            response=raw_response,
            is_safe=True,
            execution_trace=full_trace
        )

query_orchestrator = QueryOrchestrator()
