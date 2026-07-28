import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  CapturedPhoto,
  getLocalPhotos,
  deleteLocalPhoto,
  triggerDeviceDownload,
  sharePhotoFile,
} from '../../utils/localPhotosDB';

export function LocalPhotosGallery() {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Controle de arrasto com o mouse para o Modo Fila (Carrossel no Card)
  const reelRef = useRef<HTMLDivElement | null>(null);
  const isReelMouseDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startScrollLeftRef = useRef<number>(0);
  const isDraggingReelRef = useRef<boolean>(false);

  const fetchPhotos = async () => {
    setLoading(true);
    const data = await getLocalPhotos();
    setPhotos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();

    const handlePhotoCaptured = () => {
      fetchPhotos();
    };

    window.addEventListener('biocore-photo-captured', handlePhotoCaptured);
    return () => {
      window.removeEventListener('biocore-photo-captured', handlePhotoCaptured);
    };
  }, []);

  const handleToggleViewMode = (newMode: 'carousel' | 'grid') => {
    if (newMode === viewMode) return;
    navigator.vibrate?.(8);
    setViewMode(newMode);
  };

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const prevSelectedIndexRef = useRef<number | null>(null);

  // Ao abrir o modal, posiciona INSTANTANEAMENTE (0ms) na foto clicada. Nas setas, desliza suavemente (smooth).
  useEffect(() => {
    if (selectedIndex !== null && sliderRef.current) {
      isProgrammaticScroll.current = true;
      const width = sliderRef.current.clientWidth;
      if (width > 0) {
        const isInitialOpen = prevSelectedIndexRef.current === null;
        sliderRef.current.scrollTo({
          left: selectedIndex * width,
          behavior: isInitialOpen ? 'instant' : 'smooth',
        });
      }
      const timer = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 350);
      prevSelectedIndexRef.current = selectedIndex;
      return () => clearTimeout(timer);
    } else {
      prevSelectedIndexRef.current = null;
    }
  }, [selectedIndex]);

  // Sincroniza o índice selecionado no mobile durante o touch swipe no modal
  const handleSliderScroll = () => {
    if (!sliderRef.current || isProgrammaticScroll.current) return;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, clientWidth } = sliderRef.current;
      if (clientWidth <= 0) return;
      const newIdx = Math.round(scrollLeft / clientWidth);
      if (newIdx !== selectedIndex && newIdx >= 0 && newIdx < photos.length) {
        isProgrammaticScroll.current = true;
        setSelectedIndex(newIdx);
        setIsDeleting(false);
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 50);
      }
    }, 40);
  };

  // Manipulação de clique e arrasto contínuo em cima de qualquer foto no Modo Fila (Desktop)
  const handleReelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reelRef.current) return;
    // Previne a seleção nativa do navegador para permitir arrasto direto sobre as fotos
    e.preventDefault();
    isReelMouseDownRef.current = true;
    isDraggingReelRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = reelRef.current.scrollLeft;

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isReelMouseDownRef.current || !reelRef.current) return;
      const deltaX = moveEvent.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        isDraggingReelRef.current = true;
      }
      reelRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
    };

    const onGlobalMouseUp = () => {
      isReelMouseDownRef.current = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      setTimeout(() => {
        isDraggingReelRef.current = false;
      }, 80);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const handleDeleteCurrent = async () => {
    if (selectedIndex === null || !selectedPhoto || deletingPhotoId !== null) return;
    navigator.vibrate?.([15, 30]);

    // 1. Ativa a animação visual de exclusão (shrink + fade + brilho vermelho)
    setDeletingPhotoId(selectedPhoto.id);

    // 2. Aguarda a conclusão da animação cinematográfica (550ms) para efetivar a remoção do banco
    setTimeout(async () => {
      await deleteLocalPhoto(selectedPhoto.id);
      const remaining = photos.filter((_, idx) => idx !== selectedIndex);
      setPhotos(remaining);
      setIsDeleting(false);
      setDeletingPhotoId(null);

      if (remaining.length === 0) {
        setSelectedIndex(null);
      } else if (selectedIndex >= remaining.length) {
        setSelectedIndex(remaining.length - 1);
      }
    }, 580);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null || selectedIndex <= 0 || !sliderRef.current) return;
    navigator.vibrate?.(10);
    setIsDeleting(false);
    const newIdx = selectedIndex - 1;
    const width = sliderRef.current.clientWidth;
    isProgrammaticScroll.current = true;
    setSelectedIndex(newIdx);
    sliderRef.current.scrollTo({ left: newIdx * width, behavior: 'smooth' });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 300);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex === null || selectedIndex >= photos.length - 1 || !sliderRef.current) return;
    navigator.vibrate?.(10);
    setIsDeleting(false);
    const newIdx = selectedIndex + 1;
    const width = sliderRef.current.clientWidth;
    isProgrammaticScroll.current = true;
    setSelectedIndex(newIdx);
    sliderRef.current.scrollTo({ left: newIdx * width, behavior: 'smooth' });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 300);
  };

  const handleDownload = (photo: CapturedPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.vibrate?.(15);
    triggerDeviceDownload(photo.dataUrl, photo.filename);
  };

  const handleShare = async (photo: CapturedPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.vibrate?.(15);
    const shared = await sharePhotoFile(photo.dataUrl, photo.filename);
    if (!shared) {
      triggerDeviceDownload(photo.dataUrl, photo.filename);
    }
  };

  // Bloqueio de scroll no body quando o modal estiver aberto
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [selectedIndex]);

  // Suporte às setas do teclado (← e →) no Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null || !sliderRef.current) return;
      const width = sliderRef.current.clientWidth;
      if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        isProgrammaticScroll.current = true;
        const newIdx = selectedIndex - 1;
        setSelectedIndex(newIdx);
        sliderRef.current.scrollTo({ left: newIdx * width, behavior: 'smooth' });
        setTimeout(() => { isProgrammaticScroll.current = false; }, 300);
      } else if (e.key === 'ArrowRight' && selectedIndex < photos.length - 1) {
        isProgrammaticScroll.current = true;
        const newIdx = selectedIndex + 1;
        setSelectedIndex(newIdx);
        sliderRef.current.scrollTo({ left: newIdx * width, behavior: 'smooth' });
        setTimeout(() => { isProgrammaticScroll.current = false; }, 300);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
        setIsDeleting(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  return (
    <section className="clay-card-dark rounded-3xl p-4 sm:p-5 animate-fadeIn space-y-3">
      {/* Header do Card no Padrão do Sistema */}
      <header className="flex items-center justify-between pb-2.5 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">photo_library</span>
          <h3 className="font-label-caps text-xs text-on-surface font-bold uppercase tracking-wider">
            Galeria de Fotos
          </h3>
        </div>

        {photos.length > 0 && (
          <div className="mechanical-track rounded-full p-1 border border-outline-variant relative flex items-center gap-0.5">
            <button
              onClick={() => handleToggleViewMode('carousel')}
              title="Modo Fila"
              aria-label="Modo Fila"
              className="relative px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 outline-none focus:outline-none flex items-center justify-center min-h-[32px]"
            >
              <div
                className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
                  viewMode === 'carousel'
                    ? 'clay-card-primary opacity-100 scale-100 shadow-[0_4px_10px_rgba(44,184,116,0.15)]'
                    : 'bg-transparent border border-transparent opacity-0 scale-90'
                }`}
              />
              <span
                className={`material-symbols-outlined text-sm relative z-10 transition-colors duration-300 ${
                  viewMode === 'carousel' ? 'text-[#00210f] font-bold' : 'text-outline'
                }`}
              >
                view_carousel
              </span>
            </button>

            <button
              onClick={() => handleToggleViewMode('grid')}
              title="Modo Grade"
              aria-label="Modo Grade"
              className="relative px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 outline-none focus:outline-none flex items-center justify-center min-h-[32px]"
            >
              <div
                className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'clay-card-primary opacity-100 scale-100 shadow-[0_4px_10px_rgba(44,184,116,0.15)]'
                    : 'bg-transparent border border-transparent opacity-0 scale-90'
                }`}
              />
              <span
                className={`material-symbols-outlined text-sm relative z-10 transition-colors duration-300 ${
                  viewMode === 'grid' ? 'text-[#00210f] font-bold' : 'text-outline'
                }`}
              >
                grid_view
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Conteúdo da Galeria no Dashboard */}
      {loading ? (
        <div className="py-6 text-center text-xs text-outline font-mono animate-pulse">
          Carregando fotos...
        </div>
      ) : photos.length === 0 ? (
        /* Empty State */
        <div className="py-6 text-center px-4 rounded-2xl bg-surface-container-lowest/20 border border-dashed border-outline-variant/25">
          <span className="material-symbols-outlined text-2xl text-outline/40 mb-1 block">
            photo_camera
          </span>
          <p className="text-xs text-on-surface-variant font-bold">Sua galeria está vazia</p>
          <p className="text-[10px] text-outline mt-0.5">
            Tire uma foto na câmera para registrar a evolução da sua planta.
          </p>
        </div>
      ) : viewMode === 'carousel' ? (
        /* MODO FILA HORIZONTAL DESLIZANTE (COM ARRASTE POR MOUSE NO DESKTOP) */
        <div
          ref={reelRef}
          onMouseDown={handleReelMouseDown}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 px-0.5 no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          {photos.map((photo, idx) => (
            <div
              key={`carousel-${photo.id}`}
              onClick={() => {
                if (!isDraggingReelRef.current) {
                  setSelectedIndex(idx);
                }
              }}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="animate-accordion-item group relative shrink-0 w-36 sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-outline-variant/20 cursor-pointer active:scale-95 hover:scale-[1.02] hover:border-primary/40 transition-all shadow-md select-none"
            >
              <img
                src={photo.dataUrl}
                alt=""
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end pointer-events-none">
                <span className="text-[9px] font-mono text-white font-bold drop-shadow-sm truncate">
                  {photo.formattedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODO GRADE LIMPA */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
          {photos.map((photo, idx) => (
            <div
              key={`grid-${photo.id}`}
              onClick={() => setSelectedIndex(idx)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="animate-accordion-item group relative rounded-2xl overflow-hidden bg-black/60 border border-outline-variant/20 aspect-[4/3] cursor-pointer active:scale-95 hover:scale-[1.02] hover:border-primary/40 transition-all shadow-md"
            >
              <img
                src={photo.dataUrl}
                alt=""
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end pointer-events-none">
                <span className="text-[9px] font-mono text-white font-bold drop-shadow-sm truncate">
                  {photo.formattedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer com Contador de Fotos na Parte de Baixo */}
      {photos.length > 0 && (
        <footer className="pt-2 border-t border-outline-variant/20 flex items-center justify-end">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-highest/80 text-on-surface font-mono font-bold border border-outline-variant/20">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </span>
        </footer>
      )}

      {/* MODAL DE VISUALIZAÇÃO */}
      {selectedPhoto !== null && selectedIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-[#111417]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn select-none touch-none"
            onClick={() => {
              setSelectedIndex(null);
              setIsDeleting(false);
            }}
          >
            {/* Header no Padrão do Sistema */}
            <div
              className="w-full max-w-4xl mx-auto clay-card-dark rounded-2xl px-4 py-2.5 flex items-center justify-between z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                <span>{selectedPhoto.formattedDate}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-bold">
                  {selectedIndex + 1} / {photos.length}
                </span>

                <button
                  onClick={() => {
                    setSelectedIndex(null);
                    setIsDeleting(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:bg-outline/20 active:scale-95 text-on-surface flex items-center justify-center transition-all"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* Viewport da Foto (Navegação por cliques de seta ou toque no celular) */}
            <div
              className="relative w-full max-w-5xl mx-auto flex-1 flex items-center justify-center my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seta Esquerda (Apenas no Desktop: hidden md:flex) */}
              {selectedIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="hidden md:flex absolute left-4 z-40 w-10 h-10 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 text-on-surface hover:bg-outline/20 active:scale-90 items-center justify-center transition-all shadow-xl select-none"
                  title="Foto anterior"
                >
                  <span className="material-symbols-outlined text-xl leading-none flex items-center justify-center -ml-0.5">
                    chevron_left
                  </span>
                </button>
              )}

              {/* Container de Imagens (Abertura instantânea e transição por setas ou touch swipe) */}
              <div
                ref={sliderRef}
                onScroll={handleSliderScroll}
                className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar py-3 touch-pan-x select-none md:pointer-events-none"
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="w-full h-full min-w-full shrink-0 snap-center flex items-center justify-center px-2 select-none"
                  >
                    <img
                      src={photo.dataUrl}
                      alt=""
                      draggable={false}
                      className={`max-h-[75vh] max-w-full object-contain rounded-2xl border border-outline-variant/20 shadow-2xl pointer-events-none select-none ${
                        deletingPhotoId === photo.id
                          ? 'animate-photo-delete'
                          : 'scale-100 opacity-100'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Seta Direita (Apenas no Desktop: hidden md:flex) */}
              {selectedIndex < photos.length - 1 && (
                <button
                  onClick={handleNext}
                  className="hidden md:flex absolute right-4 z-40 w-10 h-10 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 text-on-surface hover:bg-outline/20 active:scale-90 items-center justify-center transition-all shadow-xl select-none"
                  title="Próxima foto"
                >
                  <span className="material-symbols-outlined text-xl leading-none flex items-center justify-center -mr-0.5">
                    chevron_right
                  </span>
                </button>
              )}
            </div>

            {/* Barra de Ações Necessárias no Padrão do Sistema */}
            <div
              className="w-full max-w-md mx-auto clay-card-dark rounded-2xl px-4 py-3 flex items-center justify-between gap-3 z-30 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => handleDownload(selectedPhoto, e)}
                className="clay-btn-primary flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Baixar Foto
              </button>

              {'share' in navigator && (
                <button
                  onClick={(e) => handleShare(selectedPhoto, e)}
                  className="w-9 h-9 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:bg-outline/20 active:scale-90 text-on-surface flex items-center justify-center transition-all"
                  title="Compartilhar"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              )}

              {/* Botão de Exclusão com Balãozinho Perfeitamente Centralizado */}
              <div className="relative inline-flex flex-col items-center">
                {/* Balãozinho Flutuante Centralizado no Eixo X = 50% */}
                {isDeleting && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <div className="animate-tooltipPop flex flex-col items-center">
                      <div className="relative bg-error text-white w-9 h-9 rounded-xl shadow-[0_10px_25px_rgba(255,84,73,0.45)] flex items-center justify-center border border-white/20">
                        <button
                          onClick={handleDeleteCurrent}
                          className="w-full h-full flex items-center justify-center active:scale-90 hover:scale-105 transition-all"
                          title="Confirmar exclusão da foto"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>

                        {/* Triângulo / Pontinha do Balãozinho Apontando Centralizada no Eixo do Botão */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-error" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Principal: Lixo -> Transforma em X para Cancelar */}
                <button
                  onClick={() => {
                    navigator.vibrate?.(10);
                    setIsDeleting(!isDeleting);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                    isDeleting
                      ? 'bg-surface-container-lowest border border-outline-variant/30 hover:bg-outline/20 text-on-surface'
                      : 'bg-error/10 hover:bg-error/20 border border-error/30 text-error'
                  }`}
                  title={isDeleting ? 'Cancelar' : 'Excluir foto'}
                >
                  <span className="material-symbols-outlined text-sm transition-transform duration-200">
                    {isDeleting ? 'close' : 'delete'}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
