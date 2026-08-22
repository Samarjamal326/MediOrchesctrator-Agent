from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from core.llm import llm_service, OllamaServiceError

router = APIRouter(prefix="/v1", tags=["LLM Test"])

class PromptRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7

class PromptResponse(BaseModel):
    model: str
    response: str

@router.post("/test-llm", response_model=PromptResponse)
async def test_llm_endpoint(request: PromptRequest):
    try:
        reply = await llm_service.generate_response(
            prompt=request.prompt,
            system_prompt=request.system_prompt,
            temperature=request.temperature or 0.7
        )
        return PromptResponse(
            model=llm_service.default_model,
            response=reply
        )
    except OllamaServiceError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err)
        )
