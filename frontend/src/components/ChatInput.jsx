import { useState } from 'react'
import { Send, Lock } from 'lucide-react'

const SUGGESTED = [
  'What is the main financial topic?',
  'Summarize the key findings',
  'What are the risks mentioned?',
  'What numbers or metrics are cited?',
  'What is the market outlook?',
  'Who are the key companies involved?',
]

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Suggested questions */}
      {!disabled && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0 scrollbar-hide">
          {SUGGESTED.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); }}
              className="text-xs rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0 sm:whitespace-normal sm:shrink"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.borderColor = 'var(--accent-border)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border)' }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Load an article first to start asking questions...' : 'Ask anything about this article...'}
          rows={1}
          style={{
            resize: 'none', minHeight: '46px', maxHeight: '120px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          className="w-full rounded-2xl px-4 py-3.5 pr-14 text-sm transition-all duration-200 overflow-y-auto
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:opacity-90 active:scale-95 transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))', boxShadow: 'var(--shadow-glow)' }}
        >
          <Send size={14} className="text-white" />
        </button>
      </form>

      <p className="text-[10px] text-center flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
        <Lock size={9} />
        Responses are grounded in the article content only
      </p>
    </div>
  )
}
