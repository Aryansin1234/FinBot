const TICKERS = [
  { sym: 'SPY', val: '+0.82%', pos: true },
  { sym: 'AAPL', val: '+1.24%', pos: true },
  { sym: 'TSLA', val: '-2.11%', pos: false },
  { sym: 'MSFT', val: '+0.65%', pos: true },
  { sym: 'AMZN', val: '+1.05%', pos: true },
  { sym: 'NVDA', val: '+3.41%', pos: true },
  { sym: 'GOOGL', val: '-0.33%', pos: false },
  { sym: 'META', val: '+2.18%', pos: true },
  { sym: 'BTC', val: '+4.52%', pos: true },
  { sym: 'ETH', val: '-1.07%', pos: false },
  { sym: 'GLD', val: '+0.12%', pos: true },
  { sym: 'JPM', val: '+0.44%', pos: true },
]

export default function TickerBanner() {
  const items = [...TICKERS, ...TICKERS]
  return (
    <div className="overflow-hidden py-2" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="ticker-track flex gap-10 whitespace-nowrap w-max">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs font-mono">
            <span style={{ color: 'var(--text-muted)' }}>{t.sym}</span>
            <span style={{ color: t.pos ? 'var(--positive)' : 'var(--negative)' }}>{t.val}</span>
            <span className="text-[10px]" style={{ color: t.pos ? 'var(--positive)' : 'var(--negative)' }}>
              {t.pos ? '▲' : '▼'}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
