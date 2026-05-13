import uuid
import os
import logging
from typing import Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import chromadb
from langchain_groq import ChatGroq
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
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


class RAGService:
    def __init__(self):
        self.sessions: dict[str, Chroma] = {}
        # Larger chunks = fewer chunks = fewer embed API calls
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        # Google embeddings — lightweight, already in requirements, 1K/day free
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=GOOGLE_API_KEY,
        )
        # Groq LLM — 14,400 req/day free
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            api_key=GROQ_API_KEY,
        )

    def _embed_texts(self, texts: list[str]) -> list:
        """Embed texts locally — no API calls, no quota."""
        logger.info(f"Embedding {len(texts)} chunks locally")
        return self.embeddings.embed_documents(texts)

    async def ingest_article(self, article: dict, session_id: Optional[str] = None) -> str:
        """Chunk, embed, and store article content in a session-specific vector store."""
        if not session_id:
            session_id = str(uuid.uuid4())

        chunks = self.splitter.split_text(article["content"])
        metadatas = [
            {"source": article["url"], "title": article["title"], "chunk": i}
            for i, _ in enumerate(chunks)
        ]
        logger.info(f"Ingesting {len(chunks)} chunks for session {session_id}")

        persist_path = os.path.join(CHROMA_PERSIST_DIR, session_id)

        # Embed locally — unlimited, no API quota
        embeddings_list = self._embed_texts(chunks)

        # Build Chroma store from pre-computed embeddings (no extra API calls)
        client = chromadb.PersistentClient(path=persist_path)
        collection = client.get_or_create_collection(name="articles")
        collection.add(
            ids=[f"{session_id}_{i}" for i in range(len(chunks))],
            documents=chunks,
            embeddings=embeddings_list,
            metadatas=metadatas,
        )
        vectorstore = Chroma(
            client=client,
            collection_name="articles",
            embedding_function=self.embeddings,
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

        vectorstore = self.sessions[session_id]
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": FINANCE_PROMPT},
        )
        result = qa_chain.invoke({"query": question})
        answer = result["result"]
        sources = list(set(
            doc.metadata.get("source", "") for doc in result.get("source_documents", [])
        ))
        return {"answer": answer, "sources": sources}

    async def clear_session(self, session_id: str):
        """Remove session from memory and disk."""
        if session_id in self.sessions:
            self.sessions[session_id].delete_collection()
            del self.sessions[session_id]
