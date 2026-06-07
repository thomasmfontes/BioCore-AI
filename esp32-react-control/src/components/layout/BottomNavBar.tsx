import React from 'react';

type Tab = 'cultivo' | 'telemetria' | 'controle' | 'historico';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 h-[68px] clay-card-dark rounded-3xl flex justify-around items-center px-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
      {/* Cultivo Tab */}
      <button
        onClick={() => setActiveTab('cultivo')}
        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90
          ${activeTab === 'cultivo'
            ? 'clay-btn-primary shadow-[0_4px_12px_rgba(90,240,157,0.35)]'
            : 'text-outline hover:text-primary-fixed-dim hover:bg-white/5'
          }
        `}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${activeTab === 'cultivo' ? '1' : '0'}` }}>
          potted_plant
        </span>
      </button>

      {/* Telemetria (Monitoring) Tab */}
      <button
        onClick={() => setActiveTab('telemetria')}
        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90
          ${activeTab === 'telemetria'
            ? 'clay-btn-primary shadow-[0_4px_12px_rgba(90,240,157,0.35)]'
            : 'text-outline hover:text-primary-fixed-dim hover:bg-white/5'
          }
        `}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${activeTab === 'telemetria' ? '1' : '0'}` }}>
          monitoring
        </span>
      </button>

      {/* Controle Tab */}
      <button
        onClick={() => setActiveTab('controle')}
        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90
          ${activeTab === 'controle'
            ? 'clay-btn-primary shadow-[0_4px_12px_rgba(90,240,157,0.35)]'
            : 'text-outline hover:text-primary-fixed-dim hover:bg-white/5'
          }
        `}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${activeTab === 'controle' ? '1' : '0'}` }}>
          tune
        </span>
      </button>

      {/* Logs/Events Tab */}
      <button
        onClick={() => setActiveTab('historico')}
        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90
          ${activeTab === 'historico'
            ? 'clay-btn-primary shadow-[0_4px_12px_rgba(90,240,157,0.35)]'
            : 'text-outline hover:text-primary-fixed-dim hover:bg-white/5'
          }
        `}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${activeTab === 'historico' ? '1' : '0'}` }}>
          history
        </span>
      </button>
    </nav>
  );
}
