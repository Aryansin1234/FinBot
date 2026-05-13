import asyncio
import hashlib
import re
import aiohttp
from bs4 import BeautifulSoup
from typing import Optional

# Try to import newspaper3k for better extraction (optional dependency)
try:
    from newspaper import Article as NewspaperArticle
    HAS_NEWSPAPER = True
except ImportError:
    HAS_NEWSPAPER = False


class ArticleService:
    # Rotate through realistic browser user-agents
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    ]

    def _build_headers(self, url: str) -> dict:
        import random
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Upgrade-Insecure-Requests": "1",
            "Referer": "https://www.google.com/",
        }

    async def fetch_article(self, url: str) -> dict:
        """Fetch and parse an article from a URL."""

        # Try newspaper3k first (handles many paywalls/js-heavy sites better)
        if HAS_NEWSPAPER:
            try:
                return await asyncio.get_event_loop().run_in_executor(
                    None, self._fetch_with_newspaper, url
                )
            except Exception:
                pass  # Fall through to aiohttp scraper

        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(connector=connector) as session:
            try:
                async with session.get(
                    url,
                    headers=self._build_headers(url),
                    timeout=aiohttp.ClientTimeout(total=30),
                    allow_redirects=True,
                    max_redirects=10,
                ) as resp:
                    if resp.status in (401, 403):
                        raise ValueError(
                            f"Access denied by the website (HTTP {resp.status}). "
                            "This site may require login or block automated access. "
                            "Try a different article URL or paste the article text directly."
                        )
                    if resp.status != 200:
                        raise ValueError(
                            f"Failed to fetch article (HTTP {resp.status}). "
                            "Please check the URL and try again."
                        )
                    html = await resp.text(errors="replace")
            except aiohttp.ClientConnectorError as e:
                raise ValueError(f"Cannot connect to the URL: {e}")

        soup = BeautifulSoup(html, "html.parser")

        # Remove unwanted tags
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
            tag.decompose()

        # Extract title
        title = ""
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"]
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)
        elif soup.title:
            title = soup.title.get_text(strip=True)
        else:
            title = "Untitled Article"

        # Extract main content
        content_tags = (
            soup.find("article")
            or soup.find("main")
            or soup.find(class_=re.compile(r"article|content|post|story", re.I))
            or soup.find("body")
        )
        paragraphs = content_tags.find_all("p") if content_tags else soup.find_all("p")
        content = "\n\n".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 40)

        if not content:
            raise ValueError(
                "Could not extract meaningful content from this URL. "
                "The page may be behind a paywall, require JavaScript, or block automated access. "
                "Try a direct article link (not a homepage) from a publicly accessible source."
            )

        word_count = len(content.split())
        summary = self._generate_summary(content)

        return {
            "title": title,
            "content": content,
            "summary": summary,
            "word_count": word_count,
            "url": url,
        }

    def _fetch_with_newspaper(self, url: str) -> dict:
        """Fetch article using newspaper3k library."""
        article = NewspaperArticle(url)
        article.download()
        article.parse()
        if not article.text or len(article.text.split()) < 50:
            raise ValueError("newspaper3k could not extract content")
        summary = self._generate_summary(article.text)
        return {
            "title": article.title or "Untitled Article",
            "content": article.text,
            "summary": summary,
            "word_count": len(article.text.split()),
            "url": url,
        }

    def _generate_summary(self, content: str, max_sentences: int = 3) -> str:
        """Simple extractive summary: first N meaningful sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', content)
        meaningful = [s.strip() for s in sentences if len(s.strip()) > 60]
        return " ".join(meaningful[:max_sentences])
