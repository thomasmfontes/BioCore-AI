import React, { useState, useEffect } from 'react';

interface LocalNetworkModalProps {
  show: boolean;
  onClose: () => void;
  onGrantPermission: () => void;
  streamUrl: string;
}

export function LocalNetworkModal({
  show,
  onClose,
  onGrantPermission
}: LocalNetworkModalProps) {
  const [render, setRender] = useState(show);
  const [isClosing, setIsClosing] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    if (show) {
      setRender(true);
      setIsClosing(false);
    } else if (render) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 400); // tempo de 400ms sincronizado com a animação de saída de mola
      return () => clearTimeout(timer);
    }
  }, [show, render]);

  if (!render) return null;

  const handleConfirm = () => {
    if (isAllowed) {
      localStorage.setItem('biocore_local_network_granted', 'true');
      onGrantPermission();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
          isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div
        className={`relative clay-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl border-0 md:border md:border-outline-variant/10 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom)+40px)] -mb-10 md:mb-0 md:pb-6 space-y-4 shadow-2xl z-10 ${
          isClosing
            ? 'animate-slideDownSpring md:animate-zoomOutSpring'
            : 'animate-slideUpSpring md:animate-zoomIn'
        }`}
      >
        {/* Handle bar para mobile */}
        <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-2 md:hidden" />
        
        {/* Título do Modal no padrão do PlantSelector */}
        <h3 className="text-center font-title-md font-bold tracking-tight text-on-surface">
          Permissão de Rede Local
        </h3>

        {/* Lista de Opções no padrão do PlantSelector */}
        <div className="space-y-2.5">
          <button
            onClick={() => setIsAllowed(!isAllowed)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-left min-h-[48px] transition-all duration-300 active:scale-[0.98] clay-card-dark border ${
              isAllowed
                ? 'border-primary/30 shadow-[0_4px_16px_rgba(90,240,157,0.08)]'
                : 'border-transparent md:hover:opacity-90 text-on-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl select-none">📡</span>
              <div>
                <div className={`text-sm font-bold transition-colors duration-300 ${isAllowed ? 'text-primary' : 'text-on-surface'}`}>
                  Acesso à Rede Local
                </div>
                <div className={`text-[10px] mt-0.5 transition-colors duration-300 ${isAllowed ? 'text-primary/70' : 'text-on-surface-variant'}`}>
                  {isAllowed ? 'Permitido para o vaso e câmera' : 'Bloqueado no dispositivo'}
                </div>
              </div>
            </div>
            {isAllowed && (
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
            )}
          </button>
        </div>

        {/* Botão de confirmação estilo Claymorphic Primary */}
        <button
          onClick={handleConfirm}
          className="w-full py-3 clay-card-primary text-[#00210f] font-bold rounded-2xl text-xs active:scale-[0.98] shadow-md transition-all"
        >
          Confirmar
        </button>

        {/* Botão Cancelar no padrão do PlantSelector */}
        <button
          onClick={onClose}
          className="w-full py-3 clay-card-dark md:hover:bg-surface-container-highest font-bold rounded-2xl text-xs active:scale-[0.98] border border-outline-variant/20"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
