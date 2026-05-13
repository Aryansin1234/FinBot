# 🧪 How to Test FinBot AI

A step-by-step guide to run and test the FinBot AI project locally.

---

## 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11+ | `python3 --version` |
| Node.js | 20+ | `node --version` |
| OpenAI API Key | — | [Get one here](https://platform.openai.com/api-keys) |

---

## 2. Start the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="sk-your-key-here"
uvicorn main:app --reload --port 8000
```

✅ Verify: Open **http://localhost:8000/health** — you should see:
```json
{"status": "ok", "service": "FinanceBot API"}
```

---

## 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Verify: Open **http://localhost:5173** — you should see the FinBot AI welcome screen.

---

## 4. Test with Sample Articles

### 📰 Article 1 — Tech / AI Industry

**URL:**
```
https://www.reuters.com/technology/artificial-intelligence/
```

**Questions to ask:**
- `What are the key AI trends mentioned in this article?`
- `Which companies are discussed and what are they doing?`
- `What are the potential risks or concerns raised?`
- `Summarize the article in 5 bullet points`

---

### 📰 Article 2 — Stock Market / Economy

**URL:**
```
https://www.cnbc.com/2025/05/12/stock-market-today-live-updates.html
```

**Questions to ask:**
- `How did the major indices perform today?`
- `What sectors led the gains or losses?`
- `What macroeconomic factors were mentioned?`
- `What is the market outlook based on this article?`

---

### 📰 Article 3 — Company Earnings

**URL:**
```
https://finance.yahoo.com/news/
```

**Questions to ask:**
- `What are the key revenue and profit numbers?`
- `How does this quarter compare to last quarter?`
- `What guidance did management provide?`
- `What risks or challenges were highlighted?`

---

### 📰 Article 4 — Cryptocurrency / Blockchain

**URL:**
```
https://www.coindesk.com/markets/
```

**Questions to ask:**
- `What is the current sentiment around Bitcoin?`
- `What price levels or metrics are mentioned?`
- `Are there any regulatory developments discussed?`
- `Summarize the key takeaways for a crypto investor`

---

### 📰 Article 5 — Central Bank / Interest Rates

**URL:**
```
https://www.reuters.com/markets/us/
```

**Questions to ask:**
- `What is the Federal Reserve's current stance on interest rates?`
- `What economic indicators are discussed?`
- `What are analysts predicting for the next quarter?`
- `What are the risks to the economic outlook?`

---

## 5. Testing the Full Flow

1. **Paste a URL** in the sidebar input and click **"Analyze Article"**
2. Wait for the article to load — you'll see a confirmation card with the title, word count, and summary
3. **Ask a question** from the suggestions above or type your own
4. The bot will respond with a grounded answer + source citation links
5. Click **"New Article"** in the header to reset and try another URL

---

## 6. General-Purpose Questions (Work with Any Article)

These questions work well regardless of the article topic:

| # | Question |
|---|----------|
| 1 | `Give me a complete summary of this article` |
| 2 | `What are the most important numbers or statistics mentioned?` |
| 3 | `Who are the key people or companies mentioned?` |
| 4 | `What are the main risks or concerns discussed?` |
| 5 | `What is the overall sentiment — bullish, bearish, or neutral?` |
| 6 | `What actionable insights can I take from this article?` |
| 7 | `Are there any comparisons to previous time periods?` |
| 8 | `What is the author's main argument or thesis?` |

---

## 7. API Testing (Optional — via cURL)

You can also test the backend directly:

### Load an article
```bash
curl -X POST http://localhost:8000/api/load-article \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.reuters.com/technology/artificial-intelligence/"}'
```

### Ask a question (use the `session_id` from above)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "YOUR_SESSION_ID", "question": "Summarize this article"}'
```

### Clear session
```bash
curl -X DELETE http://localhost:8000/api/session/YOUR_SESSION_ID
```

---

## 8. Docker Compose (Full Stack)

```bash
export OPENAI_API_KEY="sk-your-key-here"
docker-compose up --build
```

App runs at **http://localhost:3000** (frontend proxies API calls to backend automatically).

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `Session not found` | You need to load an article before chatting |
| `Failed to load article` | Check if the URL is accessible and contains readable text |
| `No OpenAI API key configured` | Set `OPENAI_API_KEY` env variable before starting backend |
| Blank responses | Some sites block scraping — try a different article URL |
| CORS errors in browser | Make sure backend is running on port 8000 |
