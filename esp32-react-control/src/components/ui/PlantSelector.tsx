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
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowSelector(false)}
      />
      {/* Sheet */}
      <div className="relative clay-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl border-0 md:border md:border-outline-variant/10 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom)+40px)] -mb-10 md:mb-0 md:pb-6 space-y-4 shadow-2xl z-10 animate-slideUpSpring md:animate-zoomIn">
        {/* Handle */}
        <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-2 md:hidden" />
        <h3 className="text-center font-title-md font-bold tracking-tight text-on-surface">O que você vai cultivar?</h3>
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
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left min-h-[48px] transition-all duration-300 active:scale-[0.98] clay-card-dark border
                  ${selecionado
                    ? 'border-primary/30 shadow-[0_4px_16px_rgba(90,240,157,0.08)]'
                    : 'border-transparent md:hover:opacity-90 text-on-surface'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{planta.emoji}</span>
                  <div>
                    <div className={`text-sm font-bold transition-colors duration-300 ${selecionado ? 'text-primary' : 'text-on-surface'}`}>{planta.nome}</div>
                    <div className={`text-[10px] mt-0.5 transition-colors duration-300 ${selecionado ? 'text-primary/70' : 'text-on-surface-variant'}`}>
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
          className="w-full py-3 clay-card-dark md:hover:bg-surface-container-highest font-bold rounded-2xl text-xs active:scale-[0.98] border border-outline-variant/20"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
