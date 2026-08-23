from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from core.orchestrator import query_orchestrator, UnsupportedDomainError

router = APIRouter(prefix="/v1", tags=["Query"])

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    domain: str
    response: str

@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    try:
        result = await query_orchestrator.run(request.query)
        return QueryResponse(domain=result.domain, response=result.response)
    except UnsupportedDomainError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        )
