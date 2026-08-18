# MediOrchestrator

> An intelligent healthcare AI orchestration system that understands a health query, routes it to the right medical domain, retrieves relevant knowledge, and generates a safer response.

---

## Project Overview

MediOrchestrator is not just a single healthcare chatbot.

The main idea is to have one central orchestration system that decides how a query should be handled.

```mermaid
mindmap
  root((MediOrchestrator))
    Agentic Architecture
      Intelligent Routing
      Agent Selection
      Multi-Agent Support
      Agent Collaboration
    Healthcare Intelligence
      Medical Domains
      Domain Knowledge Bases
      Medical Validation
      Emergency Detection
    Advanced AI
      RAG Pipeline
      Shared LLM
      Conversation Memory
      Multi-LLM Support
    Performance
      Redis
      Key-Value Cache
      Semantic Cache
      RAG Cache
    Production
      Langfuse Observability
      Scalable Deployment
      Security
      Evaluation
```

---

# Architecture

The overall system is built around an AI Orchestrator.

```mermaid
graph TB
    User([User]) --> API[FastAPI API Layer]
    API --> Auth[Authentication and Authorization]
    Auth --> Cache{Redis Cache}

    Cache -->|Hit| Response[Final Response]
    Cache -->|Miss| Emergency[Emergency Check]

    Emergency --> Router[Healthcare Router]
    Router --> Selector[Agent Selector]

    Selector --> GM[General Medicine]
    Selector --> DE[Dermatology]
    Selector --> NU[Nutrition]
    Selector --> DN[Dentistry]

    GM & DE & NU & DN --> RAG[RAG Pipeline]

    RAG --> QD[(Qdrant)]
    RAG --> LLM[Shared LLM]

    LLM --> Safety[Safety and Response Validation]
    Safety --> Memory[Conversation Memory]
    Memory --> Store[Redis and Persistent Storage]
    Store --> Response

    Langfuse[Langfuse Observability] -. traces .-> API
    Langfuse -. traces .-> Router
    Langfuse -. traces .-> RAG
    Langfuse -. traces .-> LLM
    Langfuse -. traces .-> Safety

    style API fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style Router fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style Selector fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style RAG fill:#50C878,stroke:#3DA35D,color:#fff
    style QD fill:#9B59B6,stroke:#7D3C98,color:#fff
    style LLM fill:#E74C3C,stroke:#C0392B,color:#fff
    style Cache fill:#F39C12,stroke:#D68910,color:#fff
    style Langfuse fill:#E67E22,stroke:#CA6F1E,color:#fff
```

---

# Core Components

| Component | Purpose |
|---|---|
| API Layer | Receives requests and returns responses |
| Emergency Check | Detects potentially urgent situations |
| Router | Identifies the medical domain |
| Agent Selector | Chooses which agent or agents should handle the query |
| Agents | Apply domain-specific instructions and tools |
| RAG | Retrieves relevant medical knowledge |
| Shared LLM | Reasons over the query and context |
| Safety Layer | Validates the final response |
| Redis | Handles caching and temporary state |
| Qdrant | Stores and searches knowledge embeddings |
| PostgreSQL | Stores persistent application data |
| LangGraph | Controls the AI workflow |
| Langfuse | Traces and monitors the system |

---

# 1. Routing and Agent Selection

## Router

The Router answers:

> What medical domain is this query related to?

For example:

```mermaid
flowchart LR
    Query([User Query]) --> Router[Router]

    Router -->|Skin related| Derm[Dermatology]
    Router -->|General symptoms| GM[General Medicine]
    Router -->|Food and diet| Nut[Nutrition]
    Router -->|Teeth and oral health| Dent[Dentistry]

    style Router fill:#4A90D9,stroke:#2E6BAE,color:#fff
```

The router can use a hybrid approach.

```mermaid
flowchart TB
    Query[User Query] --> Embed[Embedding-Based Routing]
    Embed --> Confidence{High Confidence?}

    Confidence -->|Yes| Domain[Select Domain]
    Confidence -->|No| LLM[LLM Routing Fallback]

    LLM --> Domain

    style Embed fill:#50C878,stroke:#3DA35D,color:#fff
    style LLM fill:#E74C3C,stroke:#C0392B,color:#fff
```

