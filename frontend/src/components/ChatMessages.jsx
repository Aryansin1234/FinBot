import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, ExternalLink } from 'lucide-react'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 sm:gap-3 message-enter">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}>
        <Bot size={14} className="text-white sm:hidden" />
        <Bot size={16} className="text-white hidden sm:block" />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-3 py-2.5 sm:px-4 sm:py-3"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex gap-1.5 items-center h-5">
          <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
      </div>
    </div>
  )
}

function BotMessage({ content, sources }) {
  return (
    <div className="flex items-end gap-2 sm:gap-3 message-enter">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}>
        <Bot size={14} className="text-white sm:hidden" />
        <Bot size={16} className="text-white hidden sm:block" />
      </div>
      <div className="flex-1 max-w-[92%] sm:max-w-[85%]">
        <div className="rounded-2xl rounded-bl-sm px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm leading-relaxed"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li style={{ color: 'var(--text-secondary)' }}>{children}</li>,
              strong: ({ children }) => <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>{children}</strong>,
              em: ({ children }) => <em style={{ color: 'var(--gold)' }}>{children}</em>,
              code: ({ inline, children }) =>
                inline
                  ? <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent)' }}>{children}</code>
                  : <pre className="rounded-lg p-3 overflow-x-auto my-2" style={{ backgroundColor: 'var(--bg-input)' }}><code className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{children}</code></pre>,
              blockquote: ({ children }) => (
                <blockquote className="pl-3 italic my-2" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-secondary)' }}>{children}</blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] rounded-full px-2.5 py-1 transition-colors"
                style={{ color: 'var(--gold)', backgroundColor: 'var(--gold-subtle)', border: '1px solid var(--gold-border)' }}
              >
                <ExternalLink size={9} />
                Source {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserMessage({ content }) {
  return (
    <div className="flex items-end gap-2 sm:gap-3 flex-row-reverse message-enter">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--gold), var(--accent))' }}>
        <User size={14} className="text-white sm:hidden" />
        <User size={16} className="text-white hidden sm:block" />
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm"
        style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)' }}>
        {content}
      </div>
    </div>
  )
}

export default function ChatMessages({ messages, isTyping }) {
  return (
    <div className="flex flex-col gap-5">
      {messages.map((msg, i) =>
        msg.role === 'user'
          ? <UserMessage key={i} content={msg.content} />
          : <BotMessage key={i} content={msg.content} sources={msg.sources} />
      )}
      {isTyping && <TypingIndicator />}
    </div>
  )
}
