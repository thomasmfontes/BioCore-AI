import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

  // Inicializar a URL criada uma única vez por tentativa usando useState lazy com parâmetro connection
  const [streamUrl, setStreamUrl] = useState<string>(
    () => `${baseUrl}?connection=${Date.now()}`
  );

  // Horário da última tentativa gerenciado em estado separado
  const [lastAttemptTime, setLastAttemptTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Alterar streamUrl exclusivamente quando o usuário clica em "Tentar novamente" ou "Reconectar"
  const handleReconnect = () => {
    if (!isPoweredOn) return;
    setStatus('connecting');
    const now = new Date();
    setLastAttemptTime(now.toLocaleTimeString());
    setStreamUrl(`${baseUrl}?connection=${now.getTime()}`);
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

  // Alternar o modo Tela Cheia com rotação automática para paisagem no celular
  const toggleFullscreen = async () => {
    const nextState = !isFullscreen;

    if (nextState) {
      setIsFullscreen(true);
      // 1. Solicita permissão ao navegador para entrar em Fullscreen no documento
      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {}
      }

      // 2. Desbloqueia ou solicita rotação para paisagem (horizontal)
      const orientation = (screen as any).orientation;
      if (orientation) {
        try {
          if ('unlock' in orientation) {
            try { orientation.unlock(); } catch (e) {}
          }
          if ('lock' in orientation) {
            try {
              await orientation.lock('landscape-primary').catch(() => {
                orientation.lock('landscape').catch(() => {
                  if ('unlock' in orientation) orientation.unlock();
                });
              });
            } catch (e) {}
          }
        } catch (e) {}
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (e) {}
      }
      const orientation = (screen as any).orientation;
      if (orientation && 'unlock' in orientation) {
        try {
          orientation.unlock();
        } catch (e) {}
      }
    }
  };

  // Escutar eventos de alteração de tela cheia nativos (botão voltar do Android / gesto)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      if (!active && isFullscreen) {
        setIsFullscreen(false);
        const orientation = (screen as any).orientation;
        if (orientation && 'unlock' in orientation) {
          try { orientation.unlock(); } catch (e) {}
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Tecla ESC para fechar tela cheia no teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <>
      {/* Card Principal Estático no Dashboard */}
      <div className={`clay-card-dark rounded-3xl p-stack-md relative overflow-hidden ${className}`}>
        {/* Header section estático */}
        {showDetails && (
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

        {/* Janela do Vídeo do Card */}
        <div className="relative w-full overflow-hidden flex items-center justify-center rounded-2xl bg-[#0a0c0e] border border-outline-variant/20 aspect-video">
          {/* ÚNICA tag <img> no card */}
          {isPoweredOn && (
            <img
              src={streamUrl}
              alt=""
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                status === 'offline' ? 'opacity-20 pointer-events-none' : 'opacity-100'
              }`}
            />
          )}

          {/* Floating Action Overlay (Top-Right) */}
          {isPoweredOn && status === 'online' && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <button
                onClick={handleReconnect}
                title="Reconectar câmera"
                aria-label="Reconectar câmera"
                className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="Abrir em tela cheia"
                aria-label="Abrir em tela cheia"
                className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
              </button>
            </div>
          )}

          {/* Overlay CONECTANDO */}
          {isPoweredOn && status === 'connecting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/80 backdrop-blur-xs p-6 text-center animate-fadeIn z-10 pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-primary/30 inset-shadow shadow-[0_0_20px_rgba(90,240,157,0.12)] mb-3 animate-pulse">
                <span className="material-symbols-outlined text-primary text-2xl drop-shadow-md">videocam</span>
              </div>
              <p className="text-xs font-bold text-on-surface tracking-wide">Carregando transmissão ao vivo...</p>
            </div>
          )}

          {/* Overlay OFFLINE */}
          {isPoweredOn && status === 'offline' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/90 backdrop-blur-sm p-6 text-center animate-fadeIn z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-error/30 inset-shadow shadow-[0_0_15px_rgba(255,84,73,0.15)] mb-3">
                <span className="material-symbols-outlined text-error text-2xl drop-shadow-md">videocam_off</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Câmera Indisponível</h3>
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

        {/* Footer / Controls bar */}
        {showDetails && (
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

      {/* PORTAL DO MODAL DE TELA CHEIA (lightbox imersivo com zoom fluído estilo Apple iOS) */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-[#050708]/95 backdrop-blur-2xl flex items-center justify-center p-0 m-0 overflow-hidden animate-fadeIn select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleFullscreen();
          }}
        >
          {/* Barra Superior Flutuante Glass */}
          <div className="absolute top-5 left-5 right-5 z-50 flex items-center justify-between pointer-events-auto">
            {/* Badge AO VIVO */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-primary tracking-wider">AO VIVO</span>
            </div>

            {/* Ações de Controle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReconnect}
                title="Reconectar stream"
                aria-label="Reconectar stream"
                className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all shadow-2xl hover:bg-black/80"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="Sair da tela cheia"
                aria-label="Sair da tela cheia"
                className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all shadow-2xl hover:bg-black/80"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Viewport Central da Transmissão com Animação Fluida de Zoom Imersivo */}
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 animate-enterVideo">
            {isPoweredOn && (
              <img
                src={streamUrl}
                alt=""
                onLoad={handleLoad}
                onError={handleError}
                className="w-full h-full object-contain max-h-screen max-w-screen"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
