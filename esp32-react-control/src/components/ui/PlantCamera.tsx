import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { savePhotoToLocal, triggerDeviceDownload } from '../../utils/localPhotosDB';

type CameraStatus = 'connecting' | 'online' | 'offline' | 'off';

export type CameraFilterMode = 'normal' | 'plant_green' | 'vivid' | 'low_light' | 'high_contrast' | 'custom';

export interface CustomFilterValues {
  brightness: number;
  contrast: number;
  saturate: number;
}

const FILTER_OPTIONS: { id: CameraFilterMode; label: string; icon: string; key: string }[] = [
  { id: 'normal', label: 'Natural', icon: 'auto_awesome', key: '1' },
  { id: 'plant_green', label: 'Verde Vivo', icon: 'eco', key: '2' },
  { id: 'vivid', label: 'Vívido', icon: 'wb_sunny', key: '3' },
  { id: 'low_light', label: 'Pouca Luz', icon: 'bedtime', key: '4' },
  { id: 'high_contrast', label: 'Contraste', icon: 'contrast', key: '5' },
  { id: 'custom', label: 'Ajuste', icon: 'tune', key: '6' },
];

const getCssFilter = (mode: CameraFilterMode, custom: CustomFilterValues): string => {
  switch (mode) {
    case 'plant_green':
      return 'saturate(1.45) contrast(1.1) brightness(1.05)';
    case 'vivid':
      return 'saturate(1.65) contrast(1.15) brightness(1.02)';
    case 'low_light':
      return 'brightness(1.4) contrast(1.25) saturate(1.15)';
    case 'high_contrast':
      return 'contrast(1.35) saturate(1.2) brightness(0.95)';
    case 'custom':
      return `brightness(${custom.brightness}%) contrast(${custom.contrast}%) saturate(${custom.saturate}%)`;
    default:
      return 'none';
  }
};

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

  // Estados dos filtros de cor e melhoria de imagem (Persistência Automática no localStorage)
  const [filterMode, setFilterMode] = useState<CameraFilterMode>(() => {
    try {
      const saved = localStorage.getItem('biocore_camera_filter_mode');
      return (saved as CameraFilterMode) || 'normal';
    } catch {
      return 'normal';
    }
  });

  const [customFilters, setCustomFilters] = useState<CustomFilterValues>(() => {
    try {
      const saved = localStorage.getItem('biocore_camera_custom_filters');
      return saved ? JSON.parse(saved) : { brightness: 100, contrast: 100, saturate: 100 };
    } catch {
      return { brightness: 100, contrast: 100, saturate: 100 };
    }
  });

  // Salvar no localStorage automaticamente ao alterar
  useEffect(() => {
    try {
      localStorage.setItem('biocore_camera_filter_mode', filterMode);
    } catch (e) {
      console.warn('Falha ao salvar modo de filtro no localStorage:', e);
    }
  }, [filterMode]);

  useEffect(() => {
    try {
      localStorage.setItem('biocore_camera_custom_filters', JSON.stringify(customFilters));
    } catch (e) {
      console.warn('Falha ao salvar ajustes customizados no localStorage:', e);
    }
  }, [customFilters]);

  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

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
    // Se o menu de filtros estiver aberto, NÃO inicia o timer de ocultação automática
    if (showFilterMenu) return;
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  // Se o menu de filtros for aberto, trava os controles visíveis e cancela qualquer timer de auto-hide
  useEffect(() => {
    if (showFilterMenu) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else if (isFullscreen) {
      resetControlsTimeout();
    }
  }, [showFilterMenu]);

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

// Helper para carregar a imagem da logo PNG em um elemento HTMLImageElement
const loadLogoImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// Helper para desenhar retângulo arredondado universal (suporte cross-browser)
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
};

