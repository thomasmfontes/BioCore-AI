import React, { useState, useEffect, useRef } from 'react';
import { LocalNetworkModal } from './LocalNetworkModal';

type CameraStatus = 'connecting' | 'online' | 'offline' | 'off';

interface PlantCameraProps {
  className?: string;
  showDetails?: boolean;
}

export function PlantCamera({ className = '', showDetails = true }: PlantCameraProps) {
  const rawBaseUrl = import.meta.env.VITE_CAMERA_STREAM_URL || "https://thomas-q.tail6cf6eb.ts.net";
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [status, setStatus] = useState<CameraStatus>('off');
  const [showNetworkModal, setShowNetworkModal] = useState<boolean>(false);

  // Inicializar a URL criada uma única vez por tentativa usando useState lazy com parâmetro connection
  const [streamUrl, setStreamUrl] = useState<string>(
    () => `${baseUrl}?connection=${Date.now()}`
  );

  // Horário da última tentativa gerenciado em estado separado
  const [lastAttemptTime, setLastAttemptTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // O src só muda quando o usuário clica em "Tentar novamente" ou "Reconectar"
  const handleReconnect = () => {
    if (!isPoweredOn) return;
    setStatus('connecting');
    const now = new Date();
    setLastAttemptTime(now.toLocaleTimeString());
    setStreamUrl(`${baseUrl}?connection=${now.getTime()}`);
  };

  const handleGrantNetworkPermission = () => {
    handleReconnect();
  };

  const handleLoad = () => {
    setStatus('online');
  };

  const handleError = () => {
    setStatus('offline');
  };

  useEffect(() => {
    if (isPoweredOn) {
      setStatus('connecting');
    } else {
      setStatus('off');
    }
  }, [isPoweredOn]);

  // Fullscreen API aplicada no mesmo elemento existente
  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
      }
    } else {
      if (containerRef.current.requestFullscreen) {
        try {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.warn('Fullscreen API rejected, falling back to new window:', err);
          window.open(baseUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        window.open(baseUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] bg-[#050708] flex flex-col justify-center items-center h-screen w-screen p-0 m-0 rounded-none border-none shadow-none overflow-hidden'
          : 'clay-card-dark rounded-3xl p-stack-md relative overflow-hidden'
      } ${className}`}
    >
      {/* Header section (hidden in Fullscreen) */}
      {showDetails && !isFullscreen && (
        <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            Câmera da Planta
          </span>

          <div className="flex items-center gap-2">
            {/* Status Indicator Badge */}
            <span 
              aria-live="polite"
              className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold transition-all ${
                status === 'online'
                  ? 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                  : status === 'connecting'
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                  : status === 'offline'
                  ? 'bg-error/10 text-error border-error/20'
                  : 'bg-outline/10 text-outline border-outline/20'
              }`}
            >
              {status === 'online'
                ? 'AO VIVO'
                : status === 'connecting'
                ? 'CONECTANDO...'
                : status === 'offline'
                ? 'OFFLINE'
                : 'DESLIGADA'}
            </span>
          </div>
        </header>
      )}

      {/* Main Stream Display Area */}
      <div className={`relative w-full overflow-hidden flex items-center justify-center transition-all ${
        isFullscreen 
          ? 'w-full h-full bg-black rounded-none border-none' 
          : 'rounded-2xl bg-[#0a0c0e] border border-outline-variant/20 aspect-video'
      }`}>
        
        {/* ÚNICA tag <img> que permanece SEMPRE MONTADA quando ligada (mesmo se connecting ou offline) */}
        {isPoweredOn && (
          <img
            src={streamUrl}
            alt=""
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-contain ${
              status === 'offline' ? 'opacity-20 pointer-events-none' : 'opacity-100'
            }`}
          />
        )}

        {/* Top-Left Glass Badge (Only in Fullscreen when online) */}
        {isFullscreen && isPoweredOn && status === 'online' && (
          <div className="absolute top-6 left-6 z-20">
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-mono font-bold animate-pulse backdrop-blur-md shadow-lg">
              AO VIVO
            </span>
          </div>
        )}

        {/* Floating Glass Actions Overlay (Top-Right, visible ONLY when online) */}
        {isPoweredOn && status === 'online' && (
          <div className={`absolute z-20 flex items-center gap-2 ${isFullscreen ? 'top-6 right-6' : 'top-3 right-3'}`}>
            <button
              onClick={handleReconnect}
              title="Reconectar câmera"
              aria-label="Reconectar câmera"
              className={`rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg ${
                isFullscreen ? 'w-10 h-10' : 'w-8 h-8'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                refresh
              </span>
            </button>

            <button
              onClick={handleFullscreen}
              title={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
              className={`rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg ${
                isFullscreen ? 'w-10 h-10' : 'w-8 h-8'
              }`}
            >
              <span className={`material-symbols-outlined ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        )}

        {/* Overlay do estado CONECTANDO (Posicionado sobre a imagem, sem desmontar a tag img) */}
        {isPoweredOn && status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/80 backdrop-blur-xs p-6 text-center animate-fadeIn z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-primary/30 inset-shadow shadow-[0_0_20px_rgba(90,240,157,0.12)] mb-3 animate-pulse">
              <span className="material-symbols-outlined text-primary text-2xl drop-shadow-md">videocam</span>
            </div>
            <p className="text-xs font-bold text-on-surface tracking-wide">Carregando transmissão ao vivo...</p>
          </div>
        )}

        {/* Overlay do estado OFFLINE (Posicionado sobre a imagem, sem desmontar a tag img) */}
        {isPoweredOn && status === 'offline' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/90 backdrop-blur-sm p-5 text-center animate-fadeIn z-10">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-error/30 inset-shadow shadow-[0_0_15px_rgba(255,84,73,0.15)] mb-2">
              <span className="material-symbols-outlined text-error text-xl drop-shadow-md">videocam_off</span>
            </div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Câmera Indisponível</h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleReconnect}
                className="clay-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                Tentar Novamente
              </button>

              <button
                onClick={() => setShowNetworkModal(true)}
                className="bg-surface-container-highest border border-outline-variant text-on-surface px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm hover:border-primary/40"
              >
                <span className="material-symbols-outlined text-xs text-primary">router</span>
                Rede Local
              </button>
            </div>
          </div>
        )}

        {/* Powered Off / Standby Screen */}
        {!isPoweredOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e] p-6 text-center animate-fadeIn z-10">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow mb-3">
              <span className="material-symbols-outlined text-outline text-2xl">videocam_off</span>
            </div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Câmera Desligada</h3>
          </div>
        )}
      </div>

      {/* Footer / Controls bar (hidden in Fullscreen) */}
      {showDetails && !isFullscreen && (
        <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-outline font-mono">
            <span className="material-symbols-outlined text-xs">schedule</span>
            <span>Última conexão: <strong className="text-on-surface font-mono">{isPoweredOn ? lastAttemptTime : '--:--:--'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {/* Minimalist Power Toggle Switch */}
            <button
              onClick={() => setIsPoweredOn(!isPoweredOn)}
              title={isPoweredOn ? "Desligar câmera" : "Ligar câmera"}
              aria-label={isPoweredOn ? "Desligar câmera" : "Ligar câmera"}
              className="relative inline-flex items-center touch-target-min outline-none select-none cursor-pointer"
            >
              <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
                isPoweredOn 
                  ? 'bg-primary/20 border-primary/40' 
                  : 'bg-surface-container-highest border-outline'
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                  isPoweredOn 
                    ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' 
                    : 'bg-outline left-0.5'
                }`} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Local Network Permission System Modal */}
      <LocalNetworkModal
        show={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onGrantPermission={handleGrantNetworkPermission}
        streamUrl={baseUrl}
      />
    </div>
  );
}
