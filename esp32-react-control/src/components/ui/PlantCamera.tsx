import React, { useState, useEffect, useRef } from 'react';
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

  // Controle de visibilidade da barra de controles no modo Tela Cheia (Auto-hide após 3.5s)
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados de Zoom por gestos (Pinch-to-zoom, Double Tap & Touch Pan)
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const lastTapTime = useRef<number>(0);
  const isPinching = useRef<boolean>(false);
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  useEffect(() => {
    if (isFullscreen) {
      resetControlsTimeout();
    } else {
      // Resetar zoom e pan ao sair de tela cheia
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  // Gestos de Toque em Tela Cheia (Pinch-to-zoom, Double-tap & Pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartScale.current = zoomScale;
    } else if (e.touches.length === 1) {
      isPinching.current = false;
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        // Double tap toggle zoom (2.2x / 1.0x)
        if (zoomScale > 1) {
          setZoomScale(1);
          setPanPosition({ x: 0, y: 0 });
        } else {
          setZoomScale(2.2);
        }
        lastTapTime.current = 0;
      } else {
        lastTapTime.current = now;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartDist.current;
      const newScale = Math.min(Math.max(touchStartScale.current * factor, 1), 3.5);
      setZoomScale(newScale);
      if (newScale === 1) setPanPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && zoomScale > 1 && lastTouchPos.current) {
      const deltaX = e.touches[0].clientX - lastTouchPos.current.x;
      const deltaY = e.touches[0].clientY - lastTouchPos.current.y;
      setPanPosition(prev => ({
        x: Math.min(Math.max(prev.x + deltaX, -150 * zoomScale), 150 * zoomScale),
        y: Math.min(Math.max(prev.y + deltaY, -150 * zoomScale), 150 * zoomScale)
      }));
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
    lastTouchPos.current = null;
    isPinching.current = false;
  };

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

  // Alternar o modo Tela Cheia com animação ultra-suave
  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    // Suporte à API de Orientação para liberar rotação no celular ao entrar em tela cheia
    if (screen.orientation) {
      try {
        if (nextState) {
          if ('unlock' in screen.orientation) screen.orientation.unlock();
        } else {
          if ('unlock' in screen.orientation) screen.orientation.unlock();
        }
      } catch (e) {}
    }
  };

  // Tecla ESC para fechar tela cheia no teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
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

      {/* PORTAL DO MODAL DE TELA CHEIA (Player Imersivo com Gestos de Zoom, Overlays e Minimizar) */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-[#050708] flex items-center justify-center p-0 m-0 overflow-hidden animate-fadeIn select-none cursor-pointer touch-none"
          onClick={() => {
            if (showControls) {
              setShowControls(false);
            } else {
              resetControlsTimeout();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Cinema Gradient Overlay Header */}
          <div className={`absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-all duration-300 pointer-events-auto ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
            {/* Badge AO VIVO Padronizado */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2.5 py-1 rounded-full border font-mono font-bold bg-primary/10 text-primary border-primary/20 backdrop-blur-md shadow-lg">
                AO VIVO
              </span>
              {zoomScale > 1 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold bg-white/10 text-white/80 border-white/20 backdrop-blur-md animate-fadeIn">
                  {zoomScale.toFixed(1)}x
                </span>
              )}
            </div>

            {/* Ações de Controle Padronizadas */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReconnect();
                  resetControlsTimeout();
                }}
                title="Reconectar stream"
                aria-label="Reconectar stream"
                className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                title="Minimizar tela cheia"
                aria-label="Minimizar tela cheia"
                className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl hover:bg-black/80 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-base">fullscreen_exit</span>
              </button>
            </div>
          </div>

          {/* Viewport Central da Transmissão */}
          <div className="relative w-full h-full flex items-center justify-center animate-enterVideo overflow-hidden">
            {isPoweredOn && (
              <img
                src={streamUrl}
                alt=""
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                  transition: isPinching.current ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className={`w-full h-full object-contain max-h-screen max-w-screen ${
                  status === 'offline' ? 'opacity-20 pointer-events-none' : 'opacity-100'
                }`}
              />
            )}

            {/* Overlay CONECTANDO em Tela Cheia */}
            {isPoweredOn && status === 'connecting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/80 backdrop-blur-xs p-6 text-center animate-fadeIn z-40 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-primary/30 inset-shadow shadow-[0_0_20px_rgba(90,240,157,0.12)] mb-3 animate-pulse">
                  <span className="material-symbols-outlined text-primary text-2xl drop-shadow-md">videocam</span>
                </div>
                <p className="text-xs font-bold text-on-surface tracking-wide">Carregando transmissão ao vivo...</p>
              </div>
            )}

            {/* Overlay OFFLINE em Tela Cheia */}
            {isPoweredOn && status === 'offline' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c0e]/90 backdrop-blur-sm p-6 text-center animate-fadeIn z-40 pointer-events-auto">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-error/30 inset-shadow shadow-[0_0_15px_rgba(255,84,73,0.15)] mb-3">
                  <span className="material-symbols-outlined text-error text-2xl drop-shadow-md">videocam_off</span>
                </div>
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Câmera Indisponível</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReconnect();
                  }}
                  className="clay-btn-primary px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
