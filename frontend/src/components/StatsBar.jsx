import { TrendingUp, BarChart2, Brain, Shield } from 'lucide-react'

const STATS = [
  { icon: TrendingUp, label: 'Articles Analyzed', value: '12K+', color: 'var(--accent)' },
  { icon: BarChart2, label: 'Insights Generated', value: '85K+', color: 'var(--gold)' },
  { icon: Brain, label: 'AI Accuracy', value: '94%', color: 'var(--positive)' },
  { icon: Shield, label: 'Data Privacy', value: '100%', color: 'var(--warning)' },
]

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {STATS.map(({ icon: Icon, label, value, color }, i) => (
        <div key={i} className="rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-base font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
