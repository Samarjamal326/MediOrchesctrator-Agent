<div align="center">

# MediOrchestrator

### Intelligent Healthcare AI Orchestration System

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

---

**MediOrchestrator** is an intelligent healthcare AI orchestration platform that routes health queries to the right medical domain, retrieves relevant knowledge, and generates safer responses.

[Documentation](#documentation) · [Architecture](#architecture) · [Project Structure](#project-structure) · [Tech Stack](#technology-stack)

</div>

---

## What Makes This Different

| Traditional Health Chatbot | MediOrchestrator |
|---|---|
| Single LLM, generic responses | Shared LLM with domain-specialized agents |
| No medical context | RAG-powered domain knowledge (Qdrant) |
| No routing intelligence | Router + agent selector workflow |
| Static conversations | Conversation memory across sessions |
| Single domain | Multi-domain with extensible agent folders |
| No validation | Input/output safety validation |

---

## Architecture

One central orchestrator handles each query through: cache check → emergency detection → routing → agent selection → RAG → LLM → safety validation → memory.

See [docs/MediOrchestrator_Project_Overview_v2.md](docs/MediOrchestrator_Project_Overview_v2.md) for full architecture diagrams.

---

## Documentation

| Document | Description |
|---|---|
| [Project Overview v2](docs/MediOrchestrator_Project_Overview_v2.md) | Current architecture, tech stack, and target structure |
| [Project Foundation](docs/01_Project_Foundation.md) | Vision, objectives, scope, features |
| [System Architecture & Design](docs/02_System_Architecture_and_Design.md) | Full system architecture, APIs, deployment |
| [AI & Agent Architecture](docs/03_AI_and_Agent_Architecture.md) | Agentic AI, orchestration, RAG, agents |
| [Development & Implementation](docs/04_Development_and_Implementation.md) | Coding standards, CI/CD, testing |
| [Deployment, Security & Research](docs/05_Deployment_Security_Research.md) | Deployment, security, observability |

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, Pydantic, SQLAlchemy |
| **Workflow** | LangGraph |
| **LLM / Embeddings** | Open-source / local models |
| **Vector DB** | Qdrant |
| **Cache & State** | Redis |
| **Database** | PostgreSQL |
| **Observability** | Langfuse |
| **Infra** | Docker, Docker Compose, GitHub Actions |

---

## Healthcare Domains (Initial)

| Domain | Folder |
|---|---|
| General Medicine | `backend/agents/general_medicine/` |
| Dermatology | `backend/agents/dermatology/` |
| Nutrition | `backend/agents/nutrition/` |
| Dentistry | `backend/agents/dentistry/` |

Additional domains can be added as new agent folders without redesigning the system.

---

## Project Structure

```
MediOrchestrator/
│
├── frontend/                    # React + Vite + Tailwind
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── api/                     # FastAPI route handlers
│   ├── core/                    # Database, Redis, security
│   ├── agents/                  # Orchestrator + domain agents
│   │   ├── general_medicine/
│   │   ├── dermatology/
│   │   ├── nutrition/
│   │   └── dentistry/
│   ├── routing/                 # Router + agent selector
│   ├── rag/                     # Retrieval pipeline (Qdrant)
│   ├── memory/                  # Conversation memory
│   ├── cache/                   # Response, semantic, RAG cache
│   ├── safety/                  # Input/output validation
│   ├── observability/           # Langfuse tracing
│   └── database/                # PostgreSQL models & connection
│
├── docs/
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### Quick Start

```bash
# Start services
docker-compose up -d

# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

---

<div align="center">

**MediOrchestrator — Where AI Orchestration Meets Healthcare Intelligence**

</div>
