import uuid
import os
from typing import Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import PromptTemplate

from services.aicore_client import (
    get_chat_base_url,
    get_embedding_base_url,
    get_default_headers,
    AICORE_CLIENT_ID,
)

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

FINANCE_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are FinBot, an expert AI financial analyst assistant. 
Your task is to answer questions about the financial article provided below with precision, clarity, and depth.

Guidelines:
- Be concise but comprehensive
- Highlight key numbers, percentages, or financial metrics when relevant
- If the answer is not in the article, say so clearly — do not hallucinate
- Use bullet points for multi-part answers
- Reference specific sections of the article when possible

Article Context:
{context}

Question: {question}

Answer:"""
)


class _AICoreHeaderProvider:
    """Injects fresh AI Core auth headers into every LangChain HTTP call."""

    def __call__(self):
        return get_default_headers()


class RAGService:
    def __init__(self):
        self.sessions: dict[str, Chroma] = {}
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

        # Use SAP AI Core if credentials are set, otherwise fall back to direct OpenAI
        if AICORE_CLIENT_ID:
            headers = get_default_headers()
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-ada-002",
                openai_api_key="aicore",          # placeholder — auth via header
                openai_api_base=get_embedding_base_url(),
                default_headers=headers,
                check_embedding_ctx_length=False,
            )
            self.llm = ChatOpenAI(
                model="anthropic--claude-4.6-sonnet",
                temperature=0.2,
                openai_api_key="aicore",
                openai_api_base=get_chat_base_url(),
                default_headers=headers,
            )
        else:
            # Fallback: direct OpenAI key
            openai_key = os.getenv("OPENAI_API_KEY", "")
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
            )
            self.llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.2,
                openai_api_key=openai_key,
            ) if openai_key else None

    def _refresh_headers(self):
        """Refresh AI Core auth token in LLM/embedding clients."""
        if AICORE_CLIENT_ID:
            headers = get_default_headers()
            if hasattr(self.llm, 'default_headers'):
                self.llm.default_headers = headers
            if hasattr(self.embeddings, 'default_headers'):
                self.embeddings.default_headers = headers

    async def ingest_article(self, article: dict, session_id: Optional[str] = None) -> str:
        """Chunk, embed, and store article content in a session-specific vector store."""
        if not session_id:
            session_id = str(uuid.uuid4())

        self._refresh_headers()

        chunks = self.splitter.split_text(article["content"])
        metadatas = [{"source": article["url"], "title": article["title"], "chunk": i} for i, _ in enumerate(chunks)]

        persist_path = os.path.join(CHROMA_PERSIST_DIR, session_id)
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            metadatas=metadatas,
            persist_directory=persist_path,
        )
        self.sessions[session_id] = vectorstore
        return session_id

    async def query(self, session_id: str, question: str) -> dict:
        """RAG query against the session's vector store."""
        if session_id not in self.sessions:
            persist_path = os.path.join(CHROMA_PERSIST_DIR, session_id)
            if os.path.exists(persist_path):
                self.sessions[session_id] = Chroma(
                    persist_directory=persist_path,
                    embedding_function=self.embeddings,
                )
            else:
                raise KeyError(f"Session {session_id} not found")

        self._refresh_headers()

        vectorstore = self.sessions[session_id]
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

        if self.llm:
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
                chain_type_kwargs={"prompt": FINANCE_PROMPT},
            )
            result = qa_chain.invoke({"query": question})
            answer = result["result"]
            sources = list(set(doc.metadata.get("source", "") for doc in result.get("source_documents", [])))
        else:
            docs = retriever.get_relevant_documents(question)
            answer = (
                "⚠️ No LLM configured. Here are the most relevant excerpts:\n\n"
                + "\n\n---\n\n".join(doc.page_content for doc in docs[:2])
            )
            sources = list(set(doc.metadata.get("source", "") for doc in docs))

        return {"answer": answer, "sources": sources}

    async def clear_session(self, session_id: str):
        """Remove session from memory and disk."""
        if session_id in self.sessions:
            self.sessions[session_id].delete_collection()
            del self.sessions[session_id]
