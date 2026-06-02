import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: number | undefined
  unit: string
  barColor: string
  barMax: number
  iconClass?: string
}

export function ClimateCard({ icon: Icon, label, value, unit, barColor, barMax, iconClass = 'text-bio-muted' }: Props) {
  const pct = value !== undefined ? Math.min((value / barMax) * 100, 100) : 0

  return (
    <div className="rounded-xl border border-bio-border bg-bio-card p-4 flex items-center gap-3">
      <div className={`${iconClass} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-bio-muted uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white tabular-nums leading-tight">
          {value ?? '--'}
          <span className="text-xs font-normal text-bio-muted ml-1">{unit}</span>
        </p>
        <div className="h-1 bg-bio-border rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
