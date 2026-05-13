"""
SAP AI Core / Generative AI Hub client.
Handles OAuth token lifecycle and provides a proxy-compatible base URL
so that LangChain's ChatOpenAI and OpenAIEmbeddings work seamlessly
through SAP AI Core deployments.
"""

import os
import time
import httpx

# ── Credentials from env / service binding ──────────────
AICORE_CLIENT_ID = os.getenv("AICORE_CLIENT_ID", "")
AICORE_CLIENT_SECRET = os.getenv("AICORE_CLIENT_SECRET", "")
AICORE_AUTH_URL = os.getenv("AICORE_AUTH_URL", "")
AICORE_API_URL = os.getenv("AICORE_API_URL", "")
AICORE_RESOURCE_GROUP = os.getenv("AICORE_RESOURCE_GROUP", "default")

# Deployment IDs
DEPLOYMENT_CHAT = os.getenv("AICORE_DEPLOYMENT_CHAT", "dec9c6f3f9b9873e")       # anthropic--claude-4.6-sonnet
DEPLOYMENT_EMBEDDING = os.getenv("AICORE_DEPLOYMENT_EMBEDDING", "d98ad22030b8725a")  # text-embedding-ada-002


class AICoreTokenManager:
    """Manages OAuth2 client-credentials token with auto-refresh."""

    def __init__(self):
        self._token: str = ""
        self._expires_at: float = 0

    def get_token(self) -> str:
        if time.time() >= self._expires_at - 60:
            self._refresh()
        return self._token

    def _refresh(self):
        resp = httpx.post(
            f"{AICORE_AUTH_URL}/oauth/token",
            data={
                "grant_type": "client_credentials",
                "client_id": AICORE_CLIENT_ID,
                "client_secret": AICORE_CLIENT_SECRET,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        self._token = data["access_token"]
        self._expires_at = time.time() + data.get("expires_in", 3600)


# Singleton
token_manager = AICoreTokenManager()


def get_chat_base_url() -> str:
    """OpenAI-compatible base URL for the chat deployment."""
    return f"{AICORE_API_URL}/v2/inference/deployments/{DEPLOYMENT_CHAT}"


def get_embedding_base_url() -> str:
    """OpenAI-compatible base URL for the embedding deployment."""
    return f"{AICORE_API_URL}/v2/inference/deployments/{DEPLOYMENT_EMBEDDING}"


def get_default_headers() -> dict:
    """Headers required for every AI Core request."""
    return {
        "Authorization": f"Bearer {token_manager.get_token()}",
        "AI-Resource-Group": AICORE_RESOURCE_GROUP,
        "Content-Type": "application/json",
    }
