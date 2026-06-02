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

  return (
    <header className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface-container-low flex items-center h-16 px-margin-mobile md:px-8">
      <div className="flex items-center gap-2">
        <img src="/biocore-logo.png" alt="BioCore AI Logo" className="h-10 w-10 object-contain" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">BIOCORE <span className="text-primary">AI</span></h1>
      </div>

      {/* Desktop Navigation — absolutely centered */}
      <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <button onClick={() => setActiveTab('cultivo')} className={`font-label-caps text-xs tracking-widest uppercase transition-all hover:text-primary ${activeTab === 'cultivo' ? 'text-primary font-bold' : 'text-outline'}`}>Cultivo</button>
        <button onClick={() => setActiveTab('telemetria')} className={`font-label-caps text-xs tracking-widest uppercase transition-all hover:text-primary ${activeTab === 'telemetria' ? 'text-primary font-bold' : 'text-outline'}`}>Telemetria</button>
        <button onClick={() => setActiveTab('controle')} className={`font-label-caps text-xs tracking-widest uppercase transition-all hover:text-primary ${activeTab === 'controle' ? 'text-primary font-bold' : 'text-outline'}`}>Controles</button>
        <button onClick={() => setActiveTab('historico')} className={`font-label-caps text-xs tracking-widest uppercase transition-all hover:text-primary ${activeTab === 'historico' ? 'text-primary font-bold' : 'text-outline'}`}>Histórico</button>
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
