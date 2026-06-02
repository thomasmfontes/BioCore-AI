import React from 'react';

interface TopAppBarProps {
  status: string;
}

export function TopAppBar({ status }: TopAppBarProps) {
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
    <header className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface-container-low flex justify-between items-center h-16 px-margin-mobile">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-2xl">biotech</span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">BIOCORE AI</h1>
      </div>
      <div className="flex items-center gap-3">
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
