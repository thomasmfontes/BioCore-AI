import { Sun, AlertTriangle, Loader2 } from 'lucide-react'
import type { ConnectionStatus } from '../types'

interface Props {
  status: ConnectionStatus
}

function StatusIcon({ status }: { status: ConnectionStatus }) {
  if (status === 'connected')  return <Sun className="w-4 h-4" />
  if (status === 'connecting') return <Loader2 className="w-4 h-4 animate-spin" />
  return <AlertTriangle className="w-4 h-4" />
}

const LABEL: Record<ConnectionStatus, string> = {
  connected:    'Online',
  connecting:   'Conectando',
  disconnected: 'Desconectado',
  error:        'Erro',
  offline:      'Hardware Offline',
}

const COLOR: Record<ConnectionStatus, string> = {
  connected:    'text-bio-gold',
  connecting:   'text-bio-muted',
  disconnected: 'text-bio-red',
  error:        'text-bio-red',
  offline:      'text-bio-red',
}

export function Header({ status }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-bio-dark border-b border-bio-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-bio-green/10 border border-bio-green/30 flex items-center justify-center shrink-0">
          <span className="text-bio-green text-[11px] font-black tracking-tight">BC</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">BioCore AI</p>
          <p className="text-[9px] text-bio-muted leading-none mt-0.5 tracking-widest uppercase">SmartPot v2</p>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 ${COLOR[status]}`}>
        <StatusIcon status={status} />
        <span className="text-xs font-semibold">{LABEL[status]}</span>
      </div>
    </header>
  )
}
