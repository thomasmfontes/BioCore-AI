import React from 'react';
import type { SensorData } from '../../types';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface InteligenciaTabProps {
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: SensorData | null;
  hortalica: DadosPlanta;
  status: string;
}

export function InteligenciaTab({
  smartMode,
  setSmartMode,
  sensors,
  hortalica,
  status
}: InteligenciaTabProps) {
  const uSoloAtual = sensors?.u_solo ?? 0;
  const uSoloAlvo = hortalica.u_solo;
  const solHoras = (sensors?.sol_ms ?? 0) / 3600000;
  const ledHoras = (sensors?.led_ms ?? 0) / 3600000;
  const luzTotalHoras = solHoras + ledHoras;
  const metaLuzHoras = hortalica.fotoperiodo;
  const progressoLuz = Math.min(100, Math.round((luzTotalHoras / metaLuzHoras) * 100));

  const nAtual = sensors?.N ?? 0;
  const pAtual = sensors?.P ?? 0;
  const kAtual = sensors?.K ?? 0;

  // Trava Radicular NPK (solo >= 45%)
  const protecaoNPKAtiva = uSoloAtual < 45;

  return (
    <div className="space-y-stack-lg animate-fadeIn pb-8">
      {/* 1. Header Card BioCore AI - Estilo Padronizado do Sistema */}
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

          {/* Switch Toggle Padronizado do Sistema */}
          <div className="relative inline-flex items-center touch-target-min">
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

        {/* Resumo do Status da IA */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-3.5 border border-outline/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{hortalica.emoji}</span>
            <div>
              <span className="text-xs font-bold text-on-surface block">{hortalica.nome}</span>
              <span className="text-[11px] text-on-surface-variant">
                {smartMode ? 'Decisões automáticas de irrigação, luz e nutrição' : 'Modo manual ativo (IA em pausa)'}
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
            smartMode 
              ? 'bg-primary/15 text-primary border-primary/30' 
              : 'bg-surface/50 text-outline border-outline/30'
          }`}>
            {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
          </span>
        </div>
      </section>

      {/* 2. Grid de Agentes de Decisão da IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Agente 1: Irrigação (Água) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-3">
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

          <div>
            <div className="flex justify-between items-end mb-1 text-xs">
              <span className="text-on-surface-variant font-mono text-[11px]">Umidade Atual</span>
              <span className="font-bold text-on-surface font-mono">{uSoloAtual}% <span className="text-outline font-normal">/ Meta {uSoloAlvo}%</span></span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline/10">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((uSoloAtual / uSoloAlvo) * 100))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed bg-surface/30 p-2.5 rounded-xl border border-outline/10">
            {uSoloAtual >= uSoloAlvo 
              ? 'A umidade está perfeita para a planta. A IA manterá as bombas em descanso.' 
              : 'Solo seco detectado. A IA executará o ciclo de rega respeitando o tempo de absorção de 1h.'}
          </p>
        </div>

        {/* Agente 2: Proteção Radicular NPK */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-3">
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

          {/* Mini Pílulas NPK */}
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">N</span>
              <span className="text-xs font-bold text-emerald-400">{nAtual}</span>
            </div>
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">P</span>
              <span className="text-xs font-bold text-blue-400">{pAtual}</span>
            </div>
            <div className="bg-surface/40 p-1.5 rounded-xl border border-outline/10">
              <span className="text-[9px] text-outline block">K</span>
              <span className="text-xs font-bold text-amber-400">{kAtual}</span>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed bg-surface/30 p-2.5 rounded-xl border border-outline/10">
            {protecaoNPKAtiva ? (
              <span className="text-amber-300 font-medium">
                Pausa de segurança: fertirrigação bloqueada até o solo atingir 45% de umidade para não queimar as raízes.
              </span>
            ) : (
              <span>
                Solo com boa hidratação (&ge; 45%). Dosagens micro-fracionadas de N, P e K autorizadas com segurança.
              </span>
            )}
          </p>
        </div>

        {/* Agente 3: Iluminação (DLI) */}
        <div className="clay-card-dark p-4 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-3">
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

          <div>
            <div className="flex justify-between items-end mb-1 text-[11px] font-mono text-on-surface-variant">
              <span>Progresso</span>
              <span className="font-bold text-amber-400">{progressoLuz}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full transition-all duration-500" 
                style={{ width: `${progressoLuz}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed bg-surface/30 p-2.5 rounded-xl border border-outline/10">
            {progressoLuz >= 100 
              ? 'Meta diária de luz atingida! Iluminação LED em descanso.' 
              : `Sol lido: ${solHoras.toFixed(1)}h | LED: ${ledHoras.toFixed(1)}h. Se faltar luz ao anoitecer, a IA ligará o LED.`}
          </p>
        </div>

      </div>
    </div>
  );
}