| Method | Purpose |
|---|---|
| Embedding similarity | Fast domain matching |
| Confidence threshold | Checks whether the result is reliable |
| LLM fallback | Handles unclear or multi-domain queries |

---

## Agent Selector

The Agent Selector answers:

> Which agent or agents should handle this query?

The Router identifies the domain. The Agent Selector decides the actual workflow.

```mermaid
flowchart TB
    Router[Router Output] --> Check{One or Multiple Domains?}

    Check -->|One| Single[Select Single Agent]
    Check -->|Multiple| Multi[Select Primary and Supporting Agents]

    Single --> Process[Agent Processing]
    Multi --> Process

    style Check fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style Multi fill:#9B59B6,stroke:#7D3C98,color:#fff
```

| Router | Agent Selector |
|---|---|
| What is the query about? | Who should handle it? |
| Identifies domains | Selects the agent workflow |
| Can return multiple domains | Can select multiple agents |

---

# 2. Specialized Agents

Each agent is not necessarily a separate LLM.

The system can use one shared LLM. The agents provide specialization through instructions, knowledge, tools, and rules.

```mermaid
graph TB
    Agent[Specialized Agent]

    Agent --> Role[Role and Instructions]
    Agent --> Knowledge[Domain Knowledge]
    Agent --> Tools[Available Tools]
    Agent --> Rules[Safety Rules]

    Role --> LLM[Shared LLM]
    Knowledge --> LLM
    Tools --> LLM
    Rules --> LLM

    style Agent fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style LLM fill:#E74C3C,stroke:#C0392B,color:#fff
```

## Initial Agents

| Agent | Main Focus |
|---|---|
| General Medicine | General health and common symptoms |
| Dermatology | Skin, hair, and nail queries |
| Nutrition | Diet and nutrition |
| Dentistry | Teeth and oral health |

Additional domains can be added later.

---

# 3. RAG Pipeline

RAG retrieves relevant medical information before the LLM generates a response.

```mermaid
flowchart LR
    Query[User Query] --> Domain[Selected Domain]
    Domain --> Search[Knowledge Search]
    Search --> Qdrant[(Qdrant)]
    Qdrant --> Results[Retrieved Documents]
    Results --> Rerank[Optional Reranking]
    Rerank --> Context[Relevant Context]
    Context --> LLM[Shared LLM]

    style Search fill:#50C878,stroke:#3DA35D,color:#fff
    style Qdrant fill:#9B59B6,stroke:#7D3C98,color:#fff
    style LLM fill:#E74C3C,stroke:#C0392B,color:#fff
```

## RAG Improvements

| Technique | Purpose |
|---|---|
| Query rewriting | Improves unclear search queries |
| Hybrid search | Combines semantic and keyword search |
| Reranking | Selects the most relevant documents |
| Metadata filtering | Keeps retrieval inside the correct medical domain |

---

# 4. Redis and Caching

Redis is mainly used to avoid doing the same work repeatedly and to store fast temporary data.

```mermaid
flowchart TB
    Request[User Request] --> Cache{Redis Cache}

    Cache -->|Cache Hit| Response[Return Cached Response]
    Cache -->|Cache Miss| Pipeline[Run AI Pipeline]

    Pipeline --> Store[Store Cache]
    Store --> Response

    style Cache fill:#F39C12,stroke:#D68910,color:#fff
    style Pipeline fill:#4A90D9,stroke:#2E6BAE,color:#fff
```

## Caching Techniques

### Key-Value Cache

Used when the same request is repeated.

```mermaid
flowchart LR
    Query[Query] --> Key[Generate Cache Key]
    Key --> Redis[(Redis)]
    Redis --> Result[Cached Response]

    style Redis fill:#F39C12,stroke:#D68910,color:#fff
```

### Semantic Cache

Used when two queries are different in wording but similar in meaning.

