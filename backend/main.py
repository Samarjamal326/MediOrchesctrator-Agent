from fastapi import FastAPI
from api.v1.test_llm import router as test_llm_router
from api.v1.routing import router as routing_router

app = FastAPI(title="MediOrchestrator Backend", version="1.0.0")

app.include_router(test_llm_router, prefix="/api")
app.include_router(routing_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
