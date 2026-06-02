import { Droplets, FlaskConical } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  pumps: [boolean, boolean, boolean, boolean]
  onToggle: (index: 0 | 1 | 2 | 3) => void
  disabled?: boolean
}

const PUMPS: { label: string; sub: string; Icon: LucideIcon }[] = [
  { label: 'Bomba N',   sub: 'Nitrogênio', Icon: FlaskConical },
  { label: 'Bomba P',   sub: 'Fósforo',    Icon: FlaskConical },
  { label: 'Bomba K',   sub: 'Potássio',   Icon: FlaskConical },
  { label: 'Irrigação', sub: 'Água pura',  Icon: Droplets     },
]

export function PumpControl({ pumps, onToggle, disabled }: Props) {
  return (
    <section className="rounded-xl border border-bio-border bg-bio-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="w-4 h-4 text-bio-blue" />
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Bombas Hidráulicas</h2>
        <span className="ml-auto text-[10px] text-bio-muted">4 Canais</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PUMPS.map(({ label, sub, Icon }, i) => {
          const active = pumps[i]
          return (
            <button
              key={i}
              onClick={() => !disabled && onToggle(i as 0 | 1 | 2 | 3)}
              disabled={disabled}
              className={`
                flex items-center gap-3 p-3 rounded-lg border text-left min-h-[56px]
                transition-all duration-200 focus:outline-none active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                ${active
                  ? 'bg-bio-green/10 border-bio-green shadow-[0_0_12px_rgba(54,211,131,0.12)]'
                  : 'bg-bio-border/15 border-bio-border hover:border-bio-muted'
                }
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-bio-green' : 'text-bio-muted'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold leading-none ${active ? 'text-bio-green' : 'text-white'}`}>
                  {label}
                </p>
                <p className="text-[9px] text-bio-muted mt-0.5">{sub}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-bio-green animate-pulse' : 'bg-bio-border'}`} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
