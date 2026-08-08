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

function formatarTempoMs(ms: number): string {
  if (!ms || ms <= 0) return '0 min';
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
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
  
  const solMs = sensors?.sol_ms ?? 0;
  const ledMs = sensors?.led_ms ?? 0;
  const luzTotalMs = solMs + ledMs;
  const metaLuzMs = hortalica.fotoperiodo * 3600000;
  
  const progressoTotal = Math.min(100, Math.round((luzTotalMs / metaLuzMs) * 100));
  const solFormatado = formatarTempoMs(solMs);
  const ledFormatado = formatarTempoMs(ledMs);
  const totalLuzFormatado = formatarTempoMs(luzTotalMs);
  const metaLuzFormatada = `${hortalica.fotoperiodo} horas`;

  const nAtual = sensors?.N ?? 0;
  const pAtual = sensors?.P ?? 0;
  const kAtual = sensors?.K ?? 0;
  const ehNoite = sensors?.ldr === 1;
  const ledLigado = (sensors?.luz ?? 0) > 0;

  // Trava Radicular NPK (solo >= 45%)
  const protecaoNPKAtiva = uSoloAtual < 45;

  // Diagnóstico em Tempo Real da Ação da IA
  let statusIaTitulo = 'SISTEMA EM REPOUSO SAUDÁVEL';
  let statusIaDescricao = `A IA analisa os sensores a cada 10 segundos. A umidade do solo e a iluminação estão dentro do ideal para o ${hortalica.nome}.`;
  let statusIaCor = 'bg-primary/15 text-primary border-primary/30';
  let statusIaIcone = 'check_circle';

  if (!smartMode) {
    statusIaTitulo = 'MODO AUTÔNOMO DESATIVADO';
    statusIaDescricao = 'A inteligência BioCore AI está em pausa. O vaso depende dos seus acionamentos manuais.';
    statusIaCor = 'bg-surface-variant/50 text-outline border-outline/30';
    statusIaIcone = 'pause_circle';
  } else if (ledLigado) {
    statusIaTitulo = 'SUPLEMENTANDO LUZ COM LED';
    statusIaDescricao = `Anoiteceu e o ${hortalica.nome} ainda não atingiu a meta de ${hortalica.fotoperiodo}h de luz. O LED está aceso para completar a iluminação.`;
    statusIaCor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    statusIaIcone = 'light_mode';
  } else if (uSoloAtual < uSoloAlvo - 5) {
    statusIaTitulo = 'SOLO SECO — REGA PROGRAMADA';
    statusIaDescricao = `Umidade do solo (${uSoloAtual}%) está abaixo da meta (${uSoloAlvo}%). A rega autônoma de 15s será executada respeitando o tempo de absorção do solo.`;
    statusIaCor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    statusIaIcone = 'water_drop';
  }

  // Filtrar logs de atuações autônomas da BioCore AI
  const logsIA = logs.filter(l => 
    l.message.includes('BioCore AI') || 
    l.message.includes('Bomba') || 
    l.message.includes('LED') || 
    l.message.includes('Autônomo')
  ).slice(0, 4);

  return (
    <div className="space-y-stack-lg animate-fadeIn pb-8">
      
      {/* 1. HERO BANNER DA IA - "O QUE A IA ESTÁ FAZENDO AGORA?" */}
      <section className="clay-card-dark p-5 rounded-3xl border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl animate-pulse">psychology</span>
            </div>
            <div>
              <h2 className="font-title-md text-base font-bold text-on-surface">Central BioCore AI</h2>
              <p className="text-xs text-on-surface-variant font-body">Decisões e Diagnóstico em Tempo Real</p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            onClick={() => {
              navigator.vibrate?.([10, 30, 10]);
              setSmartMode(!smartMode);
            }}
            className="flex items-center gap-2 cursor-pointer touch-target-min"
          >
            <span className={`text-[11px] font-mono font-bold ${smartMode ? 'text-primary' : 'text-outline'}`}>
              {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
            </span>
            <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
              smartMode ? 'bg-primary/20 border-primary/40' : 'bg-surface-container-highest border-outline'
            }`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                smartMode ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Card de Diagnóstico Atual em Tempo Real */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${statusIaCor}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">{statusIaIcone}</span>
            <h3 className="font-title-sm text-sm font-bold tracking-wide font-headline">{statusIaTitulo}</h3>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{statusIaDescricao}</p>
        </div>
      </section>

      {/* 2. GRID DE AGENTES (HUMANIZADO E COM TEMPOS FORMATADOS EM MINUTOS/HORAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

        {/* Agente 1: Iluminação & Sol (DLI) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-lg">light_mode</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Luz Diária</h3>
            </div>
            <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {totalLuzFormatado} / {metaLuzFormatada}
            </span>
          </div>

          <div className="my-auto py-1 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono text-on-surface-variant">
              <span>Progresso no Dia</span>
              <span className="font-bold text-amber-400">{progressoTotal}%</span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline/10">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${progressoTotal}%` }}
              />
            </div>

            {/* Detalhamento Humano Sol vs LED */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="bg-surface/40 p-2 rounded-xl border border-outline/10 text-center">
                <span className="text-[10px] text-outline block">☀️ Sol Natural</span>
                <span className="font-bold text-amber-300">{solFormatado}</span>
              </div>
              <div className="bg-surface/40 p-2 rounded-xl border border-outline/10 text-center">
                <span className="text-[10px] text-outline block">💡 LED Acendido</span>
                <span className="font-bold text-primary">{ledFormatado}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-2xl border border-outline/10 text-[11px] text-on-surface-variant min-h-[58px] flex items-center">
            <p className="leading-relaxed">
              {progressoTotal >= 100 
                ? `Meta de ${metaLuzFormatada} atingida! O LED ficará em descanso.` 
                : ehNoite 
                  ? 'Anoiteceu. A IA está usando o LED para suprir as horas de luz restantes.' 
                  : 'Sensor LDR lendo o sol. Ao anoitecer, se faltar luz, o LED ligará automaticamente.'}
            </p>
          </div>
        </div>

        {/* Agente 2: Irrigação (Água) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <span className="material-symbols-outlined text-lg">water_drop</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Umidade do Solo</h3>
            </div>
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              uSoloAtual >= uSoloAlvo 
                ? 'bg-primary/15 text-primary border-primary/30' 
                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            }`}>
              {uSoloAtual >= uSoloAlvo ? 'SOLO HUMIDO' : 'SOLO SECO'}
            </span>
          </div>

          <div className="my-auto py-1 space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <span className="text-on-surface-variant text-[11px]">Leitura Atual</span>
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
                ? `Umidade ideal para o ${hortalica.nome}. Bomba de água em repouso.` 
                : 'Solo abaixo da meta. A IA acionará a bomba de água por 15s respeitando a absorção.'}
            </p>
          </div>
        </div>

        {/* Agente 3: Proteção NPK (Nutrição) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </div>
              <h3 className="font-title-sm text-sm font-bold text-on-surface">Nutrição NPK</h3>
            </div>
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              protecaoNPKAtiva 
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {protecaoNPKAtiva ? 'PAUSA DE SEGURANÇA' : 'NUTRIÇÃO OK'}
            </span>
          </div>

          {/* Leitura NPK vs Alvo */}
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
                  Solo com umidade &lt; 45%. A IA aguarda a água pura primeiro para proteger as raízes contra sais.
                </span>
              ) : (
                <span>
                  Solo hidratado (&ge; 45%). Micro-dosagens NPK autorizadas a cada 6 horas.
                </span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* 3. FEED DE ATUAÇÕES RECENTES */}
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
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
