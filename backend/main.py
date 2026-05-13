from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional
from dotenv import load_dotenv
import uvicorn

load_dotenv()  # Load .env before importing services

from services.article_service import ArticleService
from services.rag_service import RAGService

app = FastAPI(
    title="FinanceBot API",
    description="AI-powered finance article Q&A chatbot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

article_service = ArticleService()
rag_service = RAGService()


class LoadArticleRequest(BaseModel):
    url: str
    session_id: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    session_id: str


class LoadArticleResponse(BaseModel):
    session_id: str
    title: str
    summary: str
    word_count: int
    source_url: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    confidence: Optional[float] = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "FinanceBot API"}


@app.post("/api/load-article", response_model=LoadArticleResponse)
async def load_article(request: LoadArticleRequest):
    """Scrape the article from URL, chunk it, embed and store in vector DB."""
    try:
        article = await article_service.fetch_article(request.url)
        session_id = await rag_service.ingest_article(article, request.session_id)
        return LoadArticleResponse(
            session_id=session_id,
            title=article["title"],
            summary=article["summary"],
            word_count=article["word_count"],
            source_url=request.url,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Ask a question against the loaded article."""
    try:
        result = await rag_service.query(request.session_id, request.question)
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            confidence=result.get("confidence"),
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found. Please load an article first.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a session's vector store."""
    await rag_service.clear_session(session_id)
    return {"message": "Session cleared"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
