import { useState, useRef, useEffect, useCallback } from 'react'
import { Activity, Bot, Zap, RefreshCw, PanelLeftClose, PanelLeft, Sun, Moon, X } from 'lucide-react'
import { useTheme } from './ThemeContext'
import TickerBanner from './components/TickerBanner'
import ArticleLoader from './components/ArticleLoader'
import ArticleCard from './components/ArticleCard'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import StatsBar from './components/StatsBar'
import { sendMessage, clearSession } from './api'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

export default function App() {
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()
  const [article, setArticle] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const chatEndRef = useRef(null)

  // Auto-close sidebar on mobile when resizing
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleArticleLoaded = useCallback((data) => {
    setArticle(data)
    setSessionId(data.session_id)
    const intro = `**Article loaded successfully!** \n\nI've analyzed *${data.title}* (${data.word_count?.toLocaleString()} words). \n\nAsk me anything about this article — key metrics, risks, market outlook, or a full summary.`
    setMessages([{ role: 'bot', content: intro, sources: [] }])
    // Auto-close sidebar on mobile after loading
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  async function handleSend(text) {
    if (!sessionId) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsTyping(true)
    try {
      const data = await sendMessage(sessionId, text)
      setMessages(prev => [...prev, { role: 'bot', content: data.answer, sources: data.sources }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Something went wrong. Please try again.', sources: [] }])
    } finally {
      setIsTyping(false)
    }
  }

  function handleReset() {
    if (sessionId) clearSession(sessionId).catch(() => {})
    setArticle(null)
    setSessionId(null)
    setMessages([])
    if (isMobile) setSidebarOpen(true)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      <TickerBanner />

      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 backdrop-blur-sm"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}>
              <Activity size={isMobile ? 17 : 20} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2"
              style={{ backgroundColor: 'var(--positive)', borderColor: 'var(--bg-surface)' }} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold gradient-text leading-tight">FinBot AI</h1>
            <p className="text-[9px] sm:text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Zap size={9} /> <span className="hidden xs:inline">Intelligent</span> Financial Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle */}
          <button onClick={toggle}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 pulse-ring"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {article && (
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 transition-all"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <RefreshCw size={12} /> <span className="hidden sm:inline">New Article</span>
            </button>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)', backgroundColor: sidebarOpen ? 'var(--accent-subtle)' : 'transparent' }}>
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${isMobile
              ? `absolute top-0 left-0 bottom-0 z-30 w-[85vw] max-w-[360px] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : `shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-[340px]' : 'w-0 overflow-hidden'}`
            }
            p-4 flex flex-col gap-4 overflow-y-auto
          `}
          style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end w-8 h-8 rounded-lg flex items-center justify-center -mt-1 -mr-1 mb-1"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}>
              <X size={16} />
            </button>
          )}
          <ArticleLoader onArticleLoaded={handleArticleLoaded} isLoading={isLoading} setIsLoading={setIsLoading} />
          <ArticleCard article={article} />
          {article && <StatsBar />}
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!article ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl flex items-center justify-center float"
                  style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--border)' }}>
                  <Bot size={isMobile ? 28 : 36} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2 sm:mb-3">Welcome to FinBot AI</h2>
                <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6" style={{ color: 'var(--text-muted)' }}>
                  Paste a link to any financial article and I'll analyze it for you. Ask questions, get summaries, extract key metrics, and uncover insights — all powered by AI.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {['RAG-Powered', 'Source-Grounded', 'Real-Time Analysis', 'Finance-Focused'].map((tag, i) => (
                    <span key={i} className="text-[10px] sm:text-xs rounded-full px-2.5 py-1 sm:px-3"
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 relative">
                <div className="scan-line" />
                <ChatMessages messages={messages} isTyping={isTyping} />
                <div ref={chatEndRef} />
              </div>
              <div className="p-2.5 sm:p-4 backdrop-blur-sm"
                style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <ChatInput onSend={handleSend} disabled={isTyping || !sessionId} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
