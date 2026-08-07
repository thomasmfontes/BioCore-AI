import React, { useState, useRef, useEffect } from 'react';

type Tab = 'cultivo' | 'telemetria' | 'camera' | 'controle' | 'historico';

interface TopAppBarProps {
  status: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  voiceEnabled?: boolean;
  isSpeaking?: boolean;
  toggleVoice?: () => void;
  speakSummary?: () => void;
  resetWifi?: () => void;
}

export function TopAppBar({ 
  status, 
  activeTab, 
  setActiveTab,
  voiceEnabled = true,
  isSpeaking = false,
  toggleVoice,
  speakSummary,
  resetWifi,
}: TopAppBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'confirmReset'>('main');
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar o menu ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setMenuView('main');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return { icon: 'cloud_done', color: 'text-primary', label: 'ONLINE' };
      case 'connecting':
        return { icon: 'cloud_sync', color: 'text-amber-400 animate-pulse', label: 'CONECTANDO...' };
      default:
        return { icon: 'cloud_off', color: 'text-error', label: 'OFFLINE' };
    }
  };

  const indicator = getStatusIndicator();

  const tabs = [
    { id: 'cultivo' as Tab, label: 'Cultivo' },
    { id: 'telemetria' as Tab, label: 'Telemetria' },
    { id: 'camera' as Tab, label: 'Câmera' },
    { id: 'controle' as Tab, label: 'Controles' },
    { id: 'historico' as Tab, label: 'Histórico' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-[60] h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] clay-card-dark rounded-b-3xl rounded-t-none flex items-center px-margin-mobile md:px-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2">
        <img src="/biocore-logo.png" alt="BioCore AI Logo" className="h-10 w-10 object-contain" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
          BIOCORE <span className="text-primary">AI</span>
        </h1>
      </div>

      {/* Desktop Navigation — absolutely centered */}
      <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative h-9 px-4 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 outline-none focus:outline-none font-label-caps text-xs tracking-widest uppercase"
            >
              {/* Background Clay Pill */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-300
                  ${isActive
                    ? 'clay-card-primary opacity-100 scale-100 shadow-[0_4px_10px_rgba(44,184,116,0.15)]'
                    : 'bg-transparent border border-transparent opacity-0 scale-95'
                  }
                `}
              />
              {/* Text */}
              <span
                className={`relative z-10 transition-colors duration-300
                  ${isActive ? 'text-[#00210f] font-bold' : 'text-outline hover:text-primary-fixed-dim'}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Canto Direito: Status + Botão de Opções Popover */}
      <div className="flex items-center gap-2 ml-auto relative" ref={menuRef}>
        {/* Status Discreto */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/40 border border-white/5">
          <span className={`material-symbols-outlined text-base ${indicator.color}`}>
            {indicator.icon}
          </span>
          <span className="text-[10px] font-mono tracking-wider font-semibold opacity-70 hidden xs:inline">
            {indicator.label}
          </span>
        </div>

        {/* Botão de Três Pontinhos (More Vert) */}
        <button
          onClick={() => {
            navigator.vibrate?.([10, 20]);
            if (showMenu) {
              setShowMenu(false);
              setMenuView('main');
            } else {
              setShowMenu(true);
            }
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors outline-none active:scale-95 ${
            showMenu ? 'bg-white/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
          }`}
          title="Mais Opções"
        >
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>

        {/* Popup Popover Flutuante */}
        {showMenu && (
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-11 w-64 bg-[#16191c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_16px_36px_rgba(0,0,0,0.8)] animate-scaleUp z-[70] select-none"
          >
            {menuView === 'main' ? (
              <div className="space-y-1">
                {/* Linha 1: Voz da Planta */}
                {toggleVoice && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.vibrate?.([10, 20]);
                      if (isSpeaking) {
                        speakSummary?.();
                      } else {
                        toggleVoice();
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-150 flex items-center justify-between text-left outline-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 pointer-events-none">
                      <span className={`material-symbols-outlined text-lg ${
                        isSpeaking ? 'text-primary animate-pulse' : voiceEnabled ? 'text-primary' : 'text-outline'
                      }`}>
                        {isSpeaking ? 'record_voice_over' : voiceEnabled ? 'volume_up' : 'volume_off'}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">Voz da Planta</span>
                    </div>

                    {/* Switch Pill Flex */}
                    <div className={`w-8 h-4.5 rounded-full border p-0.5 flex items-center transition-colors pointer-events-none ${
                      voiceEnabled 
                        ? 'bg-primary/20 border-primary/40 justify-end' 
                        : 'bg-white/5 border-white/10 justify-start'
                    }`}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all ${
                        voiceEnabled 
                          ? 'bg-primary shadow-[0_0_6px_#5af09d]' 
                          : 'bg-outline/60'
                      }`} />
                    </div>
                  </button>
                )}

                {/* Divisória fina */}
                <div className="h-[1px] bg-white/5 mx-2" />

                {/* Linha 2: Redefinir Wi-Fi */}
                {resetWifi && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.vibrate?.([10, 20]);
                      setMenuView('confirmReset');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-150 flex items-center justify-between text-left outline-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 pointer-events-none">
                      <span className="material-symbols-outlined text-lg text-amber-400">wifi_find</span>
                      <span className="text-xs font-semibold text-on-surface">Redefinir Wi-Fi</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-outline group-hover:text-on-surface transition-colors pointer-events-none">
                      chevron_right
                    </span>
                  </button>
                )}
              </div>
            ) : (
              /* Popup de Confirmação Embutido no Popover */
              <div className="p-2 space-y-3 animate-fadeIn">
                <div className="pb-1 border-b border-white/5">
                  <span className="text-xs font-bold text-on-surface block">Redefinir Wi-Fi</span>
                </div>

                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  O <b>BioCore AI</b> apagará a rede atual e reiniciará no <b>Modo Setup</b> para você conectar pelo celular.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuView('main');
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-on-surface hover:bg-white/10 active:scale-95 transition-all outline-none cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      setMenuView('main');
                      navigator.vibrate?.([20, 50, 20]);
                      resetWifi?.();
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all outline-none cursor-pointer"
                  >
                    Redefinir
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

