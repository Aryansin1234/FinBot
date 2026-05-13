import { Hash, ExternalLink, CheckCircle2 } from 'lucide-react'

export default function ArticleCard({ article }) {
  if (!article) return null

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3"
      style={{ border: '1px solid var(--accent-border)', backgroundColor: 'var(--accent-subtle)' }}>
      <div className="flex items-start gap-2">
        <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Article Loaded</p>
          <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{article.title}</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{article.summary}</p>

      <div className="flex items-center gap-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Hash size={12} />
          <span>{article.word_count?.toLocaleString()} words</span>
        </div>
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs ml-auto transition-colors"
          style={{ color: 'var(--gold)' }}
        >
          <ExternalLink size={11} />
          Source
        </a>
      </div>
    </div>
  )
}
