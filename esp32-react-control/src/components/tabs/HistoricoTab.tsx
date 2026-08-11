import React, { useState, useMemo } from 'react';
import type { LogEntry } from '../../types';

interface HistoricoTabProps {
  logs: LogEntry[];
}

type CategoriaFiltro = 'todos' | 'rega' | 'luz' | 'npk' | 'ai';

export function HistoricoTab({ logs }: HistoricoTabProps) {
  const [filtro, setFiltro] = useState<CategoriaFiltro>('todos');
  const [barHoveredIndex, setBarHoveredIndex] = useState<number | null>(null);

  // Categorização de eventos
  const logsProcessados = useMemo(() => {
    return logs.map((log) => {
      const msgLower = log.message.toLowerCase();
      let categoria: CategoriaFiltro = 'todos';
      let icon = 'info';
      let colorClass = 'text-on-surface-variant';
      let bgBadgeClass = 'bg-surface-variant/40 text-outline border-outline/20';

      if (msgLower.includes('bomba') || msgLower.includes('rega') || msgLower.includes('h2o') || msgLower.includes('água')) {
        categoria = 'rega';
        icon = 'water_drop';
        colorClass = 'text-blue-400';
        bgBadgeClass = 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      } else if (msgLower.includes('led') || msgLower.includes('luz')) {
        categoria = 'luz';
        icon = 'light_mode';
        colorClass = 'text-[#FF00FF]';
        bgBadgeClass = 'bg-[#FF00FF]/10 text-[#FF00FF] border-[#FF00FF]/20';
      } else if (msgLower.includes('nitrogênio') || msgLower.includes('fósforo') || msgLower.includes('potássio') || msgLower.includes('npk')) {
        categoria = 'npk';
        icon = 'eco';
        colorClass = 'text-emerald-400';
        bgBadgeClass = 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      } else if (msgLower.includes('biocore') || msgLower.includes('autônomo') || msgLower.includes('hardware') || msgLower.includes('ia')) {
        categoria = 'ai';
        icon = 'memory';
        colorClass = 'text-purple-400';
        bgBadgeClass = 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      }

      return {
        ...log,
        categoria,
        icon,
        colorClass,
        bgBadgeClass
      };
    });
  }, [logs]);

  // Contadores para KPIs e Gráficos
  const stats = useMemo(() => {
    const total = logsProcessados.length;
    const regas = logsProcessados.filter(l => l.categoria === 'rega').length;
    const luz = logsProcessados.filter(l => l.categoria === 'luz').length;
    const npk = logsProcessados.filter(l => l.categoria === 'npk').length;
    const ai = logsProcessados.filter(l => l.categoria === 'ai').length;

    return { total, regas, luz, npk, ai };
  }, [logsProcessados]);

  // Filtragem ativa de lista
  const logsFiltrados = useMemo(() => {
    if (filtro === 'todos') return logsProcessados;
    return logsProcessados.filter(l => l.categoria === filtro);
  }, [logsProcessados, filtro]);

  // Distribuição por horários das 24h (6 blocos de 4 horas: 00-04, 04-08, 08-12, 12-16, 16-20, 20-24)
  const distribuicaoHoraria = useMemo(() => {
    const blocos = [
      { label: '00h-04h', rega: 0, luz: 0, ai: 0, total: 0 },
      { label: '04h-08h', rega: 0, luz: 0, ai: 0, total: 0 },
      { label: '08h-12h', rega: 0, luz: 0, ai: 0, total: 0 },
      { label: '12h-16h', rega: 0, luz: 0, ai: 0, total: 0 },
      { label: '16h-20h', rega: 0, luz: 0, ai: 0, total: 0 },
      { label: '20h-24h', rega: 0, luz: 0, ai: 0, total: 0 },
    ];

    logsProcessados.forEach(log => {
      if (!log.time) return;
      const hora = parseInt(log.time.split(':')[0], 10);
      if (isNaN(hora)) return;

      const idx = Math.min(5, Math.floor(hora / 4));
      blocos[idx].total += 1;
      if (log.categoria === 'rega') blocos[idx].rega += 1;
      else if (log.categoria === 'luz') blocos[idx].luz += 1;
      else if (log.categoria === 'ai') blocos[idx].ai += 1;
    });

    const maxVal = Math.max(1, ...blocos.map(b => b.total));
    return { blocos, maxVal };
  }, [logsProcessados]);

  return (
    <div className="space-y-stack-lg animate-fadeIn pb-6">
      
      {/* 1. KPIs Rápidos de Desempenho */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="clay-card-dark p-3 rounded-2xl flex items-center justify-between border border-outline-variant/30">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase text-outline block tracking-wider mb-0.5">Total Eventos</span>
            <span className="text-base font-bold font-mono text-on-surface">{stats.total}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-lg">view_list</span>
          </div>
        </div>

        <div className="clay-card-dark p-3 rounded-2xl flex items-center justify-between border border-blue-400/20 bg-blue-400/5">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase text-blue-300 block tracking-wider mb-0.5">Regas Solo</span>
            <span className="text-base font-bold font-mono text-blue-400">{stats.regas}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-lg">water_drop</span>
          </div>
        </div>

        <div className="clay-card-dark p-3 rounded-2xl flex items-center justify-between border border-[#FF00FF]/20 bg-[#FF00FF]/5">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase text-pink-300 block tracking-wider mb-0.5">Ajustes LED</span>
            <span className="text-base font-bold font-mono text-[#FF00FF]">{stats.luz}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#FF00FF]/10 flex items-center justify-center text-[#FF00FF]">
            <span className="material-symbols-outlined text-lg">light_mode</span>
          </div>
        </div>

        <div className="clay-card-dark p-3 rounded-2xl flex items-center justify-between border border-purple-400/20 bg-purple-400/5">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase text-purple-300 block tracking-wider mb-0.5">Ações BioCore AI</span>
            <span className="text-base font-bold font-mono text-purple-400">{stats.ai}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-lg">memory</span>
          </div>
        </div>
      </section>

      {/* 2. Stream de Logs com Filtros */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Últimos Eventos</span>
          </div>

          {/* Filtros em Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-hide pb-0.5">
            <button
              onClick={() => setFiltro('todos')}
              className={`text-[9px] px-2.5 py-1 rounded-full border font-mono font-bold transition-all whitespace-nowrap active:scale-95 ${
                filtro === 'todos' ? 'bg-primary text-[#00210f] border-primary shadow-[0_0_10px_rgba(90,240,157,0.3)]' : 'bg-surface-variant/40 text-outline border-outline/30 hover:text-on-surface'
              }`}
            >
              TODOS ({stats.total})
            </button>
            <button
              onClick={() => setFiltro('rega')}
              className={`text-[9px] px-2.5 py-1 rounded-full border font-mono font-bold transition-all whitespace-nowrap active:scale-95 ${
                filtro === 'rega' ? 'bg-blue-400 text-slate-950 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'
              }`}
            >
              💧 REGAS ({stats.regas})
            </button>
            <button
              onClick={() => setFiltro('luz')}
              className={`text-[9px] px-2.5 py-1 rounded-full border font-mono font-bold transition-all whitespace-nowrap active:scale-95 ${
                filtro === 'luz' ? 'bg-[#FF00FF] text-white border-[#FF00FF] shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'bg-[#FF00FF]/10 text-[#FF00FF] border-[#FF00FF]/20'
              }`}
            >
              💡 LUZ ({stats.luz})
            </button>
            <button
              onClick={() => setFiltro('ai')}
              className={`text-[9px] px-2.5 py-1 rounded-full border font-mono font-bold transition-all whitespace-nowrap active:scale-95 ${
                filtro === 'ai' ? 'bg-purple-400 text-slate-950 border-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.3)]' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
              }`}
            >
              🔲 IA ({stats.ai})
            </button>
          </div>
        </header>

        {/* Lista de Registros */}
        <div className="space-y-2 font-mono-data text-xs max-h-[300px] overflow-y-auto scroll-hide pr-1">
          {logsFiltrados.length === 0 ? (
            <div className="py-8 text-center text-outline text-xs flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-2xl opacity-40">event_busy</span>
              <span>Nenhum evento encontrado para este filtro.</span>
            </div>
          ) : (
            logsFiltrados.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center gap-2.5 hover:bg-surface-container-highest/40 p-2 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all"
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${log.bgBadgeClass}`}>
                  <span className={`material-symbols-outlined text-sm ${log.colorClass}`}>{log.icon}</span>
                </div>
                <span className="text-secondary shrink-0 font-bold text-[11px]">[{log.time}]</span>
                <span className="text-on-surface-variant text-[11px] leading-snug flex-1 truncate">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. Gráfico 1: Linha do Tempo de Atividades por Período (SVG Bar Chart) */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">bar_chart</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Volume de Atividade por Período</span>
          </div>
          <span className="text-[9px] text-outline font-mono">Últimas 24h</span>
        </header>

        {/* Container do Gráfico SVG */}
        <div className="w-full bg-surface-container-highest/30 rounded-2xl p-4 border border-outline-variant/30 relative">
          <div className="h-36 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-outline-variant/40">
            {distribuicaoHoraria.blocos.map((bloco, idx) => {
              const heightPct = distribuicaoHoraria.maxVal > 0 ? Math.max(8, Math.round((bloco.total / distribuicaoHoraria.maxVal) * 100)) : 8;
              const isHovered = barHoveredIndex === idx;

              return (
                <div 
                  key={bloco.label} 
                  className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                  onMouseEnter={() => setBarHoveredIndex(idx)}
                  onMouseLeave={() => setBarHoveredIndex(null)}
                >
                  {/* Tooltip ao passar o mouse ou tocar */}
                  {(isHovered || bloco.total > 0) && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${
                      isHovered ? 'bg-primary text-[#00210f] scale-110 z-20' : 'text-outline'
                    }`}>
                      {bloco.total}
                    </span>
                  )}

                  {/* Barra Principal de Altura Dinâmica */}
                  <div className="w-full max-w-[28px] bg-surface-container-highest/80 rounded-t-lg overflow-hidden h-full flex items-end p-0.5 shadow-inner">
                    <div 
                      className={`w-full rounded-t transition-all duration-500 relative ${
                        bloco.total === 0 
                          ? 'bg-outline/20' 
                          : isHovered 
                            ? 'bg-gradient-to-t from-primary/80 to-emerald-300 shadow-[0_0_12px_rgba(90,240,157,0.5)]' 
                            : 'bg-gradient-to-t from-blue-500/80 via-purple-500/80 to-primary/80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Legenda do Horário */}
                  <span className="text-[8px] font-mono text-outline block mt-1 tracking-tighter">{bloco.label}</span>
                </div>
              );
            })}
          </div>

          {/* Legendas de Cores dos Atuadores */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-outline">Regas H2O</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF00FF]"></span>
              <span className="text-outline">Suplementação LED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-outline">BioCore AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Gráfico 2: Proporção de Atuações por Categoria */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-3 border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Proporção de Atuações da IA</span>
          </div>
        </header>

        <div className="space-y-3">
          {/* Barra Proporcional Segmentada Multi-Cor */}
          <div className="w-full bg-surface-container-highest/80 h-3 rounded-full overflow-hidden flex shadow-inner border border-outline-variant/30">
            {stats.total > 0 ? (
              <>
                <div 
                  className="bg-blue-400 h-full transition-all duration-500" 
                  style={{ width: `${(stats.regas / stats.total) * 100}%` }}
                  title={`Regas: ${stats.regas}`}
                />
                <div 
                  className="bg-[#FF00FF] h-full transition-all duration-500" 
                  style={{ width: `${(stats.luz / stats.total) * 100}%` }}
                  title={`Luz LED: ${stats.luz}`}
                />
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ width: `${(stats.npk / stats.total) * 100}%` }}
                  title={`NPK: ${stats.npk}`}
                />
                <div 
                  className="bg-purple-400 h-full transition-all duration-500" 
                  style={{ width: `${(stats.ai / stats.total) * 100}%` }}
                  title={`IA: ${stats.ai}`}
                />
              </>
            ) : (
              <div className="w-full h-full bg-outline/20" />
            )}
          </div>

          {/* Cards Proporcionais com Porcentagem */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="bg-blue-400/10 p-2 rounded-xl border border-blue-400/20">
              <span className="text-[8px] text-blue-300 uppercase block font-sans font-bold">Regas Solo</span>
              <span className="text-xs font-bold text-blue-400">
                {stats.total > 0 ? `${Math.round((stats.regas / stats.total) * 100)}%` : '0%'}
              </span>
            </div>

            <div className="bg-[#FF00FF]/10 p-2 rounded-xl border border-[#FF00FF]/20">
              <span className="text-[8px] text-pink-300 uppercase block font-sans font-bold">Luz LED</span>
              <span className="text-xs font-bold text-[#FF00FF]">
                {stats.total > 0 ? `${Math.round((stats.luz / stats.total) * 100)}%` : '0%'}
              </span>
            </div>

            <div className="bg-emerald-400/10 p-2 rounded-xl border border-emerald-400/20">
              <span className="text-[8px] text-emerald-300 uppercase block font-sans font-bold">Nutrição NPK</span>
              <span className="text-xs font-bold text-emerald-400">
                {stats.total > 0 ? `${Math.round((stats.npk / stats.total) * 100)}%` : '0%'}
              </span>
            </div>

            <div className="bg-purple-400/10 p-2 rounded-xl border border-purple-400/20">
              <span className="text-[8px] text-purple-300 uppercase block font-sans font-bold">Sistema AI</span>
              <span className="text-xs font-bold text-purple-400">
                {stats.total > 0 ? `${Math.round((stats.ai / stats.total) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

