<div align="center">

# 🛠 Development & Implementation

## MediOrchestrator AI

**Folder Structures, API Design, Coding Standards, CI/CD, and Testing**

</div>

---

## Table of Contents

- [Folder Structures](#-folder-structures)
- [API Design & Implementation](#-api-design--implementation)
- [Authentication Implementation](#-authentication-implementation)
- [Database Implementation](#-database-implementation)
- [Coding Standards](#-coding-standards)
- [Docker Configuration](#-docker-configuration)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Testing Strategy](#-testing-strategy)
- [Implementation Workflow](#-implementation-workflow)
- [System Integration](#-system-integration)

---

## 📁 Folder Structures

### Complete Project Structure

```
MediOrchesctrator-Agent/
│
├── 📄 README.md
├── 📄 docker-compose.yml
├── 📄 docker-compose.dev.yml
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 Makefile
│
├── 📁 docs/
│   ├── 01_Project_Foundation.md
│   ├── 02_System_Architecture_and_Design.md
│   ├── 03_AI_and_Agent_Architecture.md
│   ├── 04_Development_and_Implementation.md
│   └── 05_Deployment_Security_Research.md
│
├── 📁 pdf/
│   └── [PDF versions]
│
├── 📁 backend/
│   ├── 📄 Dockerfile
│   ├── 📄 requirements.txt
│   ├── 📄 alembic.ini
│   ├── 📄 pyproject.toml
│   │
│   ├── 📁 app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── 📁 api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── 📁 v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── query.py
│   │   │       ├── conversations.py
│   │   │       ├── reports.py
│   │   │       ├── agents.py
│   │   │       ├── admin.py
│   │   │       └── health.py
│   │   │
│   │   ├── 📁 core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   ├── redis.py
│   │   │   └── exceptions.py
│   │   │
│   │   ├── 📁 models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── conversation.py
│   │   │   ├── message.py
│   │   │   ├── agent.py
│   │   │   ├── knowledge_base.py
│   │   │   ├── document.py
│   │   │   └── report.py
│   │   │
│   │   ├── 📁 schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── query.py
│   │   │   ├── conversation.py
│   │   │   ├── agent.py
│   │   │   └── report.py
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── query_service.py
│   │   │   ├── conversation_service.py
│   │   │   ├── report_service.py
│   │   │   └── admin_service.py
│   │   │
│   │   ├── 📁 agents/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py
│   │   │   ├── intent_classifier.py
│   │   │   ├── agent_router.py
│   │   │   ├── agent_manager.py
│   │   │   ├── base_agent.py
│   │   │   ├── response_validator.py
│   │   │   └── 📁 domains/
│   │   │       ├── __init__.py
│   │   │       ├── general_medicine.py
│   │   │       ├── nutrition.py
│   │   │       ├── dentistry.py
│   │   │       ├── dermatology.py
│   │   │       ├── cardiology.py
│   │   │       ├── orthopedics.py
│   │   │       ├── neurology.py
│   │   │       ├── pathology.py
│   │   │       ├── mental_health.py
│   │   │       ├── emergency.py
│   │   │       ├── womens_health.py
│   │   │       └── pharmacy.py
│   │   │
│   │   ├── 📁 rag/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py
│   │   │   ├── retriever.py
│   │   │   ├── embeddings.py
│   │   │   ├── chunker.py
│   │   │   ├── reranker.py
│   │   │   └── vector_store.py
│   │   │
│   │   ├── 📁 knowledge/
│   │   │   ├── __init__.py
│   │   │   ├── loader.py
│   │   │   ├── processor.py
│   │   │   └── 📁 datasets/
│   │   │       └── [domain folders]
│   │   │
│   │   └── 📁 memory/
│   │       ├── __init__.py
│   │       ├── conversation_memory.py
│   │       ├── summary_memory.py
│   │       └── buffer_memory.py
│   │
│   ├── 📁 alembic/
│   │   ├── env.py
│   │   └── 📁 versions/
│   │
│   └── 📁 tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_query.py
│       ├── test_agents.py
│       ├── test_rag.py
│       └── test_integration.py
│
├── 📁 frontend/
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.js
│   │
│   ├── 📁 public/
│   │   └── index.html
│   │
│   └── 📁 src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       │
│       ├── 📁 components/
│       │   ├── 📁 chat/
│       │   ├── 📁 layout/
│       │   ├── 📁 agents/
│       │   ├── 📁 reports/
│       │   └── 📁 common/
│       │
│       ├── 📁 pages/
│       ├── 📁 services/
│       ├── 📁 store/
│       ├── 📁 hooks/
│       ├── 📁 types/
│       └── 📁 utils/
│
├── 📁 infrastructure/
│   ├── 📁 nginx/
│   │   └── nginx.conf
│   ├── 📁 prometheus/
│   │   └── prometheus.yml
│   ├── 📁 grafana/
│   │   └── dashboards/
│   └── 📁 scripts/
│       ├── init-db.sh
│       ├── seed-data.sh
│       └── load-knowledge.sh
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── 📁 diagrams/
└── 📁 assets/
```

### Layer Responsibility Map

```mermaid
graph TB
    subgraph "API Layer — api/"
        direction LR
        A1[Route handlers]
        A2[Request validation]
        A3[Response serialization]
    end

    subgraph "Service Layer — services/"
        direction LR
        S1[Business logic]
        S2[Data orchestration]
        S3[External integrations]
    end

    subgraph "Agent Layer — agents/"
        direction LR
        AG1[AI orchestration]
        AG2[Intent classification]
        AG3[Domain agents]
    end

    subgraph "Data Layer — models/"
        direction LR
        D1[SQLAlchemy models]
        D2[Database queries]
        D3[Migrations]
    end

    subgraph "Schema Layer — schemas/"
        direction LR
        SC1[Pydantic models]
        SC2[Validation rules]
        SC3[Serialization]
    end

    A1 --> S1
    S1 --> AG1
    S1 --> D1
    A2 --> SC1
```

---

## 🔌 API Design & Implementation

### API Entry Point — `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import auth, query, conversations, reports, agents, admin, health
from app.core.database import init_db
from app.core.redis import init_redis
from app.agents.agent_manager import AgentManager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    # Startup
    await init_db()
    await init_redis()
    await AgentManager.initialize()
    yield
    # Shutdown
    await AgentManager.shutdown()

app = FastAPI(
    title="MediOrchestrator AI",
    description="Agentic Multi-LLM Healthcare Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(query.router, prefix="/api/v1/query", tags=["Query"])
app.include_router(conversations.router, prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
```

### Query Endpoint Implementation

```python
# app/api/v1/query.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.query import QueryRequest, QueryResponse
from app.services.query_service import QueryService
from app.api.deps import get_current_user, get_query_service

router = APIRouter()

@router.post("/", response_model=QueryResponse)
async def submit_query(
    request: QueryRequest,
    current_user = Depends(get_current_user),
    query_service: QueryService = Depends(get_query_service),
):
    """Submit a health query to the AI orchestrator."""
    result = await query_service.process_query(
        query=request.query,
        user_id=current_user.id,
        conversation_id=request.conversation_id,
    )
    return result
```

### Pydantic Schemas

```python
# app/schemas/query.py
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    conversation_id: Optional[UUID] = None
    preferred_model: Optional[str] = None

class SourceInfo(BaseModel):
    title: str
    content: str
    relevance_score: float
    source_url: Optional[str] = None

class QueryResponse(BaseModel):
    success: bool = True
    data: QueryData

class QueryData(BaseModel):
    response: str
    agent: str
    domain: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    sources: List[SourceInfo]
    model_used: str
    tokens_used: int
    latency_ms: int
    conversation_id: UUID
    message_id: UUID
```

### Dependency Injection Pattern

```mermaid
graph LR
    Route[API Route] --> Dep1[get_current_user]
    Route --> Dep2[get_db_session]
    Route --> Dep3[get_query_service]
    
    Dep1 --> JWT[JWT Decoder]
    Dep2 --> Pool[Connection Pool]
    Dep3 --> Dep2
    Dep3 --> Dep4[get_orchestrator]
    Dep4 --> Dep5[get_agent_manager]

    style Route fill:#009688,stroke:#00796B,color:#fff
```

```python
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import decode_jwt
from app.services.query_service import QueryService
from app.agents.orchestrator import Orchestrator

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_session),
):
    """Extract and validate user from JWT token."""
    payload = decode_jwt(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_query_service(
    db: AsyncSession = Depends(get_session),
) -> QueryService:
    """Provide QueryService instance."""
    orchestrator = Orchestrator()
    return QueryService(db=db, orchestrator=orchestrator)
```

---

## 🔐 Authentication Implementation

### Security Module

```python
# app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET, algorithm="HS256")

def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        return None
```

### Auth Endpoints

```python
# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(),
):
    """Register a new user."""
    user = await auth_service.register(user_data)
    tokens = auth_service.generate_tokens(user)
    return tokens

@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    auth_service: AuthService = Depends(),
):
    """Authenticate user and return tokens."""
    user = await auth_service.authenticate(
        credentials.email, credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    tokens = auth_service.generate_tokens(user)
    return tokens

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    auth_service: AuthService = Depends(),
):
    """Refresh access token."""
    tokens = await auth_service.refresh(refresh_token)
    return tokens
```

---

## 🗄 Database Implementation

### SQLAlchemy Models

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    conversations = relationship("Conversation", back_populates="user")
    reports = relationship("MedicalReport", back_populates="user")
```

```python
# app/models/message.py
class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(50), nullable=True)
    token_count = Column(Integer, nullable=True)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    agent = relationship("Agent")
    sources = relationship("MessageSource", back_populates="message")
```

### Database Connection

```python
# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_session():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

### Migration Example

```python
# alembic/versions/001_initial.py
"""Initial migration"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("idx_users_email", "users", ["email"], unique=True)

def downgrade():
    op.drop_table("users")
```

---

## 📏 Coding Standards

### Python Coding Standards

| Rule | Standard | Tool |
|---|---|---|
| Formatting | Black (88 line length) | `black` |
| Import sorting | isort (Black-compatible) | `isort` |
| Linting | Ruff | `ruff` |
| Type checking | mypy (strict mode) | `mypy` |
| Docstrings | Google style | `pydocstyle` |
| Max line length | 88 characters | Black default |
| Naming | snake_case (functions/vars), PascalCase (classes) | — |

### TypeScript / React Coding Standards

| Rule | Standard | Tool |
|---|---|---|
| Formatting | Prettier | `prettier` |
| Linting | ESLint (React config) | `eslint` |
| Type safety | Strict TypeScript | `tsc --strict` |
| Components | Functional + hooks only | — |
| State | Zustand for global, local for UI | — |
| Naming | camelCase (vars), PascalCase (components) | — |

### Git Conventions

| Type | Format | Example |
|---|---|---|
| **Branch naming** | `type/short-description` | `feat/agent-router` |
| **Commit message** | `type(scope): description` | `feat(agents): add cardiology agent` |
| **PR title** | Same as commit message | `fix(rag): improve retrieval accuracy` |

### Commit Types

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `ci` | CI/CD changes |
| `chore` | Maintenance tasks |

### Environment Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MediOrchestrator AI"
    DEBUG: bool = False
    API_VERSION: str = "v1"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    ACCESS_TOKEN_EXPIRE: int = 60          # minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Providers
    OPENAI_API_KEY: str
    GOOGLE_API_KEY: str = ""
    
    # Vector DB
    PINECONE_API_KEY: str
    PINECONE_INDEX: str = "mediorch-index"
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    
    # Monitoring
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
```

```env
# .env.example
APP_NAME=MediOrchestrator AI
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/mediorch

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# OpenAI
OPENAI_API_KEY=sk-...

# Google
GOOGLE_API_KEY=AIza...

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=mediorch-index

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# LangFuse
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
```

---

## 🐳 Docker Configuration

### Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ── Backend ──
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # ── Frontend ──
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  # ── PostgreSQL ──
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mediorch
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ── Redis ──
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ── MinIO ──
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # ── Prometheus ──
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./infrastructure/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  # ── Grafana ──
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# Development stage
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Service Diagram

```mermaid
graph TB
    subgraph "Docker Compose"
        FE[frontend:3000]
        BE[backend:8000]
        PG[postgres:5432]
        RD[redis:6379]
        MO[minio:9000]
        PR[prometheus:9090]
        GR[grafana:3001]
    end

    FE --> BE
    BE --> PG
    BE --> RD
    BE --> MO
    PR --> BE
    GR --> PR

    style FE fill:#61DAFB,stroke:#4FA8C9,color:#000
    style BE fill:#009688,stroke:#00796B,color:#fff
    style PG fill:#336791,stroke:#264D6E,color:#fff
    style RD fill:#DC382D,stroke:#B52D24,color:#fff
```

---

## 🔄 CI/CD Pipeline

### Pipeline Architecture

```mermaid
graph LR
    subgraph "CI Pipeline"
        Push[Git Push] --> Lint[Lint & Format]
        Lint --> TypeCheck[Type Check]
        TypeCheck --> Test[Run Tests]
        Test --> Build[Build Images]
        Build --> Scan[Security Scan]
    end

    subgraph "CD Pipeline"
        Scan --> Stage[Deploy Staging]
        Stage --> Smoke[Smoke Tests]
        Smoke --> Approve{Manual Approve}
        Approve -->|Yes| Prod[Deploy Production]
        Approve -->|No| Rollback[Rollback]
    end

    style Push fill:#3498DB,stroke:#2E86C1,color:#fff
    style Prod fill:#27AE60,stroke:#1E8449,color:#fff
    style Rollback fill:#E74C3C,stroke:#C0392B,color:#fff
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ── Backend Tests ──
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test
        ports: [5432:5432]
      redis:
        image: redis:7
        ports: [6379:6379]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov

      - name: Lint
        run: |
          cd backend
          ruff check .
          black --check .

      - name: Type Check
        run: |
          cd backend
          mypy app/

      - name: Run Tests
        run: |
          cd backend
          pytest tests/ -v --cov=app --cov-report=xml
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
          JWT_SECRET: test-secret

  # ── Frontend Tests ──
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Lint
        run: cd frontend && npm run lint

      - name: Type Check
        run: cd frontend && npm run type-check

      - name: Build
        run: cd frontend && npm run build

  # ── Security Scan ──
  security:
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t mediorch-backend ./backend

      - name: Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: mediorch-backend
          format: sarif
          output: trivy-results.sarif

      - name: Upload Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif
```

---

## 🧪 Testing Strategy

### Testing Pyramid

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[E2E Tests<br/>10%]
        Integration[Integration Tests<br/>30%]
        Unit[Unit Tests<br/>60%]
    end

    style E2E fill:#E74C3C,stroke:#C0392B,color:#fff
    style Integration fill:#F39C12,stroke:#D68910,color:#fff
    style Unit fill:#27AE60,stroke:#1E8449,color:#fff
```

### Test Categories

| Category | Scope | Tools | Coverage Target |
|---|---|---|---|
| **Unit Tests** | Functions, classes | pytest, Jest | 80% |
| **Integration Tests** | API endpoints, DB | pytest + httpx | 70% |
| **Agent Tests** | Agent responses | pytest + mocks | 75% |
| **RAG Tests** | Retrieval quality | RAGAS metrics | 85% recall |
| **E2E Tests** | Full user flows | Playwright | Critical paths |

### Backend Test Examples

```python
# tests/test_auth.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!",
        "full_name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401

# tests/test_query.py
@pytest.mark.asyncio
async def test_submit_query(authenticated_client: AsyncClient):
    response = await authenticated_client.post("/api/v1/query", json={
        "query": "What are symptoms of high blood pressure?",
    })
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["agent"] is not None
    assert data["confidence"] > 0
    assert len(data["sources"]) > 0
```

```python
# tests/test_agents.py
@pytest.mark.asyncio
async def test_intent_classification():
    classifier = IntentClassifier()
    result = await classifier.classify("I have a toothache")
    assert result.domain == "dentistry"
    assert result.confidence > 0.7

@pytest.mark.asyncio
async def test_agent_routing():
    router = AgentRouter()
    agent = await router.select_agent(domain="cardiology")
    assert agent.name == "cardiology_agent"
    assert agent.is_active
```

---

## 🔄 Implementation Workflow

### Development Phases

```mermaid
graph LR
    P1[Phase 1<br/>Foundation] --> P2[Phase 2<br/>AI Core]
    P2 --> P3[Phase 3<br/>Frontend]
    P3 --> P4[Phase 4<br/>Integration]
    P4 --> P5[Phase 5<br/>Polish]

    style P1 fill:#3498DB,stroke:#2E6BAE,color:#fff
    style P2 fill:#9B59B6,stroke:#7D3C98,color:#fff
    style P3 fill:#E74C3C,stroke:#C0392B,color:#fff
    style P4 fill:#F39C12,stroke:#D68910,color:#fff
    style P5 fill:#27AE60,stroke:#1E8449,color:#fff
```

| Phase | Focus | Deliverables |
|---|---|---|
| **Phase 1** | Foundation | FastAPI setup, DB models, Auth, Docker |
| **Phase 2** | AI Core | Orchestrator, Agents, RAG pipeline, Knowledge bases |
| **Phase 3** | Frontend | React UI, Chat interface, Dashboard |
| **Phase 4** | Integration | End-to-end flow, Monitoring, Testing |
| **Phase 5** | Polish | Performance, Security hardening, Documentation |

### Per-Phase Workflow

```mermaid
graph TB
    Start([Start Phase]) --> Branch[Create Feature Branch]
    Branch --> Implement[Implement Feature]
    Implement --> Test[Write Tests]
    Test --> Lint[Lint & Format]
    Lint --> PR[Open Pull Request]
    PR --> Review[Code Review]
    Review --> Pass{Approved?}
    Pass -->|Yes| Merge[Merge to Develop]
    Pass -->|No| Fix[Fix Issues]
    Fix --> Review
    Merge --> Deploy[Deploy to Staging]
    Deploy --> Verify[Verify]
    Verify --> Done([Phase Complete])

    style Start fill:#3498DB,stroke:#2E86C1,color:#fff
    style Done fill:#27AE60,stroke:#1E8449,color:#fff
```

---

## 🔗 System Integration

### Integration Points

```mermaid
graph TB
    subgraph "Frontend ↔ Backend"
        FE[React App]
        API[FastAPI]
        FE -->|REST API + JWT| API
        FE -->|SSE Stream| API
        FE -->|File Upload| API
    end

    subgraph "Backend ↔ AI"
        API -->|Query| Orch[Orchestrator]
        Orch -->|LangGraph| Agents[Agents]
        Agents -->|LangChain| RAG[RAG]
    end

    subgraph "Backend ↔ Data"
        API -->|SQLAlchemy| PG[(PostgreSQL)]
        API -->|aioredis| Redis[(Redis)]
        RAG -->|Pinecone Client| VDB[(Pinecone)]
        API -->|boto3| MinIO[(MinIO)]
    end

    subgraph "Backend ↔ External"
        RAG -->|openai SDK| OpenAI[OpenAI]
        RAG -->|google-generativeai| Gemini[Gemini]
    end

    subgraph "Backend ↔ Monitoring"
        API -->|prometheus_client| Prom[Prometheus]
        Orch -->|langfuse SDK| LF[LangFuse]
        Orch -->|mlflow SDK| ML[MLflow]
    end
```

### Integration Contracts

| Integration | Protocol | Auth | Format | Error Handling |
|---|---|---|---|---|
| Frontend → Backend | HTTPS REST | JWT Bearer | JSON | HTTP status codes |
| Backend → PostgreSQL | TCP | Connection string | SQL | SQLAlchemy exceptions |
| Backend → Redis | TCP | Password | Key-Value | Redis exceptions |
| Backend → Pinecone | HTTPS | API Key | Vectors | Client exceptions |
| Backend → OpenAI | HTTPS | API Key | JSON | Retry with backoff |
| Backend → MinIO | HTTPS (S3) | Access/Secret Key | Binary | S3 exceptions |

---

> [!TIP]
> Continue to [Deployment, Security & Research](05_Deployment_Security_Research.md) for deployment strategies, security implementation, and research opportunities.

---

<div align="center">

**MediOrchestrator AI** — *Development & Implementation*

</div>
