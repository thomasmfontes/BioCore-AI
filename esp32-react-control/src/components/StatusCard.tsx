import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react'
import type { SensorData } from '../types'

interface Props {
  sensors: SensorData | null
}

interface PlantStatus {
  level: 'ok' | 'warning' | 'critical'
  title: string
  detail: string
}

function getStatus(s: SensorData | null): PlantStatus {
  if (!s)            return { level: 'ok',       title: 'Aguardando telemetria',               detail: 'Nenhum dado recebido do hardware ainda' }
  if (s.u_solo < 30) return { level: 'critical',  title: 'Solo crítico — irrigação imediata',    detail: `Umidade do solo: ${s.u_solo}% (mín. 30%)` }
  if (s.temp > 35)   return { level: 'critical',  title: 'Temperatura crítica',                  detail: `${s.temp}°C acima do limite operacional (35°C)` }
  if (s.u_solo < 45) return { level: 'warning',   title: 'Irrigação recomendada',                detail: `Umidade ${s.u_solo}% — abaixo do ideal (45%)` }
  if (s.N < 20 || s.P < 20 || s.K < 20) return {
    level: 'warning',
    title: 'Nutrição abaixo do ideal',
    detail: `NPK — N: ${s.N}  P: ${s.P}  K: ${s.K} mg/kg`,
  }
  return { level: 'ok', title: 'Todos os parâmetros estáveis', detail: `Solo ${s.u_solo}% · ${s.temp}°C · NPK em nível adequado` }
}

const STYLE = {
  ok:       { border: 'border-bio-green/20', bg: 'bg-bio-green/5', text: 'text-bio-green', Icon: CheckCircle2 },
  warning:  { border: 'border-bio-gold/30',  bg: 'bg-bio-gold/5',  text: 'text-bio-gold',  Icon: AlertTriangle },
  critical: { border: 'border-bio-red/30',   bg: 'bg-bio-red/5',   text: 'text-bio-red',   Icon: AlertOctagon },
}

export function StatusCard({ sensors }: Props) {
  const status = getStatus(sensors)
  const { border, bg, text, Icon } = STYLE[status.level]

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4 flex items-center gap-3`}>
      <Icon className={`w-5 h-5 shrink-0 ${text}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${text} leading-tight`}>{status.title}</p>
        <p className="text-[11px] text-bio-muted mt-0.5">{status.detail}</p>
      </div>
      <span className="text-[9px] text-bio-border font-mono uppercase tracking-wider shrink-0">
        BioCore AI
      </span>
    </div>
  )
}
