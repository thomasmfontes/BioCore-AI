import { Sun } from 'lucide-react'
import type { LightStage } from '../types'

interface Props {
  stage: LightStage
  onChange: (stage: LightStage) => void
  disabled?: boolean
}

const STAGES: { value: LightStage; label: string; sub: string }[] = [
  { value: 0, label: 'OFF',   sub: 'Noite'   },
  { value: 1, label: '25%',   sub: 'Nascer'  },
  { value: 2, label: '50%',   sub: 'Nublado' },
  { value: 3, label: '100%',  sub: 'Pleno'   },
]

export function LightControl({ stage, onChange, disabled }: Props) {
  return (
    <section className="rounded-xl border border-bio-border bg-bio-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-4 h-4 text-bio-gold" />
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Iluminação</h2>
        <span className="ml-auto text-[10px] text-bio-muted">PWM Dimerizável</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {STAGES.map(s => {
          const active = stage === s.value
          return (
            <button
              key={s.value}
              onClick={() => !disabled && onChange(s.value)}
              disabled={disabled}
              className={`
                h-14 rounded-lg flex flex-col items-center justify-center gap-0.5
                border transition-all duration-200 focus:outline-none active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed
                ${active
                  ? 'bg-bio-gold/15 border-bio-gold shadow-[0_0_14px_rgba(255,184,0,0.2)]'
                  : 'bg-bio-border/20 border-bio-border hover:border-bio-muted'
                }
              `}
            >
              <span className={`text-sm font-bold leading-none ${active ? 'text-bio-gold' : 'text-bio-muted'}`}>
                {s.label}
              </span>
              <span className={`text-[9px] leading-none mt-0.5 ${active ? 'text-bio-gold/70' : 'text-bio-border'}`}>
                {s.sub}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
