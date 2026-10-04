from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.test_llm import router as test_llm_router
from api.v1.routing import router as routing_router
from api.v1.query import router as query_router

app = FastAPI(title="MediOrchestrator Backend", version="1.0.0")

# Allow frontend dev server on any localhost port
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_llm_router, prefix="/api")
app.include_router(routing_router, prefix="/api")
app.include_router(query_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": "qwen2.5:3b", "provider": "ollama"}
