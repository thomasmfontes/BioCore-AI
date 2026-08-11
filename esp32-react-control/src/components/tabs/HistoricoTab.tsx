import React, { useMemo } from 'react';
import type { LogEntry } from '../../types';

interface HistoricoTabProps {
  logs: LogEntry[];
}

interface CategoriaStats {
  label: string;
  count: number;
  color: string;
  bgHex: string;
  icon: string;
}

export function HistoricoTab({ logs }: HistoricoTabProps) {
  // Computa estatísticas por categoria
  const stats = useMemo(() => {
    let agua = 0;
    let luz = 0;
    let npk = 0;
    let ai = 0;
    let rede = 0;

    logs.forEach((log) => {
      const msg = log.message.toLowerCase();
      if (msg.includes('água') || msg.includes('h2o') || msg.includes('rega')) {
        agua++;
      } else if (msg.includes('led') || msg.includes('luz')) {
        luz++;
      } else if (msg.includes('nitrogênio') || msg.includes('fósforo') || msg.includes('potássio') || msg.includes('npk')) {
        npk++;
      } else if (msg.includes('biocore ai') || msg.includes('autônomo')) {
        ai++;
      } else {
        rede++;
      }
    });

    const total = logs.length || 1;

    const categorias: CategoriaStats[] = [
      { label: 'LED PWM', count: luz, color: 'text-[#FF00FF]', bgHex: '#FF00FF', icon: 'lightbulb' },
      { label: 'Rega H2O', count: agua, color: 'text-blue-400', bgHex: '#60a5fa', icon: 'water_drop' },
      { label: 'Nutrientes NPK', count: npk, color: 'text-emerald-400', bgHex: '#34d399', icon: 'eco' },
      { label: 'BioCore AI', count: ai, color: 'text-primary', bgHex: '#5af09d', icon: 'memory' },
      { label: 'Sistema / Rede', count: rede, color: 'text-amber-400', bgHex: '#fbbf24', icon: 'hub' },
    ].filter(c => c.count > 0);

    return { total: logs.length, categorias };
  }, [logs]);

  // Distribuição de eventos por faixas de horário (24h em 6 blocos)
  const timelineData = useMemo(() => {
    const buckets = [
      { label: '00h - 04h', count: 0 },
      { label: '04h - 08h', count: 0 },
      { label: '08h - 12h', count: 0 },
      { label: '12h - 16h', count: 0 },
      { label: '16h - 20h', count: 0 },
      { label: '20h - 24h', count: 0 },
    ];

    logs.forEach((log) => {
      if (log.time) {
        const parts = log.time.split(':');
        const hour = parseInt(parts[0], 10);
        if (!isNaN(hour)) {
          const idx = Math.min(5, Math.floor(hour / 4));
          buckets[idx].count++;
        }
      }
    });

    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    return { buckets, maxCount };
  }, [logs]);

  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Seção 1: Últimos Eventos (Intacta) */}
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

      {/* Seção 2: Gráficos de Eventos */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Distribuição de Atuações */}
          <section className="clay-card-dark rounded-3xl p-4 flex flex-col justify-between">
            <div>
              <header className="flex justify-between items-center pb-2 border-b border-outline-variant mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Distribuição de Eventos</span>
                </div>
                <span className="text-[10px] font-mono text-outline">{stats.total} total</span>
              </header>

              {/* Legend & Percent Bar */}
              <div className="space-y-2.5 my-2">
                {stats.categorias.map((cat) => {
                  const pct = Math.round((cat.count / stats.total) * 100);
                  return (
                    <div key={cat.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-on-surface text-[11px]">
                          <span className={`material-symbols-outlined text-sm ${cat.color}`}>{cat.icon}</span>
                          {cat.label}
                        </span>
                        <span className={`font-bold ${cat.color}`}>{cat.count} <span className="text-[10px] text-outline font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-surface-container-highest/60 h-2 rounded-full overflow-hidden border border-outline-variant/20">
                        <div 
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: cat.bgHex, boxShadow: `0 0 8px ${cat.bgHex}80` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Card 2: Frequência de Atuações por Horário */}
          <section className="clay-card-dark rounded-3xl p-4 flex flex-col justify-between">
            <div>
              <header className="flex justify-between items-center pb-2 border-b border-outline-variant mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Atividade por Período</span>
                </div>
                <span className="text-[10px] font-mono text-outline">Hoje</span>
              </header>

              {/* Bar Chart Visualizer */}
              <div className="h-36 flex items-end justify-between gap-2 pt-4 pb-2 px-1">
                {timelineData.buckets.map((b) => {
                  const heightPct = b.count > 0 ? Math.max(15, Math.round((b.count / timelineData.maxCount) * 100)) : 6;
                  return (
                    <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono text-primary font-bold opacity-80 group-hover:opacity-100">
                        {b.count > 0 ? b.count : ''}
                      </span>
                      <div className="w-full bg-surface-container-highest/60 rounded-t-lg h-full flex items-end p-0.5 overflow-hidden">
                        <div 
                          className={`w-full rounded-t transition-all duration-500 ${
                            b.count > 0 
                              ? 'bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_10px_rgba(90,240,157,0.3)]' 
                              : 'bg-outline/10'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-outline shrink-0">{b.label.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