```mermaid
flowchart TB
    Query[New Query] --> Embedding[Create Embedding]
    Embedding --> Compare[Compare with Cached Queries]
    Compare --> Similar{Similar Enough?}

    Similar -->|Yes| Hit[Reuse Cached Result]
    Similar -->|No| Pipeline[Run Full Pipeline]

    style Embedding fill:#50C878,stroke:#3DA35D,color:#fff
    style Hit fill:#F39C12,stroke:#D68910,color:#fff
```

### RAG Cache

Used to reuse retrieval results for repeated or similar searches.

```mermaid
flowchart LR
    Query[Query] --> Check{Retrieval Cache}
    Check -->|Hit| Docs[Reuse Documents]
    Check -->|Miss| Search[Search Qdrant]
    Search --> Store[Cache Results]

    style Check fill:#F39C12,stroke:#D68910,color:#fff
    style Search fill:#9B59B6,stroke:#7D3C98,color:#fff
```

## Redis Responsibilities

| Use Case | Purpose |
|---|---|
| Response Cache | Avoid repeated full processing |
| Semantic Cache | Reuse results for similar queries |
| RAG Cache | Reuse retrieved documents |
| Session State | Store temporary conversation context |
| Rate Limiting | Control excessive requests |

---

# 5. Conversation Memory

Conversation memory helps the system retain useful context during a session.

```mermaid
flowchart TB
    Session[Session ID] --> State[Conversation State]

    State --> Messages[Recent Messages]
    State --> Domain[Active Domain]
    State --> Agent[Selected Agent]
    State --> Context[Temporary Context]

    style State fill:#4A90D9,stroke:#2E6BAE,color:#fff
```

| Redis | PostgreSQL |
|---|---|
| Fast temporary data | Persistent data |
| Session state | User and application data |
| Cache | Long-term records |
| Short-lived context | Permanent storage |

---

# 6. LangGraph Workflow

LangGraph manages the conditional flow between different parts of the system.

```mermaid
flowchart TB
    Start([START]) --> Emergency[Emergency Check]
    Emergency --> Check{Emergency?}

    Check -->|Yes| EmergencyFlow[Emergency Response]
    Check -->|No| Router[Router]

    Router --> Selector[Agent Selector]
    Selector --> AgentCheck{Single or Multi-Agent?}

    AgentCheck -->|Single| Single[Single Agent]
    AgentCheck -->|Multiple| Multi[Multiple Agents]

    Single --> RAG[RAG Pipeline]
    Multi --> RAG

    RAG --> LLM[Shared LLM]
    LLM --> Safety[Safety Validation]
    Safety --> End([END])

    style Router fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style RAG fill:#50C878,stroke:#3DA35D,color:#fff
    style LLM fill:#E74C3C,stroke:#C0392B,color:#fff
```

---

# 7. Langfuse Observability

Langfuse allows us to see what happens inside the AI system.

```mermaid
graph TB
    Request[User Request]

    Request --> Cache[Cache Check]
    Request --> Router[Router Decision]
    Request --> Agent[Agent Selection]
    Request --> RAG[RAG Retrieval]
    Request --> LLM[LLM Call]
    Request --> Safety[Safety Check]

    Cache --> Trace[Langfuse Trace]
    Router --> Trace
    Agent --> Trace
    RAG --> Trace
    LLM --> Trace
    Safety --> Trace

    style Trace fill:#E67E22,stroke:#CA6F1E,color:#fff
```

## What Langfuse Helps Track

| What | Why |
|---|---|
| Routing decisions | Check domain selection |
| Agent selection | Understand the chosen workflow |
| RAG retrieval | Evaluate retrieved information |
| LLM calls | Inspect prompts and responses |
| Latency | Find slow components |
| Cache hits and misses | Measure cache effectiveness |
| Errors | Debug failures |

Langfuse observes the system. It does not perform the routing or generation.

---

# 8. Safety Architecture

Safety checks should happen before and after the AI workflow.

```mermaid
flowchart LR
    Input[User Input] --> InputSafety[Input Safety]
    InputSafety --> Workflow[AI Workflow]
    Workflow --> Output[LLM Response]
    Output --> OutputSafety[Output Safety]
    OutputSafety --> Response[Final Response]

    style InputSafety fill:#E74C3C,stroke:#C0392B,color:#fff
    style OutputSafety fill:#E74C3C,stroke:#C0392B,color:#fff
```

