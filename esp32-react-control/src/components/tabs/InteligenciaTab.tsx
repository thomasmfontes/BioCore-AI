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

  // Diagnóstico Principal (Sem Redundância)
  let statusHero = {
    titulo: 'Modo Inteligente Ativo',
    subtitulo: `Cuidando automaticamente de luz, irrigação e adubação do ${hortalica.nome}.`,
    badge: 'Autônomo',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  };

  if (!smartMode) {
    statusHero = {
      titulo: 'Modo Manual Ativo',
      subtitulo: 'A IA está em pausa. Os acionamentos dependem dos seus comandos manuais.',
      badge: 'Manual',
      badgeClass: 'bg-surface-variant/50 text-outline border-outline/30',
    };
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Top Header Card — Limpo e Sem Redundâncias */}
      <section className="clay-card-dark rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-xl">
              {hortalica.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-on-surface">{hortalica.nome}</h2>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${statusHero.badgeClass}`}>
                  {statusHero.badge}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{statusHero.subtitulo}</p>
            </div>
          </div>

          {/* Toggle de Ativação IA */}
          <div 
            onClick={() => {
              navigator.vibrate?.([10, 30, 10]);
              setSmartMode(!smartMode);
            }}
            className="relative inline-flex items-center cursor-pointer touch-target-min shrink-0 pl-2"
            title="Ativar/Desativar modo automático"
          >
            <div className={`w-11 h-6 rounded-full relative border transition-colors p-0.5 ${
              smartMode ? 'bg-primary/20 border-primary/40' : 'bg-surface-container-highest border-outline'
            }`}>
              <div className={`w-4 h-4 rounded-full transition-all absolute top-0.5 ${
                smartMode ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'
              }`} />
            </div>
          </div>
        </div>
      </section>

      {/* Seção 1: Iluminação Diária */}
      <section className="clay-card-dark rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">light_mode</span>
            <h3 className="font-bold text-sm text-on-surface">Iluminação Diária</h3>
          </div>
          <span className="font-mono text-xs text-amber-400 font-bold">
            {totalLuzFormatado} <span className="text-outline font-normal">/ {metaLuzFormatada}</span>
          </span>
        </div>

        {/* Barra de Progresso com Gradiente */}
        <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
          <div 
            className="bg-gradient-to-r from-amber-400 to-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressoTotal}%` }}
          />
        </div>

        {/* Breakdown Sol vs LED */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">☀️</span>
              <span className="text-on-surface-variant font-medium">Sol Natural</span>
            </div>
            <span className="font-bold text-amber-400 font-mono">{solFormatado}</span>
          </div>

          <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💡</span>
              <span className="text-on-surface-variant font-medium">LED PWM</span>
            </div>
            <span className="font-bold text-primary font-mono">{ledFormatado}</span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {progressoTotal >= 100 
            ? `Meta de ${metaLuzFormatada} atingida! A planta recebeu toda a luz necessária para hoje.`
            : ehNoite 
              ? `Anoiteceu. O LED acendeu para completar as ${metaLuzFormatada} de luz diária.` 
              : 'Monitorando sol natural. Ao anoitecer, o LED ligará se faltar luz.'}
        </p>
      </section>

      {/* Seção 2: Umidade do Solo */}
      <section className="clay-card-dark rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-xl">water_drop</span>
            <h3 className="font-bold text-sm text-on-surface">Água no Solo</h3>
          </div>
          <span className="font-mono text-xs text-blue-400 font-bold">
            {uSoloAtual}% <span className="text-outline font-normal">/ Meta {uSoloAlvo}%</span>
          </span>
        </div>

        {/* Barra de Umidade */}
        <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
          <div 
            className="bg-blue-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
          />
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {uSoloAtual >= uSoloAlvo 
            ? `O solo está bem hidratado para o ${hortalica.nome}. Bomba de água em repouso.` 
            : (emCooldownRega
                ? `Solo em absorção. A última rega foi recente; próxima rega liberada em ~${minRestantesRega} min.`
                : 'Solo abaixo da meta. A IA executará a rega de 15s no próximo ciclo.')}
        </p>
      </section>

      {/* Seção 3: Nutrientes NPK */}
      <section className="clay-card-dark rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">eco</span>
            <h3 className="font-bold text-sm text-on-surface">Nutrição NPK</h3>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
            protecaoNPKAtiva ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            {protecaoNPKAtiva ? 'Aguardando Água' : 'Nutrição OK'}
          </span>
        </div>

        {/* Métricas NPK sem cores alarmantes/vermelhas se estiverem ok */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10">
            <span className="text-[10px] text-outline block mb-1 font-sans">Nitrogênio (N)</span>
            <span className="font-bold text-primary">{nAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.N}</span></span>
          </div>
          <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10">
            <span className="text-[10px] text-outline block mb-1 font-sans">Fósforo (P)</span>
            <span className="font-bold text-secondary">{pAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.P}</span></span>
          </div>
          <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10">
            <span className="text-[10px] text-outline block mb-1 font-sans">Potássio (K)</span>
            <span className="font-bold text-tertiary">{kAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.K}</span></span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {protecaoNPKAtiva ? (
            <span className="text-amber-300">
              A fertilização aguarda o solo umedecer (&ge; 45%) para proteger as raízes contra sais.
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
