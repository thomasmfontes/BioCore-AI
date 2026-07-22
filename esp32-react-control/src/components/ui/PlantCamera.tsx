import React, { useState, useEffect, useRef } from 'react';

interface PlantCameraProps {
  className?: string;
  showDetails?: boolean;
}

export function PlantCamera({ className = '', showDetails = true }: PlantCameraProps) {
  const rawBaseUrl = import.meta.env.VITE_CAMERA_STREAM_URL || "https://thomas-q.tail6cf6eb.ts.net";
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline' | 'off'>('connecting');

  // Inicializar a URL estável apenas uma vez na montagem (useState lazy)
  const [streamUrl, setStreamUrl] = useState<string>(() => `${baseUrl}?t=${Date.now()}`);

  // Horário da última tentativa gerenciado em estado separado sem afetar a URL ou a key da imagem
  const [lastAttemptTime, setLastAttemptTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeoutTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Alterar streamUrl exclusivamente quando o usuário clica em "Reconectar" / "Tentar Novamente"
  const handleReconnect = () => {
    if (!isPoweredOn) return;
    clearTimeoutTimer();
    setStatus('connecting');
    const now = new Date();
    setLastAttemptTime(now.toLocaleTimeString());
    setStreamUrl(`${baseUrl}?t=${now.getTime()}`);

    timeoutRef.current = setTimeout(() => {
      setStatus((current) => (current === 'connecting' ? 'offline' : current));
    }, 12000);
  };

  const handleLoad = () => {
    clearTimeoutTimer();
    setStatus('online');
  };

  const handleError = () => {
    clearTimeoutTimer();
    setStatus('offline');
  };

  // Definição defensiva do timeout inicial ao ligar/montar o componente
  useEffect(() => {
    if (isPoweredOn) {
      timeoutRef.current = setTimeout(() => {
        setStatus((current) => (current === 'connecting' ? 'offline' : current));
      }, 12000);
    } else {
      clearTimeoutTimer();
      setStatus('off');
    }

    return () => {
      clearTimeoutTimer();
    };
  }, [isPoweredOn]);

  // Fullscreen API aplicada no mesmo elemento existente (sem criar segunda tag img)
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
        </header>
      )}

      {/* Main Stream Display Area */}
      <div className={`relative w-full overflow-hidden flex items-center justify-center transition-all ${
        isFullscreen 
          ? 'w-full h-full bg-black rounded-none border-none' 
          : 'rounded-2xl bg-[#0a0c0e] border border-outline-variant/20 aspect-video'
      }`}>
        
        {/* ÚNICA tag <img> conectada ao stream MJPEG. Atributo src absolutamente estável, sem propriedade key estática ou dinâmica */}
        {isPoweredOn && (
          <img
            src={streamUrl}
            alt="Transmissão ao vivo do cultivo BioCore AI"
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              status === 'online' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
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

        {/* Loading Overlay (Connecting State) */}
        {isPoweredOn && status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e] p-6 text-center animate-fadeIn pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-primary/30 inset-shadow shadow-[0_0_20px_rgba(90,240,157,0.12)] mb-3 animate-pulse">
              <span className="material-symbols-outlined text-primary text-2xl drop-shadow-md">videocam</span>
            </div>
            <p className="text-xs font-bold text-on-surface tracking-wide">Carregando transmissão ao vivo...</p>
          </div>
        )}

        {/* Unavailable Overlay (Offline State) */}
        {isPoweredOn && status === 'offline' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e] p-6 text-center animate-fadeIn z-10">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-error/30 inset-shadow shadow-[0_0_15px_rgba(255,84,73,0.15)] mb-3">
              <span className="material-symbols-outlined text-error text-2xl drop-shadow-md">videocam_off</span>
            </div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Câmera Indisponível</h3>
            <p className="text-[11px] text-on-surface-variant max-w-xs mb-4 leading-relaxed">
              Não foi possível acessar a câmera no momento. Verifique se o vaso está energizado e conectado à internet.
            </p>
            <button
              onClick={handleReconnect}
              className="clay-btn-primary px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Tentar Novamente
            </button>
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
      )}
    </div>
  );
}
