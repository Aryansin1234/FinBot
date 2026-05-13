# 🤖 FinBot AI — Intelligent Financial Article Analyzer

> Paste any financial article URL and ask intelligent questions — powered by RAG (Retrieval-Augmented Generation).

![Python](https://img.shields.io/badge/Python-3.11-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![LangChain](https://img.shields.io/badge/LangChain-0.2-green)

## ✨ Features

- 📰 **Article Ingestion** — Paste any URL and the app scrapes, chunks, and embeds the article content
- 🧠 **RAG-Powered Q&A** — Uses vector similarity search + GPT-4o-mini for grounded answers
- 💬 **Interactive Chat** — Beautiful chat UI with markdown rendering, source citations
- 📊 **Finance-Focused** — System prompt tuned for financial analysis (metrics, risks, outlook)
- 🎨 **Bloomberg-Inspired UI** — Dark theme, ticker banner, animated gradients
- 🐳 **Kyma/K8s Ready** — Dockerized with Kubernetes manifests for SAP Kyma deployment

## 🏗️ Architecture

```
User → React Frontend → FastAPI Backend → Article Scraper
                                        → ChromaDB Vector Store
                                        → OpenAI GPT-4o-mini (RAG)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenAI API key

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt
export OPENAI_API_KEY="sk-..."
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the frontend proxies API calls to the backend.

### 3. Docker Compose (Full Stack)

```bash
export OPENAI_API_KEY="sk-..."
docker-compose up --build
```

App runs at **http://localhost:3000**

## ☁️ Deploy to Kyma

1. Build & push Docker images:
```bash
docker build -t <registry>/finbot-backend:latest ./backend
docker build -t <registry>/finbot-frontend:latest ./frontend
docker push <registry>/finbot-backend:latest
docker push <registry>/finbot-frontend:latest
```

2. Update `k8s/deployment.yaml` — replace `<YOUR_REGISTRY>` and `<YOUR_OPENAI_API_KEY>`

3. Apply:
```bash
kubectl apply -f k8s/deployment.yaml
```

## 📁 Project Structure

```
├── backend/
│   ├── main.py               # FastAPI app
│   ├── services/
│   │   ├── article_service.py # URL scraper
│   │   └── rag_service.py     # Embeddings + LLM chain
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app layout
│   │   ├── api.js             # Backend API client
│   │   └── components/        # React components
│   ├── nginx.conf             # Production proxy config
│   └── Dockerfile
├── k8s/
│   └── deployment.yaml        # Kyma/K8s manifests
├── docker-compose.yml
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini & embeddings | Yes |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path (default: `./chroma_db`) | No |
| `VITE_API_URL` | Backend URL for frontend (default: proxied) | No |

## 📝 License

MIT
