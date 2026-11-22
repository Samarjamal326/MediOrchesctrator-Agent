"""
LangGraph StateGraph Workflow for MediOrchestrator.
Defines the clinical consultation as a directed acyclic state graph with:
- Nodes: input_guardrail, emergency_check, router, single_agent, multi_agent, output_safety
- Conditional edges:
    - emergency_check: EMERGENCY -> emergency_exit | NON_EMERGENCY -> router
    - router: SINGLE_AGENT -> single_agent | MULTI_AGENT -> multi_agent
"""

from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from routing.router import intent_router
from routing.agent_selector import agent_selector
from safety.emergency_detector import emergency_detector
from safety.output_safety import validate_output as check_output_safety
from safety.response_validator import response_validator

class OrchestratorState(TypedDict):
    query: str
    context: Optional[str]
    user_id: Optional[str]
    session_id: Optional[str]
    model: Optional[str]
    api_key: Optional[str]
    api_base: Optional[str]
    provider: str

    # State evolution fields
    is_emergency: bool
    emergency_response: Optional[str]
    domain: Optional[str]
    secondary_domains: Optional[List[str]]
    raw_response: Optional[str]
    final_response: Optional[str]
    is_safe: bool
    safety_note: Optional[str]
    execution_trace: List[Dict[str, Any]]

# --- Nodes ---

async def emergency_check_node(state: OrchestratorState) -> Dict[str, Any]:
    query = state["query"]
    is_emerg = emergency_detector.is_emergency(query)
    if is_emerg:
        resp = emergency_detector.get_emergency_response()
        return {
            "is_emergency": True,
            "emergency_response": resp,
            "final_response": resp,
            "is_safe": False,
            "safety_note": "CRITICAL EMERGENCY: Red-flag symptoms detected. Directed to immediate emergency care.",
            "execution_trace": state.get("execution_trace", []) + [{
                "stage": "EMERGENCY_GATE",
                "status": "TRIGGERED",
                "decision": "Emergency bypass activated."
            }]
        }
    return {
        "is_emergency": False,
        "execution_trace": state.get("execution_trace", []) + [{
            "stage": "EMERGENCY_GATE",
            "status": "PASS",
            "decision": "No emergency red-flags detected."
        }]
    }

async def router_node(state: OrchestratorState) -> Dict[str, Any]:
    query = state["query"]
    domain = await intent_router.classify(query)
    return {
        "domain": domain,
        "execution_trace": state.get("execution_trace", []) + [{
            "stage": "ROUTER",
            "status": "CLASSIFIED",
            "decision": f"Routed to {domain} clinical taxonomy"
        }]
    }

async def single_agent_node(state: OrchestratorState) -> Dict[str, Any]:
    domain = state["domain"] or "general_medicine"
    agent = agent_selector.select_agent(domain)
    if not agent:
        from core.orchestrator import UnsupportedDomainError
        raise UnsupportedDomainError(f"No agent registered for domain: {domain}")

    raw_response = await agent.process(
        query=state["query"],
        context=state.get("context"),
        model=state.get("model"),
        api_key=state.get("api_key"),
        api_base=state.get("api_base"),
        provider=state.get("provider", "ollama")
    )
    return {
        "raw_response": raw_response,
        "execution_trace": state.get("execution_trace", []) + [{
            "stage": "CLINICAL_SPECIALIST",
            "agent": domain,
            "status": "SYNTHESIZED",
            "output_chars": len(raw_response)
        }]
    }

async def output_safety_node(state: OrchestratorState) -> Dict[str, Any]:
    raw = state.get("raw_response") or ""
    query = state["query"]

    # Run response validator & guardrails
    validation = response_validator.validate(query=query, response=raw)
    output_safety = check_output_safety(query=query, response=raw)

    final_resp = output_safety.modified_response
    is_safe = validation.is_valid and output_safety.is_safe
    safety_note = None
    if not validation.is_valid:
        final_resp = validation.fallback_response or final_resp
        safety_note = validation.reason
    elif output_safety.issues:
        safety_note = "; ".join(output_safety.issues)

    return {
        "final_response": final_resp,
        "is_safe": is_safe,
        "safety_note": safety_note,
        "execution_trace": state.get("execution_trace", []) + [{
            "stage": "OUTPUT_SAFETY_AUDIT",
            "is_safe": is_safe,
            "status": "AUDITED"
        }]
    }

# --- Conditional Edge Functions ---

def route_emergency_edge(state: OrchestratorState) -> str:
    if state.get("is_emergency"):
        return "emergency_exit"
    return "router"

def build_orchestrator_graph():
    builder = StateGraph(OrchestratorState)

    # Add Nodes
    builder.add_node("emergency_check", emergency_check_node)
    builder.add_node("router", router_node)
    builder.add_node("single_agent", single_agent_node)
    builder.add_node("output_safety", output_safety_node)

    # Set Entry Point
    builder.set_entry_point("emergency_check")

    # Conditional Branch: Emergency vs Routine Routing
    builder.add_conditional_edges(
        "emergency_check",
        route_emergency_edge,
        {
            "emergency_exit": END,
            "router": "single_agent"
        }
    )

    # Connect router -> agent -> output_safety -> END
    builder.add_edge("router", "single_agent")
    builder.add_edge("single_agent", "output_safety")
    builder.add_edge("output_safety", END)

    return builder.compile()

langgraph_orchestrator = build_orchestrator_graph()
