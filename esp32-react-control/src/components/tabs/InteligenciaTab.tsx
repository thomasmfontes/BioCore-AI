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

  const agora = Date.now();
  const tempoDecorridoRega = lastRegaMs ? (agora - lastRegaMs) : 4000000;
  
  const regaCdHardware = typeof sensors?.rega_cd === 'number' ? sensors.rega_cd : 0;
  const emCooldownRega = regaCdHardware > 0 || tempoDecorridoRega < 3600000;
  const minRestantesRega = regaCdHardware > 0 
    ? regaCdHardware 
    : Math.max(1, Math.ceil((3600000 - tempoDecorridoRega) / 60000));

  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Top Header Card — Padronizado 100% com BioCore AI e Toggle do CultivoTab */}
      <section className="clay-card-dark rounded-3xl p-stack-md relative overflow-hidden">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl drop-shadow-md">psychology</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">BioCore AI</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold transition-all ${
              smartMode ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' : 'bg-surface-variant/50 text-outline border-outline/30'
            }`}>
              {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
            </span>

            {/* Switch Toggle 100% Idêntico ao CultivoTab */}
            <div 
              onClick={() => {
                navigator.vibrate?.([10, 30, 10]);
                setSmartMode(!smartMode);
              }}
              className="relative inline-flex items-center cursor-pointer touch-target-min"
              title="Ativar ou desativar modo inteligente BioCore AI"
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

        {/* Status / Planta Selecionada */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{hortalica.emoji}</span>
            <div>
              <h3 className="font-title-sm text-xs font-bold text-on-surface">{hortalica.nome}</h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {smartMode 
                  ? `Monitorando e regulando o cultivo do ${hortalica.nome} em tempo real.`
                  : 'Modo manual ativo. Os acionamentos automáticos da IA estão em pausa.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card 1: Iluminação Diária */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">light_mode</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Iluminação Diária</span>
          </div>
          <span className="font-mono-data text-xs text-amber-400 font-bold">
            {totalLuzFormatado} <span className="text-outline font-normal">/ {metaLuzFormatada}</span>
          </span>
        </header>

        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mb-3 border border-outline-variant/30">
          <div 
            className="bg-gradient-to-r from-amber-400 to-primary h-full transition-all duration-500"
            style={{ width: `${progressoTotal}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2.5">
          <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30 flex items-center justify-between">
            <span className="text-outline text-[9px] font-sans">☀️ Sol Natural</span>
            <span className="font-bold text-amber-400">{solFormatado}</span>
          </div>

          <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30 flex items-center justify-between">
            <span className="text-outline text-[9px] font-sans">💡 LED PWM</span>
            <span className="font-bold text-primary">{ledFormatado}</span>
          </div>
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {progressoTotal >= 100 
            ? `Meta de ${metaLuzFormatada} atingida! A iluminação do dia foi completada.`
            : ehNoite 
              ? `Anoiteceu. O LED acendeu para completar as ${metaLuzFormatada} de luz necessárias.` 
              : 'Monitorando sol natural via sensor LDR. Ao anoitecer, o LED acenderá se faltar luz.'}
        </p>
      </section>

      {/* Card 2: Água no Solo */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-xl">water_drop</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Água no Solo</span>
          </div>
          <span className="font-mono-data text-xs text-blue-400 font-bold">
            {uSoloAtual}% <span className="text-outline font-normal">/ Meta {uSoloAlvo}%</span>
          </span>
        </header>

        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mb-3 border border-outline-variant/30">
          <div 
            className="bg-blue-400 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
          />
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {uSoloAtual >= uSoloAlvo 
            ? `O solo está bem hidratado para o ${hortalica.nome}. Bomba de água em repouso.` 
            : (emCooldownRega
                ? `Solo em absorção. A última rega foi recente; próxima rega liberada em ~${minRestantesRega} min.`
                : 'Solo abaixo da meta. A IA executará a rega de 15s no próximo ciclo.')}
        </p>
      </section>

      {/* Card 3: Nutrição NPK */}
      <section className="clay-card-dark rounded-3xl p-stack-md">
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">eco</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Nutrição NPK</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold ${
            protecaoNPKAtiva ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            {protecaoNPKAtiva ? 'AGUARDANDO ÁGUA' : 'NUTRIÇÃO OK'}
          </span>
        </header>

        <div className="grid grid-cols-3 gap-2 text-center font-mono mb-2.5">
          <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30">
            <span className="text-[8px] text-outline block uppercase font-sans mb-0.5">Nitrogênio</span>
            <span className="text-xs font-bold text-primary">{nAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.N}</span></span>
          </div>
          <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30">
            <span className="text-[8px] text-outline block uppercase font-sans mb-0.5">Fósforo</span>
            <span className="text-xs font-bold text-secondary">{pAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.P}</span></span>
          </div>
          <div className="bg-surface-container-highest/40 p-2 rounded-xl border border-outline-variant/30">
            <span className="text-[8px] text-outline block uppercase font-sans mb-0.5">Potássio</span>
            <span className="text-xs font-bold text-tertiary">{kAtual} <span className="text-[8px] text-outline font-normal">/{hortalica.K}</span></span>
          </div>
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {protecaoNPKAtiva ? (
            <span className="text-amber-300">
              A fertilização aguarda a umidade do solo subir para proteger as raízes contra sais.
            </span>
          ) : (
            <span>
              Nutrientes equilibrados para o crescimento saudável do {hortalica.nome}.
            </span>
          )}
        </p>
      </section>

    </div>
  );
}
