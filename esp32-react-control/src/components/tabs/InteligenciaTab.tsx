import React from 'react';
import type { SensorData } from '../../types';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface InteligenciaTabProps {
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: SensorData | null;
  hortalica: DadosPlanta;
  status: string;
  lastRegaMs?: number | null;
}

function formatarTempoMinutos(totalMin: number): string {
  if (!totalMin || totalMin <= 0) return '0 min';
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
  lastRegaMs = null,
}: InteligenciaTabProps) {
  const uSoloAtual = sensors?.u_solo ?? 0;
  const uSoloAlvo = hortalica.u_solo;
  
  const solMs = sensors?.sol_ms ?? 0;
  const ledMs = sensors?.led_ms ?? 0;

  // Garante igualdade matemática absoluta entre as parcelas e o total exibido
  const minSol = Math.round(solMs / 60000);
  const minLed = Math.round(ledMs / 60000);
  const minTotal = minSol + minLed;

  const metaLuzMin = hortalica.fotoperiodo * 60;
  const progressoTotal = Math.min(100, Math.round((minTotal / metaLuzMin) * 100));

  const solFormatado = formatarTempoMinutos(minSol);
  const ledFormatado = formatarTempoMinutos(minLed);
  const totalLuzFormatado = formatarTempoMinutos(minTotal);
  const metaLuzFormatada = `${hortalica.fotoperiodo}h`;

  const nAtual = sensors?.N ?? 0;
  const pAtual = sensors?.P ?? 0;
  const kAtual = sensors?.K ?? 0;
  const ehNoite = sensors?.ldr === 1;
  const ledLigado = (sensors?.luz ?? 0) > 0;

  const protecaoNPKAtiva = uSoloAtual < 45;

  // Cálculo de Cooldown de Absorção da Rega (1 Hora = 3600000 ms)
  const agora = Date.now();
  const tempoDecorridoRega = lastRegaMs ? (agora - lastRegaMs) : 4000000;
  
  // Se o ESP32 enviar rega_cd na telemetria, usa o tempo exato do hardware:
  const regaCdHardware = typeof sensors?.rega_cd === 'number' ? sensors.rega_cd : 0;
  const emCooldownRega = regaCdHardware > 0 || tempoDecorridoRega < 3600000;
  const minRestantesRega = regaCdHardware > 0 
    ? regaCdHardware 
    : Math.max(1, Math.ceil((3600000 - tempoDecorridoRega) / 60000));

  let statusIaTitulo = 'SISTEMA EM MONITORAMENTO SAUDÁVEL';
  let statusIaDescricao = `A IA analisa os sensores a cada 10s. Umidade do solo e iluminação estão ideais para o ${hortalica.nome}.`;
  let statusIaIcone = 'check_circle';
  let statusIaBadgeClass = 'bg-primary/10 text-primary border-primary/20';

  if (!smartMode) {
    statusIaTitulo = 'MODO AUTÔNOMO DESATIVADO';
    statusIaDescricao = 'A inteligência BioCore AI está em pausa. O vaso depende dos seus acionamentos manuais.';
    statusIaIcone = 'pause_circle';
    statusIaBadgeClass = 'bg-surface-variant/50 text-outline border-outline/30';
  } else if (ledLigado) {
    statusIaTitulo = 'SUPLEMENTANDO LUZ COM LED';
    statusIaDescricao = `Anoiteceu e o ${hortalica.nome} ainda não completou a meta de ${hortalica.fotoperiodo}h. O LED está aceso para suprir a luz solar restante.`;
    statusIaIcone = 'light_mode';
    statusIaBadgeClass = 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  } else if (uSoloAtual < uSoloAlvo - 5) {
    if (emCooldownRega) {
      statusIaTitulo = `SOLO EM ABSORÇÃO (~${minRestantesRega} MIN)`;
      statusIaDescricao = `Solo abaixo da meta (${uSoloAtual}% < ${uSoloAlvo}%). Rega realizada recentemente; a próxima rega autônoma será liberada em ~${minRestantesRega} min para evitar encharcamento.`;
      statusIaIcone = 'hourglass_top';
      statusIaBadgeClass = 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    } else {
      statusIaTitulo = 'SOLO SECO — REGA PROGRAMADA';
      statusIaDescricao = `Umidade do solo (${uSoloAtual}%) abaixo da meta (${uSoloAlvo}%). Rega autônoma de 15s autorizada no próximo ciclo.`;
      statusIaIcone = 'water_drop';
      statusIaBadgeClass = 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    }
  }

  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Hero Section: BioCore AI System Status (Estilo Idêntico ao ControleTab / CultivoTab) */}
      <section className="clay-card-dark rounded-3xl p-stack-md relative overflow-hidden">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl drop-shadow-md">psychology</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">BioCore AI</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold transition-all ${statusIaBadgeClass}`}>
              {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
            </span>

            {/* Switch Toggle Idêntico ao CultivoTab */}
            <div 
              onClick={() => {
                navigator.vibrate?.([10, 30, 10]);
                setSmartMode(!smartMode);
              }}
              className="relative inline-flex items-center cursor-pointer touch-target-min"
            >
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
                smartMode ? 'bg-primary/20 border-primary/40' : 'bg-surface-container-highest border-outline'
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                  smartMode ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'
                }`} />
              </div>
            </div>
          </div>
        </header>

        {/* Diagnóstico em Tempo Real com Estilo Idêntico aos Alertas do ControleTab */}
        <div className="clay-card-dark rounded-2xl p-3 flex items-start gap-3">
          <span className={`material-symbols-outlined text-xl mt-0.5 ${
            smartMode ? (ledLigado ? 'text-amber-400' : 'text-primary') : 'text-outline'
          }`}>
            {statusIaIcone}
          </span>
          <div className="flex-1">
            <h3 className="font-title-sm text-xs font-bold text-on-surface mb-0.5">{statusIaTitulo}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{statusIaDescricao}</p>
          </div>
        </div>
      </section>

      {/* Grid de Métricas da IA (Estilo Idêntico aos Cards do TelemetriaTab) */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Diagnóstico dos Pilares</span>
          <span className="font-mono-data text-xs text-primary font-semibold">{hortalica.emoji} {hortalica.nome}</span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Pilar 1: Iluminação DLI */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[9px] text-outline uppercase font-bold">Luz Diária</span>
              <span className="font-mono-data text-[10px] text-amber-400 font-bold">{totalLuzFormatado} / {metaLuzFormatada}</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden border border-outline-variant/30">
              <div 
                className="bg-amber-400 h-full bio-glow transition-all duration-500"
                style={{ width: `${progressoTotal}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30">
                <span className="text-outline block text-[8px] uppercase">☀️ Sol Natural</span>
                <span className="font-bold text-amber-400">{solFormatado}</span>
              </div>
              <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30">
                <span className="text-outline block text-[8px] uppercase">💡 LED PWM</span>
                <span className="font-bold text-primary">{ledFormatado}</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
              {progressoTotal >= 100 
                ? `Meta de ${metaLuzFormatada} atingida! O LED ficará em descanso.` 
                : ehNoite 
                  ? 'Anoiteceu. O LED está suplementando o sol recebido.' 
                  : 'LDR monitorando sol. Ao anoitecer, o LED ligará se faltar luz.'}
            </p>
          </div>

          {/* Pilar 2: Irrigação de Solo */}
          <div className="flex flex-col space-y-2 md:border-l border-outline-variant md:pl-4">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[9px] text-outline uppercase font-bold">Umidade Solo</span>
              <span className="font-mono-data text-[10px] text-blue-400 font-bold">{uSoloAtual}% / Meta {uSoloAlvo}%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden border border-outline-variant/30">
              <div 
                className="bg-blue-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
              />
            </div>
            <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30 text-[10px] font-mono flex justify-between items-center">
              <span className="text-outline text-[8px] uppercase">Estado do Solo</span>
              <span className={`font-bold ${uSoloAtual >= uSoloAlvo ? 'text-primary' : (emCooldownRega ? 'text-amber-400' : 'text-blue-400')}`}>
                {uSoloAtual >= uSoloAlvo ? 'SOLO ÚMIDO' : (emCooldownRega ? `ABSORVENDO (~${minRestantesRega}m)` : 'SOLO SECO')}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
              {uSoloAtual >= uSoloAlvo 
                ? `Umidade ideal para o ${hortalica.nome}. Bomba em repouso.` 
                : (emCooldownRega
                    ? `Solo em período de absorção. Próxima rega liberada em ~${minRestantesRega} min.`
                    : 'Solo abaixo da meta. Rega de 15s autorizada no próximo ciclo.')}
            </p>
          </div>

          {/* Pilar 3: Nutrição NPK */}
          <div className="flex flex-col space-y-2 md:border-l border-outline-variant md:pl-4">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[9px] text-outline uppercase font-bold">Nutrição NPK</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold ${
                protecaoNPKAtiva ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {protecaoNPKAtiva ? 'PAUSA DE SEGURANÇA' : 'NUTRIÇÃO OK'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono pt-0.5">
              <div className="bg-surface-container-highest/40 p-1.5 rounded-xl border border-outline-variant/30">
                <span className="text-[8px] text-outline block uppercase">N</span>
                <span className="text-xs font-bold text-primary">{nAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.N}</span></span>
              </div>
              <div className="bg-surface-container-highest/40 p-1.5 rounded-xl border border-outline-variant/30">
                <span className="text-[8px] text-outline block uppercase">P</span>
                <span className="text-xs font-bold text-secondary">{pAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.P}</span></span>
              </div>
              <div className="bg-surface-container-highest/40 p-1.5 rounded-xl border border-outline-variant/30">
                <span className="text-[8px] text-outline block uppercase">K</span>
                <span className="text-xs font-bold text-tertiary">{kAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.K}</span></span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
              {protecaoNPKAtiva ? (
                <span className="text-amber-300">
                  Umidade &lt; 45%. A IA aguarda água limpa primeiro para proteger as raízes contra queimaduras.
                </span>
              ) : (
                <span>
                  Solo com boa hidratação (&ge; 45%). Dosagens micro-fracionadas NPK autorizadas.
                </span>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
