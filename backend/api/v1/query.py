import json
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from core.llm import OllamaServiceError
from core.orchestrator import query_orchestrator, UnsupportedDomainError
from core.memory import ConversationMemory
from safety.input_safety import validate_input as check_input_safety
from config import settings

router = APIRouter(prefix="/v1", tags=["Query"])

class QueryRequest(BaseModel):
    query: str
    user_id: str | None = "default_patient"
    conversation_id: str | None = None
    model: str | None = None
    api_key: str | None = None
    api_base: str | None = None
    provider: str | None = "ollama"

class QueryResponse(BaseModel):
    conversation_id: str
    domain: str
    response: str
    is_safe: bool = True
    safety_note: str | None = None
    pii_redacted: bool = False
    execution_trace: dict | None = None

@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    user_id = request.user_id or "default_patient"
    conv_id = request.conversation_id

    # ── Option B: Input Safety Gate ─────────────────────────────────────────
    input_safety = check_input_safety(request.query)
    if not input_safety.is_safe:
        # Injection / jailbreak detected → reject immediately (no memory write)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=input_safety.reason or "Input failed safety check."
        )
    # Use the (possibly PII-redacted) query for all downstream processing
    safe_query = input_safety.redacted_query

    # ── Option C: System API key fallback (if user didn't provide a key) ────
    effective_api_key = request.api_key
    effective_provider = request.provider or "ollama"
    effective_model = request.model

    if not effective_api_key or not effective_api_key.strip():
        # Auto-inject system keys by provider preference: Groq → Gemini → OpenAI → Ollama
        if settings.GROQ_API_KEY:
            effective_api_key = settings.GROQ_API_KEY
            effective_provider = "groq"
            effective_model = effective_model or "llama-3.3-70b-versatile"
        elif settings.GEMINI_API_KEY:
            effective_api_key = settings.GEMINI_API_KEY
            effective_provider = "gemini"
            effective_model = effective_model or "gemini-2.0-flash"
        elif settings.OPENAI_API_KEY:
            effective_api_key = settings.OPENAI_API_KEY
            effective_provider = "openai"
            effective_model = effective_model or "gpt-4o-mini"
        # else: falls through to Ollama (no key needed)

    # If no conversation_id, create a new conversation thread
    if not conv_id:
        title = safe_query[:45].strip() + ("..." if len(safe_query) > 45 else "")
        new_conv = ConversationMemory.create_conversation(user_id=user_id, title=title)
        conv_id = new_conv["id"]
    else:
        existing = ConversationMemory.get_conversation(conv_id)
        if not existing:
            title = safe_query[:45].strip() + ("..." if len(safe_query) > 45 else "")
            new_conv = ConversationMemory.create_conversation(user_id=user_id, title=title)
            conv_id = new_conv["id"]

    # 1. Fetch recent conversation context for LLM multi-turn memory
    prior_context = ConversationMemory.get_recent_context(conversation_id=conv_id, limit=6)

    # 2. Record the incoming query (using safe_query to prevent storing raw PII) in memory
    ConversationMemory.add_message(
        conversation_id=conv_id,
        user_id=user_id,
        role="user",
        content=safe_query
    )

    try:
        result = await query_orchestrator.run(
            query=safe_query,
            context=prior_context if prior_context else None,
            user_id=user_id,
            session_id=conv_id,
            model=effective_model,
            api_key=effective_api_key,
            api_base=request.api_base,
            provider=effective_provider
        )

        trace_json = json.dumps(result.execution_trace) if result.execution_trace else None

        # 3. Record assistant response in memory
        ConversationMemory.add_message(
            conversation_id=conv_id,
            user_id=user_id,
            role="assistant",
            content=result.response,
            domain=result.domain,
            is_safe=result.is_safe,
            safety_note=result.safety_note,
            execution_trace=trace_json
        )

        return QueryResponse(
            conversation_id=conv_id,
            domain=result.domain,
            response=result.response,
            is_safe=result.is_safe,
            safety_note=result.safety_note,
            pii_redacted=bool(input_safety.pii_found),
            execution_trace=result.execution_trace
        )
    except UnsupportedDomainError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        )
    except OllamaServiceError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err)
        )
