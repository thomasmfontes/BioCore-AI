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
  onGrantPermission,
  streamUrl
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
      }, 350);
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
    <div className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative clay-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl border-0 md:border md:border-outline-variant/20 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 space-y-5 shadow-2xl z-10 ${
          isClosing
            ? 'animate-slideDownSpring md:animate-zoomOutSpring'
            : 'animate-slideUpSpring md:animate-zoomIn'
        }`}
      >
        {/* Handle bar for mobile drag indicator */}
        <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto md:hidden" />

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-[0_0_15px_rgba(90,240,157,0.15)]">
            <span className="material-symbols-outlined text-2xl">router</span>
          </div>
          <div>
            <h3 className="font-title-md font-bold text-base text-on-surface">Permissão de Rede Local</h3>
            <p className="text-xs text-on-surface-variant">Controle o acesso do aplicativo aos dispositivos locais</p>
          </div>
        </div>

        {/* Permission Toggle Option Card */}
        <div 
          onClick={() => setIsAllowed(!isAllowed)}
          className={`p-4 rounded-2xl clay-card-dark border transition-all duration-300 cursor-pointer flex items-center justify-between ${
            isAllowed ? 'border-primary/40 shadow-[0_4px_16px_rgba(90,240,157,0.1)]' : 'border-outline-variant/20'
          }`}
        >
          <div className="flex items-center gap-3 pr-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isAllowed ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-outline'
            }`}>
              <span className="material-symbols-outlined text-lg">cell_tower</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Acesso à Rede Local</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {isAllowed ? 'Permitido para o vaso e câmera' : 'Bloqueado no dispositivo'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="relative inline-flex items-center touch-target-min select-none shrink-0">
            <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
              isAllowed 
                ? 'bg-primary/20 border-primary/40' 
                : 'bg-surface-container-highest border-outline'
            }`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                isAllowed 
                  ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' 
                  : 'bg-outline left-0.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Guidance Note */}
        <div className="bg-surface-container-lowest/60 border border-outline-variant/20 rounded-2xl p-3 text-[11px] text-on-surface-variant leading-relaxed flex items-start gap-2.5">
          <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">info</span>
          <span>
            Ao autorizar, o PWA salvará a permissão de <strong>Rede Local</strong> para conectar diretamente à transmissão ao vivo da câmera.
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={handleConfirm}
            className="clay-btn-primary w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Permitir e Conectar Câmera
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 clay-card-dark hover:bg-surface-container-highest font-bold rounded-2xl text-xs active:scale-[0.98] border border-outline-variant/20 text-on-surface-variant"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
