import React from 'react';

type Tab = 'cultivo' | 'telemetria' | 'controle' | 'historico';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 w-full z-50 h-[64px] border-t border-outline-variant bg-surface-container shadow-[0_-4px_10px_rgba(0,0,0,0.3)] flex justify-around items-center px-4">
      {/* Cultivo Tab */}
      <button
        onClick={() => setActiveTab('cultivo')}
        className={`flex flex-col items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-xl transition-all duration-100 active:scale-90
          ${activeTab === 'cultivo'
            ? 'text-primary drop-shadow-[0_0_8px_rgba(90,240,157,0.5)] bg-primary-container/10'
            : 'text-outline hover:text-primary-fixed-dim'
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
        className={`flex flex-col items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-xl transition-all duration-100 active:scale-90
          ${activeTab === 'telemetria'
            ? 'text-primary drop-shadow-[0_0_8px_rgba(90,240,157,0.5)] bg-primary-container/10'
            : 'text-outline hover:text-primary-fixed-dim'
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
        className={`flex flex-col items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-xl transition-all duration-100 active:scale-90
          ${activeTab === 'controle'
            ? 'text-primary drop-shadow-[0_0_8px_rgba(90,240,157,0.5)] bg-primary-container/10'
            : 'text-outline hover:text-primary-fixed-dim'
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
        className={`flex flex-col items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-xl transition-all duration-100 active:scale-90
          ${activeTab === 'historico'
            ? 'text-primary drop-shadow-[0_0_8px_rgba(90,240,157,0.5)] bg-primary-container/10'
            : 'text-outline hover:text-primary-fixed-dim'
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
