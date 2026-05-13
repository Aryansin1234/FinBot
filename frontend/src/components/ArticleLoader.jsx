import { useState } from 'react'
import { Link2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { loadArticle } from '../api'

export default function ArticleLoader({ onArticleLoaded, isLoading, setIsLoading }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const exampleUrls = [
    'https://finance.yahoo.com/news/',
    'https://www.reuters.com/business/finance/',
    'https://www.bloomberg.com/markets',
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setError('')
    setIsLoading(true)
    try {
      const data = await loadArticle(url.trim())
      onArticleLoaded(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load article. Please check the URL.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Link2 size={16} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Load Article</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/finance-article"
            className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs rounded-lg p-2.5"
            style={{ color: 'var(--negative)', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))', boxShadow: 'var(--shadow-glow)' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing Article...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analyze Article
            </>
          )}
        </button>
      </form>

      <div className="mt-1">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Try an example</p>
        <div className="flex flex-col gap-1.5">
          {exampleUrls.map((u, i) => (
            <button
              key={i}
              onClick={() => setUrl(u)}
              className="text-left text-xs truncate rounded-lg px-3 py-1.5 transition-colors"
              style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)' }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
