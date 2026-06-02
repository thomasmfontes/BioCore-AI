import React from 'react';
import type { ChavePlanta, DadosPlanta } from '../../hooks/useMqtt';

interface PlantSelectorProps {
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  hortalica: DadosPlanta;
  alterarHortalica: (chave: ChavePlanta) => void;
  bancoHortalicas: Record<string, DadosPlanta>;
}

export function PlantSelector({
  showSelector,
  setShowSelector,
  hortalica,
  alterarHortalica,
  bancoHortalicas
}: PlantSelectorProps) {
  if (!showSelector) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowSelector(false)}
      />
      {/* Sheet */}
      <div className="relative bg-surface-container border-t border-outline-variant w-full max-w-md rounded-t-2xl p-6 space-y-4 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] z-10 animate-slideUp">
        {/* Handle */}
        <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-2" />
        <h3 className="text-center font-title-md font-bold tracking-tight">O que você vai cultivar?</h3>
        <div className="space-y-2.5">
          {(Object.keys(bancoHortalicas) as ChavePlanta[]).map((chave) => {
            const planta = bancoHortalicas[chave];
            const selecionado = hortalica.chave === chave;
            return (
              <button
                key={chave}
                onClick={() => {
                  alterarHortalica(chave);
                  setShowSelector(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left min-h-[48px] transition-all active:scale-[0.98]
                  ${selecionado
                    ? 'bg-primary/10 border-primary text-primary font-bold'
                    : 'bg-surface-container-high border-outline-variant hover:bg-surface-container-highest text-on-surface'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{planta.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold">{planta.nome}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">
                      Solo: {planta.u_solo}% • Luz: {planta.fotoperiodo}h
                    </div>
                  </div>
                </div>
                {selecionado && (
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowSelector(false)}
          className="w-full py-3 bg-surface-container-highest border border-outline-variant text-on-surface font-semibold rounded-xl text-xs active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
