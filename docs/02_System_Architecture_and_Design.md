<div align="center">

#  System Architecture & Design

## MediOrchestrator AI

**Complete Technical Architecture Documentation**

</div>

---

## Table of Contents

- [Complete Architecture Overview](#-complete-architecture-overview)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Architecture](#-database-architecture)
- [Storage Architecture](#-storage-architecture)
- [API Architecture](#-api-architecture)
- [ER Diagram](#-er-diagram)
- [Folder Structure](#-folder-structure)
- [Deployment Architecture](#-deployment-architecture)
- [Scalability](#-scalability)
- [Monitoring & Observability](#-monitoring--observability)
- [Caching Strategy](#-caching-strategy)
- [Sequence Diagrams](#-sequence-diagrams)

---

##  Complete Architecture Overview

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[ Browser]
        Mobile[ Mobile Web]
    end

    subgraph "Edge Layer"
        CDN[CDN / Static Assets]
        LB[Load Balancer]
    end

    subgraph "Presentation Layer"
        React[React 18 SPA]
        Router[React Router]
        State[Zustand Store]
    end

    subgraph "API Layer"
        Gateway[API Gateway]
        Auth[Auth Middleware]
        Rate[Rate Limiter]
        CORS[CORS Handler]
    end

    subgraph "Service Layer"
        FastAPI[FastAPI Server]
        QuerySvc[Query Service]
        UserSvc[User Service]
        ReportSvc[Report Service]
        AdminSvc[Admin Service]
        HistorySvc[History Service]
    end

    subgraph "AI Layer"
        Orchestrator[ AI Orchestrator]
        IntentSvc[Intent Classifier]
        AgentMgr[Agent Manager]
        RAGSvc[RAG Service]
        MemorySvc[Memory Service]
        ValidatorSvc[Response Validator]
    end

    subgraph "Agent Layer"
        GM[General Medicine]
        NU[Nutrition]
        DE[Dentistry]
        DR[Dermatology]
        CA[Cardiology]
        OR[Orthopedics]
        NE[Neurology]
        PA[Pathology]
        MH[Mental Health]
        EM[Emergency]
        WH[Women's Health]
        PH[Pharmacy]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis)]
        Pinecone[(Pinecone)]
        MinIO[(MinIO)]
    end

    subgraph "External Services"
        OpenAI[OpenAI API]
        Gemini[Gemini API]
        Llama[Llama Model]
    end

    subgraph "Observability"
        LangFuse[LangFuse]
        MLflow[MLflow]
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    Browser & Mobile --> CDN --> LB
    LB --> React
    React --> Gateway
    Gateway --> Auth --> Rate --> CORS --> FastAPI
    FastAPI --> QuerySvc & UserSvc & ReportSvc & AdminSvc & HistorySvc
    QuerySvc --> Orchestrator
    Orchestrator --> IntentSvc & AgentMgr & RAGSvc & MemorySvc
    AgentMgr --> GM & NU & DE & DR & CA & OR & NE & PA & MH & EM & WH & PH
    RAGSvc --> Pinecone
    GM & NU & DE & DR & CA & OR & NE & PA & MH & EM & WH & PH --> RAGSvc
    RAGSvc --> OpenAI & Gemini & Llama
    RAGSvc --> ValidatorSvc
    FastAPI --> PG & Redis
    ReportSvc --> MinIO
    MemorySvc --> Redis
    FastAPI --> LangFuse & Prometheus
    Orchestrator --> MLflow

    style Orchestrator fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style RAGSvc fill:#50C878,stroke:#3DA35D,color:#fff
    style FastAPI fill:#009688,stroke:#00796B,color:#fff
    style PG fill:#336791,stroke:#264D6E,color:#fff
    style Redis fill:#DC382D,stroke:#B52D24,color:#fff
    style Pinecone fill:#9B59B6,stroke:#7D3C98,color:#fff
```

### Architecture Layers Summary

| Layer | Components | Responsibility |
|---|---|---|
| **Client** | Browser, Mobile Web | User interface rendering |
| **Edge** | CDN, Load Balancer | Static assets, traffic distribution |
| **Presentation** | React, Router, State | SPA, navigation, state management |
| **API** | Gateway, Auth, Rate Limiter | Request handling, security, throttling |
| **Service** | FastAPI, Domain Services | Business logic, API endpoints |
| **AI** | Orchestrator, RAG, Memory | AI orchestration, knowledge retrieval |
| **Agent** | 12 Healthcare Agents | Domain-specific medical processing |
| **Data** | PostgreSQL, Redis, Pinecone, MinIO | Persistence, caching, vectors, files |
| **External** | OpenAI, Gemini, Llama | LLM inference providers |
| **Observability** | LangFuse, MLflow, Prometheus | Monitoring, tracing, metrics |

---

##  Frontend Architecture

### Component Architecture

```mermaid
graph TB
    subgraph "React Application"
        App[App.tsx]
        
        subgraph "Pages"
            Home[Home Page]
            Chat[Chat Page]
            Dashboard[Dashboard]
            Reports[Reports Page]
            History[History Page]
            Profile[Profile Page]
            Admin[Admin Panel]
            Login[Login Page]
        end
        
        subgraph "Core Components"
            ChatBox[ChatBox]
            MessageList[MessageList]
            AgentCard[AgentCard]
            ConfidenceBadge[ConfidenceBadge]
            SourceCard[SourceCard]
            ReportUploader[ReportUploader]
            NavBar[NavBar]
            Sidebar[Sidebar]
        end
        
        subgraph "State Management"
            AuthStore[Auth Store]
            ChatStore[Chat Store]
            UIStore[UI Store]
        end
        
        subgraph "Services"
            APIClient[API Client]
            AuthService[Auth Service]
            WSClient[WebSocket Client]
        end
    end

    App --> Home & Chat & Dashboard & Reports & History & Profile & Admin & Login
    Chat --> ChatBox & MessageList & AgentCard & ConfidenceBadge & SourceCard
    Reports --> ReportUploader
    App --> NavBar & Sidebar
    Chat --> ChatStore
    Login --> AuthStore
    Chat --> APIClient & WSClient
    Login --> AuthService

    style App fill:#61DAFB,stroke:#4FA8C9,color:#000
    style ChatBox fill:#FF6B6B,stroke:#FF4444,color:#fff
    style AuthStore fill:#9B59B6,stroke:#7D3C98,color:#fff
```

### Frontend Technology Stack

| Technology | Purpose | Version |
|---|---|---|
| React | UI framework | 18.x |
| Vite | Build tool | 5.x |
| React Router | Navigation | 6.x |
| Zustand | State management | 4.x |
| React Query | Server state / caching | 5.x |
| Tailwind CSS | Utility-first styling | 3.x |
| Axios | HTTP client | 1.x |
| React Markdown | Render AI responses | Latest |
| Framer Motion | Animations | Latest |
| Lucide React | Icons | Latest |

### Frontend Data Flow



---

##  Backend Architecture

### Backend Service Architecture

```mermaid
graph TB
    subgraph "FastAPI Application"
        Main[main.py]
        
        subgraph "API Routers"
            AuthRouter[/auth]
            QueryRouter[/query]
            UserRouter[/users]
            ReportRouter[/reports]
            HistoryRouter[/history]
            AdminRouter[/admin]
            HealthRouter[/health]
            AgentRouter[/agents]
        end

        subgraph "Middleware"
            CORSMiddleware[CORS]
            AuthMiddleware[JWT Auth]
            RateLimitMiddleware[Rate Limiter]
            LoggingMiddleware[Request Logger]
            ErrorMiddleware[Error Handler]
        end

        subgraph "Services"
            QueryService[Query Service]
            AuthService[Auth Service]
            UserService[User Service]
            ReportService[Report Service]
            HistoryService[History Service]
            AgentService[Agent Service]
        end

        subgraph "Core"
            Config[Configuration]
            Database[DB Connection]
            Security[Security Utils]
            Dependencies[Dependencies]
        end
    end

    Main --> CORSMiddleware --> AuthMiddleware --> RateLimitMiddleware --> LoggingMiddleware --> ErrorMiddleware
    Main --> AuthRouter & QueryRouter & UserRouter & ReportRouter & HistoryRouter & AdminRouter & HealthRouter & AgentRouter
    QueryRouter --> QueryService
    AuthRouter --> AuthService
    UserRouter --> UserService
    ReportRouter --> ReportService
    HistoryRouter --> HistoryService
    AgentRouter --> AgentService
    QueryService & AuthService & UserService --> Database
    AuthService --> Security
    Main --> Config & Dependencies

    style Main fill:#009688,stroke:#00796B,color:#fff
    style QueryService fill:#4A90D9,stroke:#2E6BAE,color:#fff
```

### Request Lifecycle

```mermaid
graph LR
    Request([HTTP Request]) --> CORS[CORS Check]
    CORS --> Auth[JWT Validation]
    Auth --> Rate[Rate Limit Check]
    Rate --> Log[Request Logging]
    Log --> Route[Route Handler]
    Route --> Service[Service Layer]
    Service --> DB[Data Access]
    DB --> Response[Build Response]
    Response --> Log2[Response Logging]
    Log2 --> Send([HTTP Response])

    style Request fill:#3498DB,stroke:#2E86C1,color:#fff
    style Send fill:#27AE60,stroke:#1E8449,color:#fff
```

### Backend Technology Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Async web framework, auto-docs |
| **Uvicorn** | ASGI server |
| **Pydantic v2** | Data validation, serialization |
| **SQLAlchemy 2.0** | ORM, database queries |
| **Alembic** | Database migrations |
| **python-jose** | JWT token handling |
| **Passlib + bcrypt** | Password hashing |
| **python-multipart** | File upload handling |
| **httpx** | Async HTTP client |
| **celery** | Background task processing |

---

##  Authentication & Authorization

### Authentication Flow



### Authorization Model

```mermaid
graph TB
    subgraph "Roles"
        Admin[ Admin]
        User[ User]
        Guest[ Guest]
    end

    subgraph "Permissions"
        P1[Query Agents]
        P2[View History]
        P3[Upload Reports]
        P4[Manage Users]
        P5[Manage Agents]
        P6[View Analytics]
        P7[System Config]
    end

    Admin --> P1 & P2 & P3 & P4 & P5 & P6 & P7
    User --> P1 & P2 & P3
    Guest --> P1

    style Admin fill:#E74C3C,stroke:#C0392B,color:#fff
    style User fill:#3498DB,stroke:#2E86C1,color:#fff
    style Guest fill:#95A5A6,stroke:#7F8C8D,color:#fff
```

| Role | Permissions | Description |
|---|---|---|
| **Admin** | Full access | System management, user management, analytics |
| **User** | Query, History, Reports | Standard authenticated user |
| **Guest** | Limited queries | Unauthenticated, rate-limited access |

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_uuid",
    "email": "user@example.com",
    "role": "user",
    "iat": 1700000000,
    "exp": 1700003600
  }
}
```

| Token Type | Lifetime | Storage |
|---|---|---|
| Access Token | 1 hour | Memory (frontend) |
| Refresh Token | 7 days | HttpOnly cookie + Redis |

---

##  Database Architecture

### Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ CONVERSATIONS : has
    USERS ||--o{ MEDICAL_REPORTS : uploads
    USERS ||--o{ USER_PREFERENCES : has
    CONVERSATIONS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ MESSAGE_SOURCES : references
    MESSAGES }o--|| AGENTS : responded_by
    AGENTS ||--o{ AGENT_KNOWLEDGE_BASES : uses
    KNOWLEDGE_BASES ||--o{ AGENT_KNOWLEDGE_BASES : used_by
    KNOWLEDGE_BASES ||--o{ DOCUMENTS : contains
    DOCUMENTS ||--o{ CHUNKS : split_into
    MEDICAL_REPORTS ||--o{ REPORT_ANALYSES : analyzed_by
    CONVERSATIONS ||--o{ CONVERSATION_CONTEXT : maintains

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string status
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid agent_id FK
        string role
        text content
        float confidence_score
        string model_used
        integer token_count
        jsonb metadata
        timestamp created_at
    }

    MESSAGE_SOURCES {
        uuid id PK
        uuid message_id FK
        string source_title
        text source_content
        string source_url
        float relevance_score
    }

    AGENTS {
        uuid id PK
        string name UK
        string domain
        string description
        string model_provider
        string model_name
        jsonb config
        boolean is_active
        timestamp created_at
    }

    KNOWLEDGE_BASES {
        uuid id PK
        string name
        string domain
        string description
        integer document_count
        string embedding_model
        string vector_index_id
        timestamp last_updated
    }

    AGENT_KNOWLEDGE_BASES {
        uuid id PK
        uuid agent_id FK
        uuid knowledge_base_id FK
        integer priority
    }

    DOCUMENTS {
        uuid id PK
        uuid knowledge_base_id FK
        string title
        string source_type
        string file_path
        integer chunk_count
        jsonb metadata
        timestamp created_at
    }

    CHUNKS {
        uuid id PK
        uuid document_id FK
        text content
        integer chunk_index
        string vector_id
        jsonb metadata
    }

    MEDICAL_REPORTS {
        uuid id PK
        uuid user_id FK
        string file_name
        string file_type
        string storage_path
        string status
        timestamp uploaded_at
    }

    REPORT_ANALYSES {
        uuid id PK
        uuid report_id FK
        uuid agent_id FK
        text analysis
        float confidence
        jsonb findings
        timestamp analyzed_at
    }

    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        string language
        string theme
        jsonb notification_settings
    }

    CONVERSATION_CONTEXT {
        uuid id PK
        uuid conversation_id FK
        text summary
        jsonb key_entities
        jsonb active_topics
        timestamp updated_at
    }
```

### Table Specifications

#### Users Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, auto-generated | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Display name |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'user' | user / admin / guest |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:** `idx_users_email` (UNIQUE), `idx_users_role`

---

#### Conversations Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Conversation identifier |
| `user_id` | UUID | FK → users.id | Conversation owner |
| `title` | VARCHAR(255) | | Auto-generated title |
| `status` | VARCHAR(20) | DEFAULT 'active' | active / archived / deleted |
| `metadata` | JSONB | | Additional conversation data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | | Last activity |

**Indexes:** `idx_conversations_user_id`, `idx_conversations_status`

---

#### Messages Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Message identifier |
| `conversation_id` | UUID | FK → conversations.id | Parent conversation |
| `agent_id` | UUID | FK → agents.id, NULLABLE | Responding agent (null for user messages) |
| `role` | VARCHAR(20) | NOT NULL | user / assistant / system |
| `content` | TEXT | NOT NULL | Message content |
| `confidence_score` | FLOAT | NULLABLE | AI confidence (0.0 - 1.0) |
| `model_used` | VARCHAR(50) | NULLABLE | LLM model identifier |
| `token_count` | INTEGER | | Token usage |
| `metadata` | JSONB | | Model params, latency, etc. |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Message timestamp |

**Indexes:** `idx_messages_conversation_id`, `idx_messages_created_at`

---

#### Agents Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Agent identifier |
| `name` | VARCHAR(100) | UNIQUE | Agent name (e.g., `cardiology_agent`) |
| `domain` | VARCHAR(50) | NOT NULL | Healthcare domain |
| `description` | TEXT | | Agent purpose description |
| `model_provider` | VARCHAR(50) | | openai / google / meta |
| `model_name` | VARCHAR(100) | | gpt-4 / gemini-pro / llama-3 |
| `config` | JSONB | | Temperature, max_tokens, etc. |
| `is_active` | BOOLEAN | DEFAULT true | Agent availability |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:** `idx_agents_domain`, `idx_agents_is_active`

---

#### Knowledge Bases Table

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Knowledge base identifier |
| `name` | VARCHAR(100) | | Knowledge base name |
| `domain` | VARCHAR(50) | | Medical domain |
| `description` | TEXT | | Content description |
| `document_count` | INTEGER | DEFAULT 0 | Number of documents |
| `embedding_model` | VARCHAR(100) | | Model used for embeddings |
| `vector_index_id` | VARCHAR(100) | | Pinecone index identifier |
| `last_updated` | TIMESTAMP | | Last content update |

---

### Database Design Principles

| Principle | Implementation |
|---|---|
| **Normalization** | 3NF for transactional data |
| **UUID Primary Keys** | Distributed-safe identifiers |
| **JSONB Fields** | Flexible metadata without schema changes |
| **Soft Deletes** | Status field instead of hard deletes |
| **Audit Columns** | `created_at`, `updated_at` on every table |
| **Indexing Strategy** | B-tree for lookups, GIN for JSONB |
| **Foreign Keys** | Referential integrity enforced |

---

##  Storage Architecture

```mermaid
graph TB
    subgraph "Storage Layer"
        subgraph "PostgreSQL"
            Users[(Users)]
            Conversations[(Conversations)]
            Messages[(Messages)]
            Agents[(Agents)]
            KBMeta[(KB Metadata)]
        end

        subgraph "Redis"
            Sessions[(Sessions)]
            Cache[(Query Cache)]
            RateLimit[(Rate Limits)]
            ConvMemory[(Conv Memory)]
        end

        subgraph "Pinecone"
            MedVectors[(Medical Vectors)]
            DocVectors[(Document Vectors)]
        end

        subgraph "MinIO"
            Reports[(Medical Reports)]
            KBFiles[(Knowledge Base Files)]
            Exports[(Exported Data)]
        end
    end

    style PostgreSQL fill:#336791,stroke:#264D6E,color:#fff
    style Redis fill:#DC382D,stroke:#B52D24,color:#fff
    style Pinecone fill:#9B59B6,stroke:#7D3C98,color:#fff
    style MinIO fill:#C72C48,stroke:#9E2139,color:#fff
```

| Store | Type | Data | TTL |
|---|---|---|---|
| **PostgreSQL** | Relational | Users, conversations, agents, KB metadata | Permanent |
| **Redis** | Key-Value | Sessions, cache, rate limits, active memory | 1h–7d |
| **Pinecone** | Vector | Medical embeddings, document chunks | Permanent |
| **MinIO** | Object | Reports, PDFs, KB source files | Permanent |

---

##  API Architecture

### API Design Principles

| Principle | Implementation |
|---|---|
| **RESTful** | Resource-based URLs, proper HTTP methods |
| **Versioned** | `/api/v1/` prefix for all routes |
| **Documented** | Auto-generated OpenAPI (Swagger) |
| **Consistent** | Standard response envelope |
| **Paginated** | Cursor-based pagination for lists |

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |  |
| POST | `/api/v1/auth/login` | Login, get tokens |  |
| POST | `/api/v1/auth/refresh` | Refresh access token |  Refresh |
| POST | `/api/v1/auth/logout` | Invalidate tokens |  |
| GET | `/api/v1/auth/me` | Get current user |  |

#### Query & Chat

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/query` | Submit health query |  |
| POST | `/api/v1/query/stream` | Stream response (SSE) |  |
| GET | `/api/v1/query/{id}` | Get query result |  |

#### Conversations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/conversations` | List conversations |  |
| GET | `/api/v1/conversations/{id}` | Get conversation |  |
| DELETE | `/api/v1/conversations/{id}` | Delete conversation |  |
| GET | `/api/v1/conversations/{id}/messages` | Get messages |  |

#### Reports

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/reports/upload` | Upload medical report |  |
| GET | `/api/v1/reports` | List user reports |  |
| GET | `/api/v1/reports/{id}/analysis` | Get analysis |  |

#### Agents

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/agents` | List all agents |  |
| GET | `/api/v1/agents/{id}` | Get agent details |  |
| GET | `/api/v1/agents/{id}/status` | Agent health status |  Admin |

#### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/admin/users` | List users |  Admin |
| GET | `/api/v1/admin/analytics` | System analytics |  Admin |
| PUT | `/api/v1/admin/agents/{id}` | Update agent config |  Admin |
| GET | `/api/v1/admin/system/health` | System health check |  Admin |

#### System

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/health` | Health check |  |
| GET | `/api/v1/health/ready` | Readiness probe |  |
| GET | `/docs` | Swagger UI |  |

### Standard Response Format

```json
{
  "success": true,
  "data": {
    "response": "Based on the symptoms described...",
    "agent": "cardiology_agent",
    "confidence": 0.92,
    "sources": [
      {
        "title": "ACC/AHA Heart Failure Guidelines",
        "relevance": 0.95
      }
    ],
    "model": "gpt-4",
    "tokens_used": 847,
    "latency_ms": 2340
  },
  "metadata": {
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query text is required",
    "details": [
      {
        "field": "query",
        "issue": "Field cannot be empty"
      }
    ]
  },
  "metadata": {
    "request_id": "req_xyz789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

##  Folder Structure

### Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry
│   ├── config.py                   # Environment configuration
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                 # Dependency injection
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py             # Auth endpoints
│   │       ├── query.py            # Query endpoints
│   │       ├── conversations.py    # Conversation endpoints
│   │       ├── reports.py          # Report endpoints
│   │       ├── agents.py           # Agent endpoints
│   │       ├── admin.py            # Admin endpoints
│   │       └── health.py           # Health check endpoints
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py             # JWT, hashing, auth utils
│   │   ├── database.py             # DB connection, session
│   │   ├── redis.py                # Redis connection
│   │   └── exceptions.py           # Custom exceptions
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                 # User SQLAlchemy model
│   │   ├── conversation.py         # Conversation model
│   │   ├── message.py              # Message model
│   │   ├── agent.py                # Agent model
│   │   ├── knowledge_base.py       # Knowledge base model
│   │   ├── document.py             # Document model
│   │   └── report.py               # Medical report model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                 # User Pydantic schemas
│   │   ├── query.py                # Query request/response
│   │   ├── conversation.py         # Conversation schemas
│   │   ├── agent.py                # Agent schemas
│   │   └── report.py               # Report schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py         # Authentication logic
│   │   ├── user_service.py         # User management
│   │   ├── query_service.py        # Query processing
│   │   ├── conversation_service.py # Conversation management
│   │   ├── report_service.py       # Report handling
│   │   └── admin_service.py        # Admin operations
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py         # AI Orchestrator
│   │   ├── intent_classifier.py    # Intent classification
│   │   ├── agent_router.py         # Agent selection
│   │   ├── agent_manager.py        # Agent lifecycle
│   │   ├── base_agent.py           # Base agent class
│   │   ├── response_validator.py   # Response validation
│   │   └── domains/
│   │       ├── __init__.py
│   │       ├── general_medicine.py
│   │       ├── nutrition.py
│   │       ├── dentistry.py
│   │       ├── dermatology.py
│   │       ├── cardiology.py
│   │       ├── orthopedics.py
│   │       ├── neurology.py
│   │       ├── pathology.py
│   │       ├── mental_health.py
│   │       ├── emergency.py
│   │       ├── womens_health.py
│   │       └── pharmacy.py
│   │
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── pipeline.py             # Main RAG pipeline
│   │   ├── retriever.py            # Document retriever
│   │   ├── embeddings.py           # Embedding service
│   │   ├── chunker.py              # Document chunking
│   │   ├── reranker.py             # Result reranking
│   │   └── vector_store.py         # Vector DB interface
│   │
│   ├── knowledge/
│   │   ├── __init__.py
│   │   ├── loader.py               # Knowledge base loader
│   │   ├── processor.py            # Document processor
│   │   └── datasets/
│   │       ├── general_medicine/
│   │       ├── nutrition/
│   │       ├── cardiology/
│   │       └── ...
│   │
│   └── memory/
│       ├── __init__.py
│       ├── conversation_memory.py  # Conversation context
│       ├── summary_memory.py       # Summarization
│       └── buffer_memory.py        # Buffer window memory
│
├── alembic/
│   ├── versions/                   # Migration files
│   └── env.py
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_query.py
│   ├── test_agents.py
│   └── test_rag.py
│
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Frontend Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatBox.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── SourceCard.tsx
│   │   │   └── ConfidenceBadge.tsx
│   │   ├── layout/
│   │   │   ├── NavBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx
│   │   │   └── AgentList.tsx
│   │   ├── reports/
│   │   │   ├── ReportUploader.tsx
│   │   │   └── ReportViewer.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Chat.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx
│   │   ├── History.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Admin.tsx
│   │
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── authService.ts          # Auth API calls
│   │   ├── queryService.ts         # Query API calls
│   │   └── reportService.ts        # Report API calls
│   │
│   ├── store/
│   │   ├── authStore.ts            # Auth state
│   │   ├── chatStore.ts            # Chat state
│   │   └── uiStore.ts              # UI state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   └── useAgents.ts
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   │
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
│
├── tailwind.config.js
├── vite.config.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

##  Deployment Architecture

### Container Architecture

```mermaid
graph TB
    subgraph "Docker Compose Environment"
        subgraph "Frontend Container"
            Nginx[Nginx]
            ReactBuild[React Build]
        end

        subgraph "Backend Container"
            Uvicorn[Uvicorn ASGI]
            FastAPIApp[FastAPI App]
        end

        subgraph "Database Containers"
            PostgreSQL[(PostgreSQL 16)]
            Redis[(Redis 7)]
        end

        subgraph "Storage Container"
            MinIOSvc[(MinIO)]
        end

        subgraph "Monitoring Containers"
            PrometheusSvc[Prometheus]
            GrafanaSvc[Grafana]
            LangFuseSvc[LangFuse]
        end
    end

    subgraph "External Services"
        PineconeSvc[Pinecone Cloud]
        OpenAISvc[OpenAI API]
        GeminiSvc[Gemini API]
    end

    Nginx --> Uvicorn
    Uvicorn --> FastAPIApp
    FastAPIApp --> PostgreSQL & Redis & MinIOSvc
    FastAPIApp --> PineconeSvc & OpenAISvc & GeminiSvc
    PrometheusSvc --> FastAPIApp
    GrafanaSvc --> PrometheusSvc
    LangFuseSvc --> FastAPIApp

    style Nginx fill:#009639,stroke:#006E2A,color:#fff
    style FastAPIApp fill:#009688,stroke:#00796B,color:#fff
    style PostgreSQL fill:#336791,stroke:#264D6E,color:#fff
    style Redis fill:#DC382D,stroke:#B52D24,color:#fff
```

### Docker Compose Service Map

| Service | Image | Port | Depends On |
|---|---|---|---|
| `frontend` | node:18 → nginx | 3000 | backend |
| `backend` | python:3.11-slim | 8000 | postgres, redis, minio |
| `postgres` | postgres:16 | 5432 | — |
| `redis` | redis:7-alpine | 6379 | — |
| `minio` | minio/minio | 9000, 9001 | — |
| `prometheus` | prom/prometheus | 9090 | backend |
| `grafana` | grafana/grafana | 3001 | prometheus |
| `langfuse` | langfuse/langfuse | 3002 | postgres |

---

##  Scalability

### Scaling Strategy

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        LB[Load Balancer]
        API1[Backend Instance 1]
        API2[Backend Instance 2]
        API3[Backend Instance N]
    end

    subgraph "Database Scaling"
        PGPrimary[(PG Primary)]
        PGReplica1[(PG Replica 1)]
        PGReplica2[(PG Replica 2)]
    end

    subgraph "Cache Scaling"
        RedisCluster[Redis Cluster]
    end

    LB --> API1 & API2 & API3
    API1 & API2 & API3 --> PGPrimary
    PGPrimary --> PGReplica1 & PGReplica2
    API1 & API2 & API3 --> RedisCluster
```

| Component | Strategy | Trigger |
|---|---|---|
| **Backend** | Horizontal pod scaling | CPU > 70% |
| **PostgreSQL** | Read replicas | Query load > threshold |
| **Redis** | Cluster mode | Memory > 80% |
| **Vector DB** | Managed scaling (Pinecone) | Auto-managed |
| **Frontend** | CDN + edge caching | Always-on |

---

##  Monitoring & Observability

### Observability Stack

```mermaid
graph LR
    subgraph "Data Sources"
        App[FastAPI App]
        Agents[AI Agents]
        DB[Databases]
    end

    subgraph "Collection"
        Prom[Prometheus]
        LF[LangFuse]
        ML[MLflow]
    end

    subgraph "Visualization"
        Graf[Grafana]
        LFDash[LangFuse Dashboard]
        MLDash[MLflow UI]
    end

    subgraph "Alerting"
        Alert[Alert Manager]
    end

    App --> Prom --> Graf
    Agents --> LF --> LFDash
    Agents --> ML --> MLDash
    Prom --> Alert

    style Prom fill:#E6522C,stroke:#BF4424,color:#fff
    style Graf fill:#F46800,stroke:#CC5600,color:#fff
    style LF fill:#FF6B35,stroke:#CC5529,color:#fff
```

### Key Metrics

| Category | Metric | Target |
|---|---|---|
| **API** | Response latency (p99) | < 500ms |
| **AI** | Agent response time | < 3s |
| **AI** | Intent classification accuracy | ≥ 90% |
| **RAG** | Retrieval latency | < 200ms |
| **System** | Uptime | ≥ 99% |
| **DB** | Query execution time | < 100ms |
| **Cache** | Hit rate | ≥ 80% |
| **LLM** | Token cost per query | Tracked |

---

##  Caching Strategy

### Cache Layers

```mermaid
graph LR
    Request([Request]) --> L1[L1: Browser Cache]
    L1 --> L2[L2: CDN Cache]
    L2 --> L3[L3: Redis Cache]
    L3 --> L4[L4: Application Cache]
    L4 --> DB[(Database)]

    style L1 fill:#27AE60,stroke:#1E8449,color:#fff
    style L2 fill:#3498DB,stroke:#2E86C1,color:#fff
    style L3 fill:#DC382D,stroke:#B52D24,color:#fff
    style L4 fill:#F39C12,stroke:#D68910,color:#fff
```

| Cache Layer | Data | TTL | Strategy |
|---|---|---|---|
| **Browser** | Static assets, API responses | 1h–24h | Cache-Control headers |
| **CDN** | JS, CSS, images | 7 days | Immutable with hash |
| **Redis** | Session, query cache, rate limits | 5min–7d | TTL-based eviction |
| **Application** | Agent configs, KB metadata | 30min | In-memory with refresh |

### Redis Cache Keys

| Key Pattern | Data | TTL |
|---|---|---|
| `session:{user_id}` | User session data | 1 hour |
| `query_cache:{hash}` | Cached query results | 15 minutes |
| `rate_limit:{ip}` | Rate limit counter | 1 minute |
| `agent_config:{agent_id}` | Agent configuration | 30 minutes |
| `conv_memory:{conv_id}` | Active conversation context | 2 hours |
| `refresh_token:{token_id}` | Refresh token validation | 7 days |

---

##  Sequence Diagrams

### Medical Report Upload & Analysis



### Multi-Agent Query Flow



---

> [!TIP]
> Continue to [AI & Agent Architecture](03_AI_and_Agent_Architecture.md) for deep-dive into the AI orchestration system, RAG pipeline, and agent design.

---

<div align="center">

**MediOrchestrator AI** — *System Architecture & Design*

</div>