| Stage | Purpose |
|---|---|
| Input Safety | Emergency detection and input validation |
| Agent Rules | Domain-specific boundaries |
| Output Safety | Check potentially unsafe or unsupported responses |

---

# 9. Application Architecture

```mermaid
graph TB
    subgraph Presentation Layer
        React[React]
        Tailwind[Tailwind CSS]
    end

    subgraph Application Layer
        FastAPI[FastAPI]
        Pydantic[Pydantic]
        SQLAlchemy[SQLAlchemy]
    end

    subgraph AI / ML Layer
        LangGraph[LangGraph]
        Router[Router]
        Agents[Specialized Agents]
        RAG[RAG Pipeline]
        LLM[Shared LLM]
    end

    subgraph Data Layer
        Redis[(Redis)]
        Postgres[(PostgreSQL)]
        Qdrant[(Qdrant)]
    end

    subgraph Observability
        Langfuse[Langfuse]
    end

    React --> FastAPI
    Tailwind --> React

    FastAPI --> Pydantic
    FastAPI --> SQLAlchemy
    FastAPI --> LangGraph

    LangGraph --> Router
    Router --> Agents
    Agents --> RAG
    RAG --> Qdrant
    RAG --> LLM

    FastAPI --> Redis
    SQLAlchemy --> Postgres

    LangGraph -. traces .-> Langfuse
    RAG -. traces .-> Langfuse
    LLM -. traces .-> Langfuse

    style FastAPI fill:#4A90D9,stroke:#2E6BAE,color:#fff
    style LangGraph fill:#50C878,stroke:#3DA35D,color:#fff
    style Qdrant fill:#9B59B6,stroke:#7D3C98,color:#fff
    style Redis fill:#F39C12,stroke:#D68910,color:#fff
    style Langfuse fill:#E67E22,stroke:#CA6F1E,color:#fff
```

---

# 10. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Workflow | LangGraph |
| LLM | Open-source / local models |
| Embeddings | Open-source embedding models |
| Vector Database | Qdrant |
| Cache and State | Redis |
| Persistent Database | PostgreSQL |
| Observability | Langfuse |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |

---

# 11. Project Structure

```text
MediOrchestrator/
│
├── frontend/
│
├── backend/
│   ├── api/
│   ├── core/
│   ├── agents/
│   │   ├── general_medicine/
│   │   ├── dermatology/
│   │   ├── nutrition/
│   │   └── dentistry/
│   │
│   ├── routing/
│   ├── rag/
│   ├── memory/
│   ├── cache/
│   ├── safety/
│   ├── observability/
│   └── database/
│
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── AGENT_DESIGN.md
│   ├── RAG_PIPELINE.md
│   ├── CACHING_STRATEGY.md
│   └── IMPLEMENTATION_ROADMAP.md
│
├── docker-compose.yml
└── README.md
```

---

# 12. Final System Summary

```mermaid
mindmap
  root((MediOrchestrator))
    Query Understanding
      Emergency Detection
      Intelligent Routing
      Agent Selection
    Agent System
      General Medicine
      Dermatology
      Nutrition
      Dentistry
      Multi-Agent Support
    Knowledge
      Domain RAG
      Qdrant
      Hybrid Search
      Reranking
    Intelligence
      Shared LLM
      Conversation Memory
      Multi-LLM Support
    Performance
      Redis Cache
      Semantic Cache
      RAG Cache
      Session State
    Reliability
      Safety Validation
      Langfuse
      Evaluation
      Security
```

---

## Design Principle

Every component should solve a clear problem.

| Component | Main Job |
|---|---|
| Router | Understand the query |
| Agent Selector | Choose the right workflow |
| Agents | Provide domain specialization |
| RAG | Retrieve relevant knowledge |
| Shared LLM | Reason and generate |
| Redis | Reduce repeated work and store temporary state |
| LangGraph | Manage the workflow |
| Langfuse | Trace and observe the system |
| Safety Layer | Add protective checks |

The architecture should remain modular so that models, agents, retrieval methods, or infrastructure can be improved without redesigning the complete system.
