import React from 'react';
import type { LightStage } from '../../types';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface ControleTabProps {
  smartMode: boolean;
  offline: boolean;
  lightStage: LightStage;
  setLight: (stage: LightStage) => void;
  pumps: boolean[];
  togglePump: (index: 0 | 1 | 2 | 3) => void;
  hortalica: DadosPlanta;
}

export function ControleTab({
  smartMode,
  offline,
  lightStage,
  setLight,
  pumps,
  togglePump,
  hortalica
}: ControleTabProps) {
  return (
    <div className="space-y-stack-lg animate-fadeIn">


      {smartMode && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3 animate-fadeIn shadow-sm">
          <span className="material-symbols-outlined text-primary text-xl animate-pulse">lock</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            O <b>BioCore AI</b> assumiu os controles. Desative a IA na aba <b>Cultivo</b> para liberar acesso manual.
          </p>
        </div>
      )}

      {/* Lighting Control Section */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-stack-md inner-bevel">
        <div className="flex items-center justify-between mb-stack-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-xl drop-shadow-md">light_mode</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Iluminação LED</span>
          </div>
          <span className="font-mono-data text-xs text-primary font-semibold">
            {lightStage === 0 ? 'DESLIGADA' : `${[0, 25, 50, 100][lightStage]}% ATIVO`}
          </span>
        </div>

        {/* Selector Track */}
        <div className={`mechanical-track rounded-full p-1 flex justify-between items-center border border-outline-variant relative ${smartMode ? 'opacity-50 pointer-events-none' : ''}`}>
          {([0, 1, 2, 3] as LightStage[]).map((stage) => {
            const labels = ['OFF', '25%', '50%', '100%'];
            const active = lightStage === stage;
            return (
              <button
                key={stage}
                disabled={offline || smartMode}
                onClick={() => {
                  if (lightStage !== stage) {
                    navigator.vibrate?.(45);
                  }
                  setLight(stage);
                }}
                className={`flex-1 py-2 px-1 rounded-full font-label-caps text-[10px] font-bold transition-all text-center
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${active 
                    ? 'bg-primary text-on-primary font-bold glow-primary' 
                    : 'text-outline hover:text-on-surface'
                  }
                `}
              >
                {labels[stage]}
              </button>
            );
          })}
        </div>

        {/* Dynamic Description Box */}
        <div className="mt-stack-md p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5"></div>
          <p className="text-xs text-on-surface-variant relative z-10 italic">
            {smartMode ? `Modo Inteligente Ativo. Iluminação sob fotoperíodo de ${hortalica.fotoperiodo}h para ${hortalica.nome}.` : (
              <>
                {lightStage === 0 && 'Luzes desligadas. Fotossíntese em repouso.'}
                {lightStage === 1 && 'Espectro noturno de baixa intensidade ativo.'}
                {lightStage === 2 && 'Espectro ideal para o crescimento vegetativo.'}
                {lightStage === 3 && 'Espectro de floração plena e sol forte ativado para o Módulo Alfa.'}
              </>
            )}
          </p>
        </div>
      </section>

      {/* Hydraulic Dock Section */}
      <section className="space-y-stack-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-400 text-xl drop-shadow-md">water_drop</span>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Sistema Hidráulico</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Pump Toggle 1: Nutrientes */}
          <div 
            onClick={() => {
              if (!offline && !smartMode) {
                navigator.vibrate?.([10, 30, 10]);
                togglePump(0);
              }
            }}
            className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer select-none
              ${(offline || smartMode) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-95'}
              ${pumps[0] 
                ? 'bg-surface-container border-primary active-toggle' 
                : 'bg-surface-container border-outline-variant'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold">Nitrogênio (N)</div>
              </div>
              {/* Visual toggle switch */}
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                ${pumps[0] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
              `}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                  ${pumps[0] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                `}></div>
              </div>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className={`font-mono-data text-[10px] font-bold ${pumps[0] ? 'text-primary' : 'text-outline'}`}>
                {pumps[0] ? 'ATIVO' : 'STANDBY'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
            </div>
          </div>

          {/* Pump Toggle 2: H2O Pura */}
          <div 
            onClick={() => {
              if (!offline && !smartMode) {
                navigator.vibrate?.([10, 30, 10]);
                togglePump(1);
              }
            }}
            className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer select-none
              ${(offline || smartMode) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-95'}
              ${pumps[1] 
                ? 'bg-surface-container border-primary active-toggle' 
                : 'bg-surface-container border-outline-variant'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold">Fósforo (P)</div>
              </div>
              {/* Visual toggle switch */}
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                ${pumps[1] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
              `}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                  ${pumps[1] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                `}></div>
              </div>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className={`font-mono-data text-[10px] font-bold ${pumps[1] ? 'text-primary' : 'text-outline'}`}>
                {pumps[1] ? 'ATIVO' : 'STANDBY'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
            </div>
          </div>

          {/* Pump Toggle 3: Drenagem */}
          <div 
            onClick={() => {
              if (!offline && !smartMode) {
                navigator.vibrate?.([10, 30, 10]);
                togglePump(2);
              }
            }}
            className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer select-none
              ${(offline || smartMode) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-95'}
              ${pumps[2] 
                ? 'bg-surface-container border-primary active-toggle' 
                : 'bg-surface-container border-outline-variant'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold">Potássio (K)</div>
              </div>
              {/* Visual toggle switch */}
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                ${pumps[2] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
              `}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                  ${pumps[2] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                `}></div>
              </div>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className={`font-mono-data text-[10px] font-bold ${pumps[2] ? 'text-primary' : 'text-outline'}`}>
                {pumps[2] ? 'ATIVO' : 'STANDBY'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
            </div>
          </div>

          {/* Pump Toggle 4: Resfriamento */}
          <div 
            onClick={() => {
              if (!offline && !smartMode) {
                navigator.vibrate?.([10, 30, 10]);
                togglePump(3);
              }
            }}
            className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer select-none
              ${(offline || smartMode) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-95'}
              ${pumps[3] 
                ? 'bg-surface-container border-primary active-toggle' 
                : 'bg-surface-container border-outline-variant'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold">Água</div>
              </div>
              {/* Visual toggle switch */}
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                ${pumps[3] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
              `}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                  ${pumps[3] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                `}></div>
              </div>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className={`font-mono-data text-[10px] font-bold ${pumps[3] ? 'text-primary' : 'text-outline'}`}>
                {pumps[3] ? 'ATIVO' : 'STANDBY'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
