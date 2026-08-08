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

  // Estado do Diagnóstico do Usuário
  let statusHero = {
    titulo: 'Sua planta está ótima!',
    subtitulo: `A IA cuidando da umidade e luz ideal para o ${hortalica.nome}.`,
    icone: 'sparkles',
    corIcone: 'text-primary',
    badge: 'Saudável',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  };

  if (!smartMode) {
    statusHero = {
      titulo: 'Modo Inteligente em Pausa',
      subtitulo: 'Ative o modo automático para a IA cuidar da planta por você.',
      icone: 'pause_circle',
      corIcone: 'text-outline',
      badge: 'Manual',
      badgeClass: 'bg-surface-variant/50 text-outline border-outline/30',
    };
  } else if (ledLigado) {
    statusHero = {
      titulo: 'Completando Luz com LED',
      subtitulo: `Anoiteceu! O LED acendeu para atingir as ${hortalica.fotoperiodo}h de luz diária.`,
      icone: 'light_mode',
      corIcone: 'text-amber-400',
      badge: 'LED Aceso',
      badgeClass: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    };
  } else if (uSoloAtual < uSoloAlvo - 5) {
    if (emCooldownRega) {
      statusHero = {
        titulo: 'Solo em Absorção',
        subtitulo: `A água foi aplicada recentemente. Próxima rega liberada em ~${minRestantesRega} min.`,
        icone: 'hourglass_top',
        corIcone: 'text-amber-400',
        badge: `Absorvendo (~${minRestantesRega}m)`,
        badgeClass: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      };
    } else {
      statusHero = {
        titulo: 'Solo Seco — Regando em breve',
        subtitulo: `Umidade (${uSoloAtual}%) abaixo do ideal (${uSoloAlvo}%). A IA iniciará a rega.`,
        icone: 'water_drop',
        corIcone: 'text-blue-400',
        badge: 'Rega Pendente',
        badgeClass: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      };
    }
  }

  return (
    <div className="space-y- stack-lg animate-fadeIn pb-6">
      {/* Hero Status Card — Limpo, Elegante e Humanizado */}
      <section className="clay-card-dark rounded-3xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{hortalica.emoji}</span>
            <h2 className="font-bold text-sm text-on-surface tracking-wide">{hortalica.nome}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${statusHero.badgeClass}`}>
              {statusHero.badge}
            </span>

            {/* Toggle Inteligente */}
            <div 
              onClick={() => {
                navigator.vibrate?.([10, 30, 10]);
                setSmartMode(!smartMode);
              }}
              className="relative inline-flex items-center cursor-pointer touch-target-min"
              title="Ativar/Desativar modo automático"
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
        </div>

        <div className="flex items-center gap-4 py-1">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/60 flex items-center justify-center border border-outline-variant/30 shrink-0">
            <span className={`material-symbols-outlined text-2xl ${statusHero.corIcone}`}>
              {statusHero.icone}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">{statusHero.titulo}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{statusHero.subtitulo}</p>
          </div>
        </div>
      </section>

      {/* Cards de Resumo Limpos */}
      <div className="space-y-4">
        
        {/* 1. Iluminação (Luz Diária) */}
        <section className="clay-card-dark rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">light_mode</span>
              <h4 className="font-bold text-xs text-on-surface">Luz Diária</h4>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {totalLuzFormatado} <span className="text-outline font-normal">/ {metaLuzFormatada}</span>
            </span>
          </div>

          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-primary h-full transition-all duration-500"
              style={{ width: `${progressoTotal}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10 flex items-center justify-between">
              <span className="text-outline">☀️ Sol Natural</span>
              <span className="font-bold text-amber-400 font-mono">{solFormatado}</span>
            </div>
            <div className="bg-surface/30 p-2.5 rounded-2xl border border-outline/10 flex items-center justify-between">
              <span className="text-outline">💡 LED Acendido</span>
              <span className="font-bold text-primary font-mono">{ledFormatado}</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {progressoTotal >= 100 
              ? `Meta de ${metaLuzFormatada} atingida! A planta já recebeu a luz necessária para hoje.`
              : ehNoite 
                ? 'Anoiteceu. A luz LED acendeu para completar as horas de luz restantes.' 
                : 'Acompanhando o sol natural. Ao anoitecer, o LED ligará se ainda faltar luz.'}
          </p>
        </section>

        {/* 2. Água e Umidade do Solo */}
        <section className="clay-card-dark rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-lg">water_drop</span>
              <h4 className="font-bold text-xs text-on-surface">Água no Solo</h4>
            </div>
            <span className="font-mono text-xs text-blue-400 font-bold">
              {uSoloAtual}% <span className="text-outline font-normal">/ Meta {uSoloAlvo}%</span>
            </span>
          </div>

          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
            />
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {uSoloAtual >= uSoloAlvo 
              ? `O solo está bem hidratado para o ${hortalica.nome}. Não é necessário regar agora.` 
              : (emCooldownRega
                  ? `Solo em absorção. A última rega foi recente; próxima rega liberada em ~${minRestantesRega} min.`
                  : 'Solo abaixo do ideal. A IA vai irrigar a planta no próximo ciclo.')}
          </p>
        </section>

        {/* 3. Nutrientes da Terra (NPK) */}
        <section className="clay-card-dark rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">eco</span>
              <h4 className="font-bold text-xs text-on-surface">Nutrição da Terra</h4>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
              protecaoNPKAtiva ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {protecaoNPKAtiva ? 'Aguardando Água' : 'Nutrição OK'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-surface/30 p-2 rounded-2xl border border-outline/10">
              <span className="text-[10px] text-outline block mb-0.5">Nitrogênio</span>
              <span className="font-bold text-primary">{nAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.N}</span></span>
            </div>
            <div className="bg-surface/30 p-2 rounded-2xl border border-outline/10">
              <span className="text-[10px] text-outline block mb-0.5">Fósforo</span>
              <span className="font-bold text-secondary">{pAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.P}</span></span>
            </div>
            <div className="bg-surface/30 p-2 rounded-2xl border border-outline/10">
              <span className="text-[10px] text-outline block mb-0.5">Potássio</span>
              <span className="font-bold text-tertiary">{kAtual} <span className="text-[9px] text-outline font-normal">/{hortalica.K}</span></span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {protecaoNPKAtiva ? (
              <span className="text-amber-300">
                A fertilização está aguardando a umidade do solo subir para proteger as raízes da planta.
              </span>
            ) : (
              <span>
                Nutrientes equilibrados para o crescimento saudável do {hortalica.nome}.
              </span>
            )}
          </p>
        </section>

      </div>
    </div>
  );
}
