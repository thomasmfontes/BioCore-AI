import React from 'react';
import type { SensorData, LogEntry } from '../../types';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface InteligenciaTabProps {
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: SensorData | null;
  hortalica: DadosPlanta;
  status: string;
  logs?: LogEntry[];
}

export function InteligenciaTab({
  smartMode,
  setSmartMode,
  sensors,
  hortalica,
  status,
  logs = []
}: InteligenciaTabProps) {
  const uSoloAtual = sensors?.u_solo ?? 0;
  const uSoloAlvo = hortalica.u_solo;
  
  const solHoras = (sensors?.sol_ms ?? 0) / 3600000;
  const ledHoras = (sensors?.led_ms ?? 0) / 3600000;
  const luzTotalHoras = solHoras + ledHoras;
  const metaLuzHoras = hortalica.fotoperiodo;
  const progressoTotal = Math.min(100, Math.round((luzTotalHoras / metaLuzHoras) * 100));
  const pctSol = Math.min(100, Math.round((solHoras / metaLuzHoras) * 100));
  const pctLed = Math.min(100 - pctSol, Math.round((ledHoras / metaLuzHoras) * 100));

  const nAtual = sensors?.N ?? 0;
  const pAtual = sensors?.P ?? 0;
  const kAtual = sensors?.K ?? 0;

  // Trava Radicular NPK (solo >= 45%)
  const protecaoNPKAtiva = uSoloAtual < 45;

  // Filtrar logs de atuações autônomas da BioCore AI
  const logsIA = logs.filter(l => 
    l.message.includes('BioCore AI') || 
    l.message.includes('Bomba') || 
    l.message.includes('LED') || 
    l.message.includes('Autônomo')
  ).slice(0, 4);

  return (
    <div className="space-y-stack-lg animate-fadeIn pb-8">
      {/* 1. Header Card BioCore AI Refinado */}
      <section 
        onClick={() => {
          navigator.vibrate?.([10, 30, 10]);
          setSmartMode(!smartMode);
        }}
        className={`p-5 relative overflow-hidden select-none transition-all duration-300 active:scale-[0.98] rounded-3xl cursor-pointer clay-card-dark border ${
          smartMode 
            ? 'border-primary/30 shadow-[0_4px_16px_rgba(90,240,157,0.08)]' 
            : 'border-transparent'
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              smartMode ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-outline'
            }`}>
              <span className="material-symbols-outlined text-2xl animate-pulse">psychology</span>
            </div>
            <div>
              <h2 className="font-title-md text-base font-bold text-on-surface">BioCore AI</h2>
              <p className="text-xs text-on-surface-variant font-body">Cérebro Agronômico Autônomo</p>
            </div>
          </div>

          {/* Switch Toggle Padronizado */}
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-mono font-bold ${smartMode ? 'text-primary' : 'text-outline'}`}>
              {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
            </span>
            <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
              smartMode 
                ? 'bg-primary/20 border-primary/40' 
                : 'bg-surface-container-highest border-outline'
            }`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                smartMode 
                  ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' 
                  : 'bg-outline left-0.5'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Resumo Agronômico da Planta em Cultivo */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-3.5 border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{hortalica.emoji}</span>
            <div>
              <span className="text-sm font-bold text-on-surface block">{hortalica.nome}</span>
              <span className="text-[11px] text-on-surface-variant">
                {smartMode ? 'Monitoramento 24/7 ativo' : 'Modo manual ativo (IA em pausa)'}
              </span>
            </div>
          </div>

          {/* Badges de Parâmetros Alvo Agronômicos */}
          <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
            <span className="bg-surface/50 text-on-surface border border-outline/20 px-2 py-1 rounded-xl">
              💧 Solo: <strong className="text-primary">{hortalica.u_solo}%</strong>
            </span>
            <span className="bg-surface/50 text-on-surface border border-outline/20 px-2 py-1 rounded-xl">
              ☀️ Luz: <strong className="text-amber-400">{hortalica.fotoperiodo}h</strong>
            </span>
            <span className="bg-surface/50 text-on-surface border border-outline/20 px-2 py-1 rounded-xl">
              🧪 NPK: <strong className="text-emerald-400">{hortalica.N}-{hortalica.P}-{hortalica.K}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Grid de Agentes com Alturas 100% Alinhadas (Equal Height Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

        {/* Agente 1: Irrigação (Água) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <span className="material-symbols-outlined text-lg">water_drop</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Irrigação</h3>
            </div>
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              uSoloAtual >= uSoloAlvo 
                ? 'bg-primary/15 text-primary border-primary/30' 
                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            }`}>
              {uSoloAtual >= uSoloAlvo ? 'SOLO IDEAL' : 'REGA PENDENTE'}
            </span>
          </div>

          <div className="my-auto py-1">
            <div className="flex justify-between items-end mb-1 text-xs font-mono">
              <span className="text-on-surface-variant text-[11px]">Umidade Atual</span>
              <span className="font-bold text-on-surface">{uSoloAtual}% <span className="text-outline font-normal">/ Meta {uSoloAlvo}%</span></span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline/10">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
              />
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-2xl border border-outline/10 text-[11px] text-on-surface-variant min-h-[58px] flex items-center">
            <p className="leading-relaxed">
              {uSoloAtual >= uSoloAlvo 
                ? 'Umidade ideal para o Manjericão. A IA manterá a bomba de água em descanso.' 
                : 'Solo seco detectado. A IA executará o ciclo de rega respeitando a absorção de 1h.'}
            </p>
          </div>
        </div>

        {/* Agente 2: Proteção Radicular NPK */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Proteção NPK</h3>
            </div>
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              protecaoNPKAtiva 
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {protecaoNPKAtiva ? 'PAUSA RADICULAR' : 'NUTRIÇÃO OK'}
            </span>
          </div>

          {/* Pílulas NPK com Valor Lido / Alvo Explicito */}
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono my-auto py-1">
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">N (Nitrogênio)</span>
              <span className="text-xs font-bold text-emerald-400">{nAtual} <span className="text-[9px] text-outline font-normal">/ {hortalica.N}</span></span>
            </div>
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">P (Fósforo)</span>
              <span className="text-xs font-bold text-blue-400">{pAtual} <span className="text-[9px] text-outline font-normal">/ {hortalica.P}</span></span>
            </div>
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">K (Potássio)</span>
              <span className="text-xs font-bold text-amber-400">{kAtual} <span className="text-[9px] text-outline font-normal">/ {hortalica.K}</span></span>
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-2xl border border-outline/10 text-[11px] text-on-surface-variant min-h-[58px] flex items-center">
            <p className="leading-relaxed">
              {protecaoNPKAtiva ? (
                <span className="text-amber-300 font-medium">
                  Fertirrigação pausada (solo &lt; 45%). A IA aplica água limpa primeiro para proteger as raízes contra queimaduras.
                </span>
              ) : (
                <span>
                  Solo hidratado (&ge; 45%). Dosagens micro-fracionadas de N, P e K autorizadas com segurança.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Agente 3: Iluminação DLI (Sol vs LED Dual Color) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-lg">light_mode</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Luz Diária (DLI)</h3>
            </div>
            <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {luzTotalHoras.toFixed(1)}h / {metaLuzHoras}h
            </span>
          </div>

          <div className="my-auto py-1">
            <div className="flex justify-between items-end mb-1 text-[11px] font-mono text-on-surface-variant">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span> Sol: {solHoras.toFixed(1)}h
                <span className="inline-block w-2 h-2 rounded-full bg-primary ml-1"></span> LED: {ledHoras.toFixed(1)}h
              </span>
              <span className="font-bold text-amber-400">{progressoTotal}%</span>
            </div>

            {/* Barra Dual Segmentada Sol + LED */}
            <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline/10 flex gap-0.5">
              <div 
                className="h-full bg-amber-400 rounded-l-full transition-all duration-500" 
                style={{ width: `${pctSol}%` }}
              />
              <div 
                className="h-full bg-primary rounded-r-full transition-all duration-500" 
                style={{ width: `${pctLed}%` }}
              />
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-2xl border border-outline/10 text-[11px] text-on-surface-variant min-h-[58px] flex items-center">
            <p className="leading-relaxed">
              {progressoTotal >= 100 
                ? 'Meta de luz atingida! Iluminação LED em descanso.' 
                : 'Monitorando sol via LDR. Ao anoitecer, se a cota não for batida, o LED ligará automaticamente.'}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Feed de Atuações Recentes da IA (Timeline de Decisões) */}
      <section className="clay-card-dark p-5 rounded-3xl border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">history</span>
            <h3 className="font-title-sm text-sm font-bold text-on-surface">Feed de Decisões Recentes da IA</h3>
          </div>
          <span className="text-[10px] font-mono text-outline">Últimos Eventos</span>
        </div>

        {logsIA.length === 0 ? (
          <p className="text-xs text-outline italic text-center py-2">Nenhuma atuação autônoma registrada recentemente.</p>
        ) : (
          <div className="space-y-2">
            {logsIA.map((log) => (
              <div key={log.id} className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-on-surface">{log.message}</span>
                </div>
                <span className="text-[10px] text-outline">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
