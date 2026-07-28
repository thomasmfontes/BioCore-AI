import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { savePhotoToLocal, triggerDeviceDownload } from '../../utils/localPhotosDB';

type CameraStatus = 'connecting' | 'online' | 'offline' | 'off';

interface PlantCameraProps {
  className?: string;
  showDetails?: boolean;
}

export function PlantCamera({ className = '', showDetails = true }: PlantCameraProps) {
  const defaultUrl = "/api/camera-proxy";
  const rawBaseUrl = import.meta.env.VITE_CAMERA_STREAM_URL || defaultUrl;
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [status, setStatus] = useState<CameraStatus>('off');

  const [streamUrl, setStreamUrl] = useState<string>(
    () => `${baseUrl}?connection=${Date.now()}`
  );

  const [lastAttemptTime, setLastAttemptTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const cardImgRef = useRef<HTMLImageElement | null>(null);
  const fullscreenImgRef = useRef<HTMLImageElement | null>(null);

  // Estados de feedback do obturador e toast do sistema
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isToastExiting, setIsToastExiting] = useState<boolean>(false);
  const [isVoiceWidgetVisible, setIsVoiceWidgetVisible] = useState<boolean>(false);
  const toastExitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastAutoHideRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVoiceStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ isVisible: boolean }>;
      setIsVoiceWidgetVisible(!!customEvent.detail?.isVisible);
    };
    window.addEventListener('biocore-voicewidget-status', handleVoiceStatus);
    return () => {
      window.removeEventListener('biocore-voicewidget-status', handleVoiceStatus);
    };
  }, []);

  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Helpers de toast unificados com animação de saída suave (padrão VoiceWidget)
  const dismissToast = () => {
    if (toastExitTimeoutRef.current) clearTimeout(toastExitTimeoutRef.current);
    if (toastAutoHideRef.current) clearTimeout(toastAutoHideRef.current);
    setIsToastExiting(true);
    toastExitTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
      setIsToastExiting(false);
    }, 300);
  };

  const showToast = (msg: string) => {
    // Cancelar saída ou auto-hide anteriores
    if (toastExitTimeoutRef.current) { clearTimeout(toastExitTimeoutRef.current); toastExitTimeoutRef.current = null; }
    if (toastAutoHideRef.current) { clearTimeout(toastAutoHideRef.current); toastAutoHideRef.current = null; }
    setToastMsg(msg);
    setIsToastExiting(false);
    // Auto-dismiss com animação de saída suave após 3s
    toastAutoHideRef.current = setTimeout(() => dismissToast(), 3000);
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      resetControlsTimeout();
      if (screen.orientation && 'unlock' in screen.orientation) {
        try { screen.orientation.unlock(); } catch { /* ignore */ }
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
      if (screen.orientation && 'lock' in screen.orientation) {
        try { (screen.orientation as any).lock('portrait').catch(() => {}); } catch { /* ignore */ }
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  const lastVibratedStepRef = useRef<number>(100);

  // Capturar foto com disparo limpo e instantâneo
  const handleCapturePhoto = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (status !== 'online') return;

    const targetImg = isFullscreen ? fullscreenImgRef.current : cardImgRef.current;
    if (!targetImg) return;

    // Vibração tátil sutil
    navigator.vibrate?.(20);

    // Flash da tela piscando por 120ms ao tirar a foto
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 120);

    try {
      const canvas = document.createElement('canvas');
      const w = targetImg.naturalWidth || targetImg.clientWidth || 1280;
      const h = targetImg.naturalHeight || targetImg.clientHeight || 720;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível obter contexto 2D');

      ctx.drawImage(targetImg, 0, 0, w, h);

      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `biocore_planta_${dateStr}.jpg`;

      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      } catch (taintErr) {
        console.warn('Canvas com restrição de CORS, tentando fetch do frame:', taintErr);
        try {
          const res = await fetch(streamUrl);
          const blob = await res.blob();
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          triggerDeviceDownload(streamUrl, filename);
          showToast('Foto salvando no dispositivo...');
          return;
        }
      }

      if (dataUrl) {
        // 1. Download direto no dispositivo
        triggerDeviceDownload(dataUrl, filename);

        // 2. Salvar na galeria local (IndexedDB)
        await savePhotoToLocal({
          dataUrl,
          timestamp: now.getTime(),
          formattedDate,
          filename,
        });

        // 3. Notificar galeria local para atualização
        window.dispatchEvent(new CustomEvent('biocore-photo-captured'));

        // 4. Notificação Toast no Padrão do Sistema
        showToast('Foto salva no dispositivo!');
      }
    } catch (err) {
      console.error('Erro ao capturar frame:', err);
      showToast('Não foi possível capturar a foto.');
    }
  };

  // Gestos de Toque em Tela Cheia
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartScale.current = zoomScale;
      lastVibratedStepRef.current = Math.round(zoomScale * 100);
    } else if (e.touches.length === 1) {
      isPinching.current = false;
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        navigator.vibrate?.([10, 20, 10]);
        if (zoomScale > 1) {
          setZoomScale(1);
          setPanPosition({ x: 0, y: 0 });
          lastVibratedStepRef.current = 100;
        } else {
          setZoomScale(2.2);
          lastVibratedStepRef.current = 220;
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

      const currentStep = Math.round(newScale * 100);
      if (currentStep !== lastVibratedStepRef.current) {
        lastVibratedStepRef.current = currentStep;
        try { navigator.vibrate?.(5); } catch { /* ignore */ }
      }

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

  const handleReconnect = () => {
    navigator.vibrate?.(15);
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

  const toggleFullscreen = () => {
    navigator.vibrate?.(15);
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    if (screen.orientation) {
      try {
        if ('unlock' in screen.orientation) screen.orientation.unlock();
      } catch (e) {}
    }
  };

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
      {/* Toast Notification no Padrão do Sistema (Empilhado abaixo da Voz da Planta se ativa) */}
      {toastMsg &&
        createPortal(
          <div className={`fixed left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-40 pointer-events-auto transition-all duration-300 ${
            isVoiceWidgetVisible
              ? 'top-[calc(10.5rem+env(safe-area-inset-top))]'
              : 'top-[calc(4.5rem+env(safe-area-inset-top))]'
          }`}>
            <div className={`bg-[#181c1f]/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(44,184,116,0.15)] flex items-center gap-3 transition-all duration-300 ${
              isToastExiting ? 'animate-toastExit' : 'animate-toastEnter'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider block">
                  Galeria do Dispositivo
                </span>
                <p className="text-xs text-on-surface font-semibold leading-snug">
                  {toastMsg}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissToast(); }}
                className="w-8 h-8 rounded-xl bg-surface-container-highest/50 hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                title="Fechar notificação"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>,
          document.body
        )}

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
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 animate-pulse'
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
          {/* Flash da Câmera ao Tirar Foto (Tela Piscando) */}
          {isShutterActive && (
            <div className="absolute inset-0 bg-white/85 z-30 pointer-events-none transition-opacity duration-100" />
          )}
          {/* Tag <img> do card */}
          {isPoweredOn && (
            <img
              ref={cardImgRef}
              src={streamUrl}
              alt="Transmissão ao vivo da planta"
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-contain ${
                status === 'offline' ? 'opacity-20 pointer-events-none' : 'opacity-100'
              }`}
            />
          )}

          {/* Floating Action Overlay (Top-Right) */}
          {isPoweredOn && status === 'online' && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              {/* Botão Capturar Foto */}
              <button
                onClick={handleCapturePhoto}
                title="Capturar foto e salvar no dispositivo"
                aria-label="Capturar foto"
                className="w-9 h-9 rounded-xl bg-[#111417]/90 border border-primary/30 text-primary hover:bg-primary/20 active:scale-90 flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </button>

              <button
                onClick={handleReconnect}
                title="Reconectar câmera"
                aria-label="Reconectar câmera"
                className="w-9 h-9 rounded-xl bg-[#111417]/90 border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 active:scale-90 flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="Abrir em tela cheia"
                aria-label="Abrir em tela cheia"
                className="w-9 h-9 rounded-xl bg-[#111417]/90 border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 active:scale-90 flex items-center justify-center transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-base">fullscreen</span>
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
              onClick={() => {
                navigator.vibrate?.([10, 30, 10]);
                setIsPoweredOn(prev => !prev);
              }}
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

      {/* PORTAL DO MODAL DE TELA CHEIA */}
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

          {/* Botão Shutter Flutuante Central em Tela Cheia */}
          {status === 'online' && (
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-auto ${
              showControls ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCapturePhoto(e);
                  resetControlsTimeout();
                }}
                title="Tirar foto agora"
                aria-label="Tirar foto agora"
                className="w-14 h-14 rounded-full bg-primary text-[#00210f] border-4 border-black/40 shadow-[0_0_20px_rgba(90,240,157,0.35)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined text-2xl font-bold">photo_camera</span>
              </button>
            </div>
          )}

          {/* Viewport Central da Transmissão em Tela Cheia */}
          <div className="relative w-full h-full flex items-center justify-center animate-enterVideo overflow-hidden">
            {/* Flash da Câmera ao Tirar Foto (Tela Piscando em Tela Cheia) */}
            {isShutterActive && (
              <div className="absolute inset-0 bg-white/85 z-30 pointer-events-none transition-opacity duration-100" />
            )}
            {isPoweredOn && (
              <img
                ref={fullscreenImgRef}
                src={streamUrl}
                alt="Transmissão em tela cheia da planta"
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
