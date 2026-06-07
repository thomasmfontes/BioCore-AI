import React from 'react';

type Tab = 'cultivo' | 'telemetria' | 'controle' | 'historico';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const tabs = [
    { id: 'cultivo' as Tab, icon: 'potted_plant', label: 'Cultivo' },
    { id: 'telemetria' as Tab, icon: 'monitoring', label: 'Monitoramento' },
    { id: 'controle' as Tab, icon: 'tune', label: 'Controles' },
    { id: 'historico' as Tab, icon: 'history', label: 'Histórico' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 h-[68px] clay-card-dark rounded-t-3xl rounded-b-none flex justify-around items-center px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            title={tab.label}
            className="relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200 active:scale-95 outline-none focus:outline-none"
          >
            {/* Background Clay Pill (Cápsula centralizada menor para um visual sofisticado e leve) */}
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-8 rounded-full transition-all duration-300
                ${isActive
                  ? 'clay-card-primary opacity-100 scale-100'
                  : 'bg-transparent border border-transparent opacity-0 scale-90'
                }
              `}
            />

            {/* Ícone */}
            <span
              className={`material-symbols-outlined text-[24px] z-10 transition-colors duration-300
                ${isActive
                  ? 'text-[#00210f]'
                  : 'text-outline hover:text-primary-fixed-dim'
                }
              `}
              style={{ fontVariationSettings: `'FILL' ${isActive ? '1' : '0'}` }}
            >
              {tab.icon}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
