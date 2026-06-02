interface Props {
  element: 'N' | 'P' | 'K'
  label: string
  value: number | undefined
  max: number
}

const STYLE: Record<'N' | 'P' | 'K', { border: string; text: string; bar: string }> = {
  N: { border: 'border-bio-red/20',   text: 'text-bio-red',   bar: 'bg-bio-red' },
  P: { border: 'border-bio-gold/20',  text: 'text-bio-gold',  bar: 'bg-bio-gold' },
  K: { border: 'border-bio-green/20', text: 'text-bio-green', bar: 'bg-bio-green' },
}

export function NutrientCard({ element, label, value, max }: Props) {
  const s = STYLE[element]
  const pct = value !== undefined ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className={`rounded-xl border ${s.border} bg-bio-card p-3 flex flex-col`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xl font-black ${s.text}`}>{element}</span>
        <span className="text-[9px] text-bio-muted text-right leading-tight">{label}</span>
      </div>
      <div className="mt-auto">
        <span className="text-2xl font-bold text-white tabular-nums">
          {value ?? '--'}
        </span>
        <span className="text-[10px] text-bio-muted ml-1">mg/kg</span>
      </div>
      <div className="h-1 bg-bio-border rounded-full overflow-hidden mt-2.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
