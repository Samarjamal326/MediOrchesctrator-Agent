from fastapi import APIRouter
from pydantic import BaseModel
from routing.router import intent_router

router = APIRouter(prefix="/v1", tags=["Routing"])

class RouteRequest(BaseModel):
    query: str

class RouteResponse(BaseModel):
    domain: str

@router.post("/route", response_model=RouteResponse)
async def route_query(request: RouteRequest):
    selected_domain = await intent_router.classify(request.query)
    return RouteResponse(domain=selected_domain)
