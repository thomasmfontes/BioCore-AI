import React from 'react';

type Tab = 'cultivo' | 'telemetria' | 'controle' | 'historico';

interface TopAppBarProps {
  status: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function TopAppBar({ status, activeTab, setActiveTab }: TopAppBarProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return { icon: 'cloud_done', color: 'text-primary' };
      case 'connecting':
        return { icon: 'cloud_sync', color: 'text-secondary animate-pulse' };
      default:
        return { icon: 'cloud_off', color: 'text-error' };
    }
  };

  const indicator = getStatusIndicator();

  const tabs = [
    { id: 'cultivo' as Tab, label: 'Cultivo' },
    { id: 'telemetria' as Tab, label: 'Telemetria' },
    { id: 'controle' as Tab, label: 'Controles' },
    { id: 'historico' as Tab, label: 'Histórico' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 clay-card-dark rounded-b-3xl rounded-t-none flex items-center px-margin-mobile md:px-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
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

      <div className="flex items-center gap-3 ml-auto">
        <span className={`text-xs font-mono tracking-wider uppercase opacity-60 hidden xs:inline`}>
          {status === 'connected' ? 'ONLINE' : status === 'connecting' ? 'CONECTANDO...' : 'DESCONECTADO'}
        </span>
        <span className={`material-symbols-outlined text-2xl ${indicator.color}`}>
          {indicator.icon}
        </span>
      </div>
    </header>
  );
}
