# 🎮 Bubbles — Real-Time Multi-Agent Collaboration & Interactive State Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

An interactive, real-time web application built for stateful multi-agent communication, async processing, and dynamic UI synchronization. **Bubbles** demonstrates a production-grade microservice architecture bridging modern reactive frontends with asynchronous, telemetry-monitored ML/backend workflows.

---

## 🏛 System Architecture

Bubbles follows an event-driven architecture designed for high-concurrency client connections, sub-100ms UI sync, and predictable background task execution.

```
                  +-----------------------------------+
                  |      React + TypeScript UI        |
                  |  (State Sync, WebSockets, Canvas) |
                  +-----------------+-----------------+
                                    |
                            WebSocket / REST API
                                    |
                  +-----------------v-----------------+
                  |       FastAPI Gateway / API       |
                  |   (Auth, Routing, Rate Limiting)  |
                  +--------+----------------+---------+
                           |                |
                Task Queue |                | Pub/Sub
                           v                v
                 +----------------+  +--------------+
                 |  Redis Queue   |  | Redis PubSub |
                 +--------+-------+  +-------+------+
                          |                  |
                          v                  v
                 +----------------+  +--------------+
                 | Async Worker   |  | Real-Time    |
                 | (ML Execution) |  | Sync Manager |
                 +----------------+  +--------------+
```

---

## ✨ Key Technical Features

### 1. High-Throughput WebSocket Broadcast Engine
- **Sub-100ms Latency:** Low-overhead WebSocket frame handler with connection pooling, automatic heartbeat/reconnection strategies, and message compression.
- **State Synchronization:** Event-driven pub/sub model via Redis to maintain consistent canvas/node state across multiple active clients.

### 2. Asynchronous Task Execution Pipeline
- **Decoupled Heavy Computation:** Offloads compute-heavy AI/ML execution and data processing off the main HTTP thread onto isolated background workers.
- **Backpressure & Queue Management:** Task lifecycle tracking with retry mechanisms, graceful degradation, and structured failure logs.

### 3. Modular Frontend Component Architecture
- **Optimized Rendering:** Uses canvas/virtualized DOM techniques to render interactive UI elements without triggering frame drops or re-render bottlenecks.
- **Strict Typing & State Persistence:** Custom React hooks paired with Zustand/Redux for deterministic local state sync and zero-drift client storage.

### 4. Containerized & Production-Ready MLOps Workflow
- **Dockerized Microservices:** Isolated Docker Compose environment for seamless setup across Local, Staging, and Production environments.
- **Observability:** Structured JSON telemetry logging, request tracing, and latency/memory footprint tracking.

---

## 🛠 Tech Stack

| Domain | Technologies Used |
|---|---|
| **Frontend** | TypeScript, React 18, Tailwind CSS, WebSockets API, Vite |
| **Backend & APIs** | Python 3.11, FastAPI, Pydantic v2, Asyncio, WebSockets |
| **Messaging & Cache** | Redis (Pub/Sub + Task Queueing), PostgreSQL / SQLAlchemy |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, GitHub Actions (CI/CD) |
| **Quality & Testing** | `pytest`, `Ruff`, `mypy`, ESLint, Vitest |

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js `>= 18.x`
- Python `>= 3.11`

### Quick Start with Docker

```bash
# 1. Clone repository
git clone https://github.com/thinkingdev923/Bubbles.git
cd Bubbles

# 2. Configure environment variables
cp .env.example .env

# 3. Launch full stack via Docker Compose
docker-compose up --build -d
```

The application will be accessible at:
- **Frontend App:** `http://localhost:3000`
- **FastAPI Documentation:** `http://localhost:8000/docs`
- **WebSocket Endpoint:** `ws://localhost:8000/ws`

---

## ⚙️ Development Setup

<details>
<summary><strong>Manual Setup (Local Backend & Frontend)</strong></summary>

<br>

#### Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

</details>

---

## 🧪 Testing & Code Quality

```bash
# Run backend tests and coverage report
pytest --cov=app --cov-report=term-missing

# Run backend static type checks
mypy app/

# Run frontend unit tests
npm run test
```

---

## 🛡 Security & Best Practices

- **Strict Input Validation:** Enforced via Pydantic v2 schemas at all API entry points.
- **CORS & Rate Limiting:** Enforced policy middleware preventing unauthorized origin access and brute-force traffic.
- **Environment Isolation:** Zero hardcoded credentials; fully driven by `.env` runtime configurations.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
