import { History } from 'lucide-react'
import type { LogEntry } from '../types'

interface Props {
  logs: LogEntry[]
}

export function ActivityLog({ logs }: Props) {
  return (
    <section className="rounded-xl border border-bio-border bg-bio-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-bio-muted" />
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Atividade Recente</h2>
        {logs.length > 0 && (
          <span className="ml-auto flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bio-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-bio-green" />
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-[11px] text-bio-muted text-center py-6">Aguardando eventos...</p>
      ) : (
        <ul className="space-y-2.5">
          {logs.map(log => (
            <li
              key={log.id}
              className="flex items-start gap-2.5 text-[11px] border-b border-bio-border/40 pb-2.5 last:border-0 last:pb-0"
            >
              <span className="text-bio-muted tabular-nums shrink-0 font-mono">{log.time}</span>
              <span className="text-bio-text">{log.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
