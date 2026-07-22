import React from 'react';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface CultivoTabProps {
  hortalica: DadosPlanta;
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: any;
  setShowSelector: (show: boolean) => void;
  onNavigateToCamera?: () => void;
}

export function CultivoTab({ hortalica, smartMode, setSmartMode, sensors, setShowSelector, onNavigateToCamera }: CultivoTabProps) {
  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Active Crop Section */}
      <section className="clay-card-dark rounded-3xl overflow-hidden">
        <div className="relative h-56 w-full bg-surface-container-highest">
          <img
            alt={hortalica.nome}
            className="w-full h-full object-cover opacity-90"
            src={hortalica.imagemUrl}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2226] via-black/20 to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <span className="font-label-caps text-[10px] bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg uppercase tracking-wider">
              {smartMode ? 'Cultivo Inteligente' : 'Controle Manual'}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <button
              onClick={() => setShowSelector(true)}
              className="flex items-center gap-2 text-left bg-black/50 backdrop-blur-md hover:bg-black/70 active:scale-95 transition-all px-4 py-2 rounded-2xl border border-white/20 min-h-[44px]"
            >
              <span className="text-xl">{hortalica.emoji}</span>
              <span className="font-title-lg text-lg text-white font-bold">{hortalica.nome}</span>
              <span className="material-symbols-outlined text-white/70">expand_more</span>
            </button>
          </div>
        </div>
      </section>

      {/* Smart Mode Card */}
      <section 
        onClick={() => {
          navigator.vibrate?.([10, 30, 10]);
          setSmartMode(!smartMode);
        }}
        className={`p-4 relative overflow-hidden select-none transition-all duration-300 active:scale-[0.98] rounded-3xl cursor-pointer clay-card-dark border
          ${smartMode 
            ? 'border-primary/30 shadow-[0_4px_16px_rgba(90,240,157,0.08)]' 
            : 'border-transparent'
          }
        `}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">bolt</span>
            <h3 className={`font-title-md text-base font-bold transition-colors duration-300 ${smartMode ? 'text-primary' : 'text-on-surface'}`}>BioCore AI</h3>
          </div>
          {/* Switch Toggle */}
          <div className="relative inline-flex items-center touch-target-min">
            <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
              ${smartMode 
                ? 'bg-primary/20 border-primary/40' 
                : 'bg-surface-container-highest border-outline'
              }
            `}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                ${smartMode 
                  ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' 
                  : 'bg-outline left-0.5'
                }
              `}></div>
            </div>
          </div>
        </div>

        <div>
          {smartMode ? (
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              A inteligência autônoma está ativa. O BioCore AI cuida da luz, água e nutrientes do seu cultivo para você não se preocupar.
            </p>
          ) : (
            <p className="text-xs text-error mb-4 leading-relaxed font-semibold">
              O modo autônomo está desativado. Você precisa controlar tudo manualmente.
            </p>
          )}

          {smartMode && (
            <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Cultivo Perfeito</p>
                  <p className="text-[10px] text-on-surface-variant">Ambiente 100% otimizado</p>
                </div>
              </div>
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Simplified Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Umidade Card */}
        <div className="clay-card-dark p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-400 text-lg shadow-blue-400/20 drop-shadow-md">water_drop</span>
            <span className="font-label-caps text-[10px] text-outline uppercase font-semibold">Solo</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-sm text-xl font-bold text-on-surface">{sensors?.u_solo ?? 65}</span>
              <span className="font-body-sm text-xs text-outline">%</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Meta: {hortalica.u_solo}%
            </p>
          </div>
        </div>

        {/* Luz Card */}
        <div className="clay-card-dark p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-lg shadow-yellow-400/20 drop-shadow-md">light_mode</span>
            <span className="font-label-caps text-[10px] text-outline uppercase font-semibold">Luz Diária</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-sm text-xl font-bold text-on-surface">{hortalica.fotoperiodo}</span>
              <span className="font-body-sm text-xs text-outline">h</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Ciclo ideal automático
            </p>
          </div>
        </div>
      </div>

      {/* Live Camera Shortcut Card */}
      {onNavigateToCamera && (
        <section 
          onClick={onNavigateToCamera}
          className="clay-card-dark p-4 rounded-3xl flex items-center justify-between cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-title-md text-sm font-bold text-on-surface">Câmera da Planta</h4>
              </div>
              <p className="text-xs text-on-surface-variant">Visualizar transmissão ao vivo</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline">
            chevron_right
          </span>
        </section>
      )}
    </div>
  );
}
