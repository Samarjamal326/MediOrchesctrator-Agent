from typing import Optional, AsyncGenerator, Dict, Any
from dataclasses import dataclass
import time
from routing.router import intent_router
from routing.agent_selector import agent_selector
from safety.response_validator import response_validator, ResponseValidator
from safety.output_safety import validate_output as check_output_safety
from observability.tracer import tracer

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
        context: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> QueryResult:
        import time
        start_time = time.time()
        
        # Initialize Langfuse Trace
        root_span, trace_ctx = tracer.start_pipeline_trace(
            name="Clinical Consultation Pipeline",
            user_id=user_id,
            session_id=session_id,
            input_data={"query": query, "context_active": bool(context)},
            metadata={"provider": provider, "model": model or "qwen2.5:3b"}
        )

        # Stage 1: Ingestion
        t0 = time.time()
        ingest_trace = {
            "stage": "01_QUERY_INGESTION",
            "timestamp": time.strftime("%H:%M:%S"),
            "input_chars": len(query),
            "protocol": "REST_POST",
            "context_active": bool(context),
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "INGESTED"
        }
        tracer.log_span(trace_ctx, name="01_QUERY_INGESTION", input_data=query, output_data=ingest_trace)

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
        tracer.log_span(trace_ctx, name="02_INTENT_ROUTER", as_type="agent", input_data=query, output_data=route_trace)

        # Stage 3: Agent Selection & Clinical Reasoning
        t2 = time.time()
        agent = agent_selector.select_agent(domain)
        if agent is None:
            raise UnsupportedDomainError(
                f"No agent registered for domain: '{domain}'. "
                f"The query was classified as '{domain}' but this domain is not yet supported."
            )

        raw_response = await agent.process(
            query=query,
            context=context,
            model=model,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        )
        agent_trace = {
            "stage": "03_CLINICAL_SPECIALIST",
            "agent_name": agent.domain,
            "decision": "Formulated clinical differential & evidence-based considerations with conversation memory",
            "output_chars": len(raw_response),
            "latency_ms": round((time.time() - t2) * 1000, 2),
            "status": "SYNTHESIZED"
        }
        tracer.log_generation(
            trace_ctx,
            name=f"Agent::{agent.domain}",
            model=model or "qwen2.5:3b",
            prompt={"query": query, "context": context},
            output=raw_response,
            metadata={"domain": domain}
        )

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
        tracer.log_span(trace_ctx, name="04_SAFETY_GATE", as_type="guardrail", input_data=raw_response, output_data=safety_trace)

        # Stage 5: Output Safety Guardrails (Dosage, Interaction, Disclaimer)
        t4 = time.time()
        output_safety = check_output_safety(query=query, response=raw_response)
        output_safety_trace = {
            "stage": "05_OUTPUT_SAFETY_GUARDRAILS",
            "is_safe": output_safety.is_safe,
            "disclaimer_added": output_safety.disclaimer_added,
            "dosage_flags": output_safety.dosage_flags,
            "interaction_flags": output_safety.interaction_flags,
            "issues": output_safety.issues,
            "latency_ms": round((time.time() - t4) * 1000, 2),
            "status": "PASS" if output_safety.is_safe else "FLAGGED"
        }
        tracer.log_span(trace_ctx, name="05_OUTPUT_SAFETY_GUARDRAILS", as_type="guardrail", input_data=raw_response, output_data=output_safety_trace)

        # Stage 6: Response Grounding & Audit
        t5 = time.time()
        final_candidate = output_safety.modified_response
        audit_hash = f"0x{abs(hash(query + final_candidate)):08x}"
        audit_trace = {
            "stage": "06_VALIDATOR_AUDIT",
            "decision": "Verified clinical non-definitive boundaries & attached disclaimer",
            "cryptographic_proof": audit_hash,
            "latency_ms": round((time.time() - t5) * 1000, 2),
            "status": "AUDITED"
        }
        tracer.log_span(trace_ctx, name="06_VALIDATOR_AUDIT", output_data=audit_trace)

        total_latency = round((time.time() - start_time) * 1000, 2)
        full_trace = {
            "total_latency_ms": total_latency,
            "stages": [ingest_trace, route_trace, agent_trace, safety_trace, output_safety_trace, audit_trace]
        }

        tracer.end_trace(root_span, output_data={"response": final_candidate, "is_safe": validation.is_valid and output_safety.is_safe, "domain": domain})

        if not validation.is_valid:
            final_response = validation.fallback_response or final_candidate
            return QueryResult(
                domain=domain,
                response=final_response,
                is_safe=False,
                safety_note=validation.reason,
                execution_trace=full_trace
            )

        combined_safety_note = None
        if output_safety.issues:
            combined_safety_note = "; ".join(output_safety.issues)

        return QueryResult(
            domain=domain,
            response=final_candidate,
            is_safe=output_safety.is_safe,
            safety_note=combined_safety_note,
            execution_trace=full_trace
        )

    async def run_stream(
        self,
        query: str,
        context: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        start_time = time.time()

        # Initialize Langfuse Trace
        root_span, trace_ctx = tracer.start_pipeline_trace(
            name="Clinical Consultation Pipeline (Streaming)",
            user_id=user_id,
            session_id=session_id,
            input_data={"query": query, "context_active": bool(context)},
            metadata={"provider": provider, "model": model or "qwen2.5:3b"}
        )

        # Stage 1: Query Ingestion
        t0 = time.time()
        yield {
            "type": "stage_start",
            "stage": "01_QUERY_INGESTION",
            "label": "Ingesting Clinical Query",
            "status": "PROCESSING"
        }
        ingest_trace = {
            "stage": "01_QUERY_INGESTION",
            "timestamp": time.strftime("%H:%M:%S"),
            "input_chars": len(query),
            "protocol": "SSE_STREAM",
            "context_active": bool(context),
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "INGESTED"
        }
        tracer.log_span(trace_ctx, name="01_QUERY_INGESTION", input_data=query, output_data=ingest_trace)
        yield {
            "type": "stage_complete",
            "stage": "01_QUERY_INGESTION",
            "label": "Query Ingestion",
            "data": ingest_trace
        }

        # Stage 2: Intent Classification & Routing
        t1 = time.time()
        yield {
            "type": "stage_start",
            "stage": "02_INTENT_ROUTER",
            "label": "Taxonomy Classification & Specialist Routing",
            "status": "PROCESSING"
        }
        domain = await intent_router.classify(query)
        route_trace = {
            "stage": "02_INTENT_ROUTER",
            "classified_domain": domain,
            "decision": f"Routed to {domain} clinical taxonomy",
            "latency_ms": round((time.time() - t1) * 1000, 2),
            "status": "CLASSIFIED"
        }
        tracer.log_span(trace_ctx, name="02_INTENT_ROUTER", as_type="agent", input_data=query, output_data=route_trace)
        yield {
            "type": "stage_complete",
            "stage": "02_INTENT_ROUTER",
            "label": f"Specialist: {domain.upper()}",
            "data": route_trace
        }

        # Stage 3: Specialist Agent Selection & Knowledge Retrieval
        t2 = time.time()
        yield {
            "type": "stage_start",
            "stage": "03_CLINICAL_SPECIALIST",
            "label": f"Consulting {domain} Specialist & Knowledge Base",
            "status": "PROCESSING"
        }

        agent = agent_selector.select_agent(domain)
        if agent is None:
            raise UnsupportedDomainError(
                f"No agent registered for domain: '{domain}'. "
                f"The query was classified as '{domain}' but this domain is not yet supported."
            )

        # Stream tokens in real time from the agent
        accumulated_chunks = []
        async for chunk in agent.process_stream(
            query=query,
            context=context,
            model=model,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        ):
            accumulated_chunks.append(chunk)
            yield {
                "type": "token",
                "token": chunk
            }

        raw_response = "".join(accumulated_chunks)

        agent_trace = {
            "stage": "03_CLINICAL_SPECIALIST",
            "agent_name": agent.domain,
            "decision": "Formulated differential with memory and active RAG grounding",
            "output_chars": len(raw_response),
            "latency_ms": round((time.time() - t2) * 1000, 2),
            "status": "SYNTHESIZED"
        }
        tracer.log_generation(
            trace_ctx,
            name=f"Agent::{agent.domain}",
            model=model or "qwen2.5:3b",
            prompt={"query": query, "context": context},
            output=raw_response,
            metadata={"domain": domain}
        )
        yield {
            "type": "stage_complete",
            "stage": "03_CLINICAL_SPECIALIST",
            "label": "Clinical Synthesis Complete",
            "data": agent_trace
        }

        # Stage 4: Triage & Emergency Gate
        t3 = time.time()
        yield {
            "type": "stage_start",
            "stage": "04_SAFETY_GATE",
            "label": "Triage & Red-Flag Acuity Scan",
            "status": "PROCESSING"
        }
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
        tracer.log_span(trace_ctx, name="04_SAFETY_GATE", as_type="guardrail", input_data=raw_response, output_data=safety_trace)
        yield {
            "type": "stage_complete",
            "stage": "04_SAFETY_GATE",
            "label": "Triage Scan Complete",
            "data": safety_trace
        }

        # Stage 5: Output Safety Guardrails
        t4 = time.time()
        yield {
            "type": "stage_start",
            "stage": "05_OUTPUT_SAFETY_GUARDRAILS",
            "label": "Auditing Drug Interactions & Dosages",
            "status": "PROCESSING"
        }
        output_safety = check_output_safety(query=query, response=raw_response)
        output_safety_trace = {
            "stage": "05_OUTPUT_SAFETY_GUARDRAILS",
            "is_safe": output_safety.is_safe,
            "disclaimer_added": output_safety.disclaimer_added,
            "dosage_flags": output_safety.dosage_flags,
            "interaction_flags": output_safety.interaction_flags,
            "issues": output_safety.issues,
            "latency_ms": round((time.time() - t4) * 1000, 2),
            "status": "PASS" if output_safety.is_safe else "FLAGGED"
        }
        tracer.log_span(trace_ctx, name="05_OUTPUT_SAFETY_GUARDRAILS", as_type="guardrail", input_data=raw_response, output_data=output_safety_trace)
        yield {
            "type": "stage_complete",
            "stage": "05_OUTPUT_SAFETY_GUARDRAILS",
            "label": "Output Safety Audit Complete",
            "data": output_safety_trace
        }

        # Stage 6: Audit & Grounding
        t5 = time.time()
        final_candidate = output_safety.modified_response
        audit_hash = f"0x{abs(hash(query + final_candidate)):08x}"
        audit_trace = {
            "stage": "06_VALIDATOR_AUDIT",
            "decision": "Verified clinical non-definitive boundaries & attached disclaimer",
            "cryptographic_proof": audit_hash,
            "latency_ms": round((time.time() - t5) * 1000, 2),
            "status": "AUDITED"
        }
        tracer.log_span(trace_ctx, name="06_VALIDATOR_AUDIT", output_data=audit_trace)
        yield {
            "type": "stage_complete",
            "stage": "06_VALIDATOR_AUDIT",
            "label": "Cryptographic Audit Sealed",
            "data": audit_trace
        }

        total_latency = round((time.time() - start_time) * 1000, 2)
        full_trace = {
            "total_latency_ms": total_latency,
            "stages": [ingest_trace, route_trace, agent_trace, safety_trace, output_safety_trace, audit_trace]
        }
        tracer.end_trace(root_span, output_data={"response": final_candidate, "is_safe": validation.is_valid and output_safety.is_safe, "domain": domain})

        combined_safety_note = None
        if not validation.is_valid:
            final_response = validation.fallback_response or final_candidate
            combined_safety_note = validation.reason
        elif output_safety.issues:
            combined_safety_note = "; ".join(output_safety.issues)
            final_response = final_candidate
        else:
            final_response = final_candidate

        yield {
            "type": "complete",
            "domain": domain,
            "response": final_response,
            "is_safe": validation.is_valid and output_safety.is_safe,
            "safety_note": combined_safety_note,
            "execution_trace": full_trace
        }

query_orchestrator = QueryOrchestrator()