// Helper para desenhar a logo PNG com fundo escuro oficial no padrão do sistema (#181c1f e borda primary #5af09d)
const renderCleanLogoWatermark = (
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  logoImg: HTMLImageElement | null
) => {
  if (!logoImg) return;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fator de escala baseado na resolução 1920px (Full HD)
  const scale = canvasW / 1920;
  const paddingRight = Math.round(44 * scale);
  const paddingTop = Math.round(40 * scale);

  // Tamanho ampliado da logo (~165px de altura em Full HD)
  const logoHeight = Math.round(165 * scale);
  const logoWidth = (logoImg.naturalHeight > 0)
    ? Math.round(logoHeight * (logoImg.naturalWidth / logoImg.naturalHeight))
    : logoHeight;

  // Dimensões do fundo escuro (Padrão Oficial do Sistema: #181c1f / borda primary #5af09d)
  const innerPaddingX = Math.round(24 * scale);
  const innerPaddingY = Math.round(20 * scale);
  const badgeW = logoWidth + (innerPaddingX * 2);
  const badgeH = logoHeight + (innerPaddingY * 2);

  const badgeX = canvasW - badgeW - paddingRight;
  const badgeY = paddingTop;

  // 1. Sombra projetada no padrão do sistema
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = Math.round(20 * scale);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(6 * scale);

  // 2. Desenhar Fundo Escuro Oficial do Sistema (#181c1f com 92% de opacidade)
  const radius = Math.round(24 * scale);
  ctx.fillStyle = 'rgba(24, 28, 31, 0.92)';
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, radius);
  ctx.fill();

  // Reset Sombra
  ctx.shadowColor = 'transparent';

  // 3. Borda Oficial do Sistema (Primary #5af09d com 35% de opacidade)
  ctx.lineWidth = Math.max(2, Math.round(2.5 * scale));
  ctx.strokeStyle = 'rgba(90, 240, 157, 0.35)';
  ctx.stroke();

  // 4. Desenhar Logo PNG ampliada dentro do fundo oficial do sistema
  const logoX = badgeX + innerPaddingX;
  const logoY = badgeY + innerPaddingY;
  ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

  ctx.restore();
};

  // Capturar foto com disparo limpo e instantâneo em Alta Resolução (Full HD)
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
      // Garantir resolução HD (mínimo de 1920px de largura)
      const nativeW = targetImg.naturalWidth || targetImg.clientWidth || 1280;
      const nativeH = targetImg.naturalHeight || targetImg.clientHeight || 720;
      const aspect = nativeW / nativeH || (16 / 9);

      const targetW = Math.max(1920, nativeW * 2);
      const targetH = Math.round(targetW / aspect);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível obter contexto 2D');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Carregar logo PNG (/biocore-logo.png)
      const logoImg = await loadLogoImage('/biocore-logo.png');

      // Aplicar filtro de cor selecionado no Canvas antes de desenhar a imagem
      const activeFilterCss = getCssFilter(filterMode, customFilters);
      if (activeFilterCss !== 'none') {
        ctx.filter = activeFilterCss;
      }
      ctx.drawImage(targetImg, 0, 0, targetW, targetH);
      ctx.filter = 'none'; // Reset para garantir marca d'água limpa

      renderCleanLogoWatermark(ctx, targetW, targetH, logoImg);

      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `biocore_planta_${dateStr}.jpg`;

      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      } catch (taintErr) {
        console.warn('Canvas com restrição de CORS, tentando fetch do frame HD:', taintErr);
        try {
          const res = await fetch(streamUrl);
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          const fetchedImg = await new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = objectUrl;
          });

          if (fetchedImg) {
            const cleanCanvas = document.createElement('canvas');
            const cleanNativeW = fetchedImg.naturalWidth || targetW;
            const cleanNativeH = fetchedImg.naturalHeight || targetH;
            const cleanAspect = cleanNativeW / cleanNativeH || (16 / 9);
            const cleanW = Math.max(1920, cleanNativeW * 2);
            const cleanH = Math.round(cleanW / cleanAspect);

            cleanCanvas.width = cleanW;
            cleanCanvas.height = cleanH;
            const cleanCtx = cleanCanvas.getContext('2d');
            if (cleanCtx) {
              cleanCtx.imageSmoothingEnabled = true;
              cleanCtx.imageSmoothingQuality = 'high';
              if (activeFilterCss !== 'none') {
                cleanCtx.filter = activeFilterCss;
              }
              cleanCtx.drawImage(fetchedImg, 0, 0, cleanW, cleanH);
              cleanCtx.filter = 'none';
              renderCleanLogoWatermark(cleanCtx, cleanW, cleanH, logoImg);
              dataUrl = cleanCanvas.toDataURL('image/jpeg', 0.95);
            }
          }
          URL.revokeObjectURL(objectUrl);
        } catch (fallbackErr) {
          console.error('Erro no fallback ao processar imagem HD:', fallbackErr);
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

  // Atalhos de Teclado no Desktop (1-6 para Filtros, P para Painel, C para Foto, F para Tela Cheia)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        return;
      }

      if (status !== 'online') return;

      const key = e.key.toLowerCase();
      if (key === 'p') {
        setShowFilterMenu(prev => !prev);
      } else if (key === 'c') {
        handleCapturePhoto();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'r') {
        handleReconnect();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const option = FILTER_OPTIONS.find(o => o.key === e.key);
        if (option) {
          navigator.vibrate?.(10);
          setFilterMode(option.id);
          setShowFilterMenu(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [status, isFullscreen]);

  // Helper para renderizar a barra de filtros em tela cheia (Desktop Vertical na Lateral vs Mobile Horizontal no Topo)
  const renderFilterMenuPanel = (isFS: boolean = false) => {
    if (!showFilterMenu || status !== 'online') return null;

    if (isFS) {
      return (
        <>
          {/* DESKTOP FULLSCREEN POPOVER VERTICAL (sm:block) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:block absolute top-20 right-6 w-[168px] sm:w-[180px] z-[60] bg-[#181c1f]/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-2 shadow-2xl animate-fadeIn pointer-events-auto"
          >
            {/* Header Desktop Squeezed */}
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-outline-variant/20 px-0.5">
              <span className="font-label-caps text-[8.5px] text-outline uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Filtros
              </span>

              <div className="flex items-center gap-1">
                {filterMode !== 'normal' && (
                  <button
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode('normal');
                      setCustomFilters({ brightness: 100, contrast: 100, saturate: 100 });
                      resetControlsTimeout();
                    }}
                    className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-primary flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                    title="Resetar filtros"
                    aria-label="Resetar filtros"
                  >
                    <span className="material-symbols-outlined text-[10px]">rotate_left</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilterMenu(false)}
                  className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-on-surface flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            </div>

            {/* Lista Vertical de Filtros no Desktop */}
            <div className="space-y-0.5">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filterMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode(opt.id);
                      resetControlsTimeout();
                    }}
                    className={`w-full px-2 py-1 rounded-xl text-[10.5px] font-medium flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/60 text-on-surface-variant hover:text-on-surface border border-outline-variant/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-80">{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-xs text-primary shrink-0">check</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sliders Desktop */}
            {filterMode === 'custom' && (
              <div className="mt-1.5 pt-1.5 border-t border-outline-variant/20 space-y-1 text-xs animate-fadeIn px-0.5">
                <div>
                  <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] opacity-70">wb_sunny</span>
                      Brilho
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.brightness}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, brightness: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] opacity-70">contrast</span>
                      Contraste
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.contrast}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, contrast: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] opacity-70">palette</span>
                      Saturação
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={customFilters.saturate}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, saturate: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* MOBILE FULLSCREEN PAINEL HORIZONTAL NO TOPO (block sm:hidden) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="block sm:hidden absolute top-16 left-3 right-3 z-[60] bg-[#181c1f]/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-2.5 shadow-2xl animate-fadeIn pointer-events-auto"
          >
            {/* Header Mobile */}
            <div className="flex items-center justify-between mb-2 pb-1 px-0.5">
              <span className="font-label-caps text-[9px] text-outline uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Filtros
              </span>

              <div className="flex items-center gap-1.5">
                {filterMode !== 'normal' && (
                  <button
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode('normal');
                      setCustomFilters({ brightness: 100, contrast: 100, saturate: 100 });
                      resetControlsTimeout();
                    }}
                    className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-primary flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                    title="Resetar filtros"
                    aria-label="Resetar filtros"
                  >
                    <span className="material-symbols-outlined text-[10px]">rotate_left</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilterMenu(false)}
                  className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-on-surface flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            </div>

            {/* Pílulas Horizontais Mobile (Com limite simétrico à esquerda e à direita) */}
            <div className="-mx-2.5 px-2.5 flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar snap-x snap-mandatory scroll-px-2.5">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filterMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode(opt.id);
                      resetControlsTimeout();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 snap-start transition-all touch-target-min ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs opacity-80">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sliders Mobile Empilhados */}
            {filterMode === 'custom' && (
              <div className="mt-2 pt-2 border-t border-outline-variant/20 space-y-2.5 text-xs animate-fadeIn px-0.5">
                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">wb_sunny</span>
                      Brilho
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.brightness}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, brightness: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">contrast</span>
                      Contraste
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.contrast}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, contrast: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">palette</span>
                      Saturação
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={customFilters.saturate}
                    onChange={(e) => {
                      setCustomFilters(prev => ({ ...prev, saturate: Number(e.target.value) }));
                      resetControlsTimeout();
                    }}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    return null;
  };

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
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Câmera da Planta
              </span>
              {filterMode !== 'normal' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-bold flex items-center gap-1 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#5af09d]" />
                  {FILTER_OPTIONS.find(o => o.id === filterMode)?.label}
                </span>
              )}
            </div>

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

        {/* Janela do Vídeo do Card Wrapper (sem overflow-hidden para não cortar o popover) */}
        <div className="relative w-full">
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
                style={{
                  filter: getCssFilter(filterMode, customFilters),
                  willChange: filterMode !== 'normal' ? 'filter' : 'auto',
                }}
                className={`w-full h-full object-contain ${
                  status === 'offline' ? 'opacity-20 pointer-events-none' : 'opacity-100'
                }`}
              />
            )}

            {/* Floating Action Overlay (Top-Right) */}
            {isPoweredOn && status === 'online' && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                {/* Botão Filtros de Cor */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.vibrate?.(15);
                    setShowFilterMenu(prev => !prev);
                  }}
                  title="Filtros de Cor da Câmera"
                  aria-label="Filtros de Cor"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                    filterMode !== 'normal' || showFilterMenu
                      ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(90,240,157,0.2)]'
                      : 'bg-[#111417]/90 border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">palette</span>
                </button>

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

          {/* DESKTOP POPOVER VERTICAL (sm:block) - Largura exata entre botão filtro (esquerda) e tela cheia (direita) */}
          {showFilterMenu && status === 'online' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:block absolute top-14 right-3 w-[168px] z-30 bg-[#181c1f]/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-2 shadow-2xl animate-fadeIn pointer-events-auto"
            >
              {/* Header Desktop Squeezed */}
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-outline-variant/20 px-0.5">
                <span className="font-label-caps text-[8.5px] text-outline uppercase tracking-widest font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Filtros
                </span>

                <div className="flex items-center gap-1">
                  {filterMode !== 'normal' && (
                    <button
                      onClick={() => {
                        navigator.vibrate?.(10);
                        setFilterMode('normal');
                        setCustomFilters({ brightness: 100, contrast: 100, saturate: 100 });
                      }}
                      className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-primary flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                      title="Resetar filtros"
                      aria-label="Resetar filtros"
                    >
                      <span className="material-symbols-outlined text-[10px]">rotate_left</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilterMenu(false)}
                    className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-on-surface flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                    title="Fechar"
                  >
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </div>
              </div>

              {/* Lista Vertical de Filtros no Desktop (Mesmo Arredondamento rounded-xl dos botões do topo) */}
              <div className="space-y-0.5">
                {FILTER_OPTIONS.map((opt) => {
                  const isActive = filterMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        navigator.vibrate?.(10);
                        setFilterMode(opt.id);
                      }}
                      className={`w-full px-2 py-1 rounded-xl text-[10.5px] font-medium flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/60 text-on-surface-variant hover:text-on-surface border border-outline-variant/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs opacity-80">{opt.icon}</span>
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isActive && (
                        <span className="material-symbols-outlined text-xs text-primary shrink-0">check</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sliders Desktop (Ultra-Compactos) */}
              {filterMode === 'custom' && (
                <div className="mt-1.5 pt-1.5 border-t border-outline-variant/20 space-y-1 text-xs animate-fadeIn px-0.5">
                  <div>
                    <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] opacity-70">wb_sunny</span>
                        Brilho
                      </span>
                      <span className="font-mono text-on-surface-variant font-medium">{customFilters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={customFilters.brightness}
                      onChange={(e) => setCustomFilters(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                      className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] opacity-70">contrast</span>
                        Contraste
                      </span>
                      <span className="font-mono text-on-surface-variant font-medium">{customFilters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={customFilters.contrast}
                      onChange={(e) => setCustomFilters(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                      className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[8.5px] font-label-caps text-outline uppercase tracking-wider mb-0.5 font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] opacity-70">palette</span>
                        Saturação
                      </span>
                      <span className="font-mono text-on-surface-variant font-medium">{customFilters.saturate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={customFilters.saturate}
                      onChange={(e) => setCustomFilters(prev => ({ ...prev, saturate: Number(e.target.value) }))}
                      className="w-full accent-primary h-1 bg-surface-container-highest/60 rounded-md appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE INLINE PANEL (block sm:hidden) - Renderizado FORA da janela do vídeo */}
        {showFilterMenu && status === 'online' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="block sm:hidden relative mt-3 bg-[#181c1f]/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-3 animate-fadeIn shadow-lg pointer-events-auto"
          >
            {/* Header Mobile */}
            <div className="flex items-center justify-between mb-2.5 pb-1 px-0.5">
              <span className="font-label-caps text-[9px] text-outline uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Filtros
              </span>

              <div className="flex items-center gap-1.5">
                {filterMode !== 'normal' && (
                  <button
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode('normal');
                      setCustomFilters({ brightness: 100, contrast: 100, saturate: 100 });
                    }}
                    className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-primary flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                    title="Resetar filtros"
                    aria-label="Resetar filtros"
                  >
                    <span className="material-symbols-outlined text-[10px]">rotate_left</span>
                  </button>
                )}
                <button
                  onClick={() => setShowFilterMenu(false)}
                  className="w-4.5 h-4.5 rounded-lg bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-outline hover:text-on-surface flex items-center justify-center transition-all border border-outline-variant/20 active:scale-95"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            </div>

            {/* Pílulas de Filtro Horizontais Mobile (Com limite simétrico à esquerda e à direita) */}
            <div className="-mx-2.5 px-2.5 flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar snap-x snap-mandatory scroll-px-2.5">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filterMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setFilterMode(opt.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 snap-start transition-all touch-target-min ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-surface-container-highest/40 hover:bg-surface-container-highest/80 text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs opacity-80">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sliders Mobile (Layout Empilhado sem Sobreposição de Texto) */}
            {filterMode === 'custom' && (
              <div className="mt-2 pt-2 border-t border-outline-variant/20 space-y-2.5 text-xs animate-fadeIn px-0.5">
                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">wb_sunny</span>
                      Brilho
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.brightness}
                    onChange={(e) => setCustomFilters(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">contrast</span>
                      Contraste
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={customFilters.contrast}
                    onChange={(e) => setCustomFilters(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[9px] font-label-caps text-outline uppercase tracking-wider mb-1 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs opacity-70">palette</span>
                      Saturação
                    </span>
                    <span className="font-mono text-on-surface-variant font-medium">{customFilters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={customFilters.saturate}
                    onChange={(e) => setCustomFilters(prev => ({ ...prev, saturate: Number(e.target.value) }))}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest/60 rounded-lg appearance-none cursor-pointer touch-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
            if (showControls && !showFilterMenu) {
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
                  setShowFilterMenu(prev => !prev);
                  resetControlsTimeout();
                }}
                title="Filtros de Cor da Câmera"
                aria-label="Filtros de Cor"
                className={`w-9 h-9 rounded-xl backdrop-blur-xl active:scale-90 border flex items-center justify-center transition-all shadow-lg ${
                  filterMode !== 'normal' || showFilterMenu
                    ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(90,240,157,0.2)]'
                    : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                }`}
              >
                <span className="material-symbols-outlined text-sm">palette</span>
              </button>

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

          {/* Painel de Filtros Flutuante em Tela Cheia */}
          {showControls && renderFilterMenuPanel(true)}

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
                  filter: getCssFilter(filterMode, customFilters),
                  willChange: filterMode !== 'normal' ? 'filter, transform' : 'transform',
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
