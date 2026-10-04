from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from core.orchestrator import query_orchestrator, UnsupportedDomainError

router = APIRouter(prefix="/v1", tags=["Query"])

class QueryRequest(BaseModel):
    query: str
    model: str | None = None
    api_key: str | None = None
    api_base: str | None = None
    provider: str | None = "ollama"

class QueryResponse(BaseModel):
    domain: str
    response: str
    is_safe: bool = True
    safety_note: str | None = None
    execution_trace: dict | None = None

@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    try:
        result = await query_orchestrator.run(
            query=request.query,
            model=request.model,
            api_key=request.api_key,
            api_base=request.api_base,
            provider=request.provider or "ollama"
        )
        return QueryResponse(
            domain=result.domain,
            response=result.response,
            is_safe=result.is_safe,
            safety_note=result.safety_note,
            execution_trace=result.execution_trace
        )
    except UnsupportedDomainError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        )
