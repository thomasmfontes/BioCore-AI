import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface RefillModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onConfirmRefill: () => Promise<void>;
  loading: boolean;
  error: boolean;
}

export function RefillModal({
  showModal,
  setShowModal,
  onConfirmRefill,
  loading,
  error,
}: RefillModalProps) {
  const [render, setRender] = useState(showModal);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (showModal) {
      setRender(true);
      setIsClosing(false);
    } else if (render) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 400); // 400ms para casar com a animação de saída de mola
      return () => clearTimeout(timer);
    }
  }, [showModal, render]);

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop com animação de fade in / out cobrindo 100% da viewport */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
          isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
        onClick={() => !loading && setShowModal(false)}
      />
      {/* Sheet com animação de mola de entrada e saída idêntica ao PlantSelector */}
      <div
        className={`relative clay-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl border-0 md:border md:border-outline-variant/10 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom)+40px)] -mb-10 md:mb-0 md:pb-6 space-y-4 shadow-2xl z-10 ${
          isClosing
            ? 'animate-slideDownSpring md:animate-zoomOutSpring'
            : 'animate-slideUpSpring md:animate-zoomIn'
        }`}
      >
        {/* Handle para mobile */}
        <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-2 md:hidden" />
        
        <h3 className="text-center font-title-md font-bold tracking-tight text-on-surface">
          Reservatório reabastecido?
        </h3>

        <div className="space-y-2.5">
          {/* Opção: Sim, enchi até 1,5 L */}
          <button
            type="button"
            disabled={loading}
            onClick={onConfirmRefill}
            className="w-full flex items-center justify-between p-4 rounded-2xl text-left min-h-[48px] transition-all duration-300 active:scale-[0.98] clay-card-dark border border-secondary/30 shadow-[0_4px_16px_rgba(56,189,248,0.08)] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl select-none">💧</span>
              <div>
                <div className="text-sm font-bold text-secondary">Sim, enchi até 1,5 L</div>
                <div className="text-[10px] mt-0.5 text-secondary/70">A contagem será reiniciada para 100%</div>
              </div>
            </div>
            {loading ? (
              <span className="material-symbols-outlined text-secondary text-xl animate-spin [animation-direction:reverse]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
            )}
          </button>

        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-2xl p-3 text-xs text-center font-medium animate-fadeIn">
            Não foi possível registrar. Verifique a conexão e tente novamente.
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => setShowModal(false)}
          className="w-full py-3 clay-card-dark md:hover:bg-surface-container-highest font-bold rounded-2xl text-xs active:scale-[0.98] border border-outline-variant/20 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body
  );
}
