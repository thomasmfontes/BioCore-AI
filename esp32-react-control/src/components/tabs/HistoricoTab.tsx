import React from 'react';
import type { LogEntry } from '../../types';

interface HistoricoTabProps {
  logs: LogEntry[];
}

export function HistoricoTab({ logs }: HistoricoTabProps) {
  return (
    <div className="space-y-stack-lg animate-fadeIn">
      <section className="clay-card-dark rounded-3xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
          <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">Últimos Eventos</span>
          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-mono uppercase font-bold animate-pulse">
            Sincronizado
          </span>
        </div>
        
        <div className="space-y-3 font-mono-data text-xs max-h-[400px] overflow-y-auto scroll-hide">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-outline text-xs">
              Nenhum evento registrado ainda.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-3 leading-relaxed hover:bg-background/25 p-1.5 rounded transition-all">
                <span className="text-secondary shrink-0 select-none text-[11px] font-bold">[{log.time}]</span>
                <span className="text-on-surface-variant flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
