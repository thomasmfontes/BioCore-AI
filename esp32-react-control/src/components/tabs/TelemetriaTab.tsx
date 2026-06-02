import React from 'react';

interface TelemetriaTabProps {
  sensors: any;
  status: string;
}

export function TelemetriaTab({ sensors, status }: TelemetriaTabProps) {
  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Hero Card: SOLO (NPK e Sensores) */}
      <section>
        <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Solo (NPK e Sensores)</span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-mono">
              {sensors ? 'ATURANDO_LIVE' : 'VALORES_MOCK'}
            </span>
          </header>
          
          {/* NPK Values */}
          <div className="grid grid-cols-3 gap-3 py-stack-md">
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Nitrogênio</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">{sensors?.N ?? 45}</span>
                <span className="text-[8px] text-outline">mg/kg</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full bio-glow" style={{ width: `${Math.min(100, ((sensors?.N ?? 45) / 200) * 100)}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Fósforo</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">{sensors?.P ?? 12}</span>
                <span className="text-[8px] text-outline">mg/kg</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full" style={{ width: `${Math.min(100, ((sensors?.P ?? 12) / 100) * 100)}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Potássio</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">{sensors?.K ?? 30}</span>
                <span className="text-[8px] text-outline">mg/kg</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full" style={{ width: `${Math.min(100, ((sensors?.K ?? 30) / 300) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Soil moisture & temperature */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-outline-variant/30 mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
              </div>
              <div>
                <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Umidade do Solo</span>
                <span className="text-base font-bold text-on-surface">{sensors?.u_solo ?? 65}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-secondary text-xl">device_thermostat</span>
              </div>
              <div>
                <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Temperatura Solo</span>
                <span className="text-base font-bold text-on-surface">
                  {sensors?.temp ? `${(sensors.temp - 1.5).toFixed(1)}°C` : '22.8°C'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-primary animate-pulse' : 'bg-outline'}`}></div>
              <span className="font-mono-data text-[10px] text-on-surface-variant">
                {status === 'connected' ? 'Sincronização em tempo real ativa' : 'Reconectando ao broker...'}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-white">info</span>
          </div>
        </div>
      </section>

      {/* Sensors Grid */}
      <section className="space-y-3">
        <header className="flex justify-between items-center">
          <h2 className="font-title-md text-base text-on-surface font-bold uppercase tracking-wide">Sensores de Ambiente</h2>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white">filter_list</span>
        </header>
        <div className="grid grid-cols-1 gap-2.5">
          {/* Temperature Card */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer group active:scale-95">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant group-hover:border-secondary transition-all">
                <span className="material-symbols-outlined text-secondary text-xl">device_thermostat</span>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase font-bold">Temperatura do Ar</p>
                <p className="text-lg font-bold text-on-surface">{sensors?.temp ?? 24}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs text-secondary">Estável</span>
              <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
            </div>
          </div>

          {/* Air Humidity Card */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer group active:scale-95">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant group-hover:border-tertiary transition-all">
                <span className="material-symbols-outlined text-tertiary text-xl">air</span>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline uppercase font-bold">Umidade do Ar</p>
                <p className="text-lg font-bold text-on-surface">{sensors?.u_amb ?? 50}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs text-error">-1.2%</span>
              <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Task Banner */}
      <div className="bg-primary/5 border border-primary/30 rounded-xl p-stack-md flex items-center gap-4">
        <div className="w-10 h-10 rounded-full convex-button flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-background text-xl font-bold">play_arrow</span>
        </div>
        <div className="flex-1">
          <p className="font-label-caps text-[9px] text-primary font-bold">IRRIGAÇÃO AGENDADA</p>
          <p className="text-xs text-on-surface font-medium">Início em 12 minutos - Setor B</p>
        </div>
        <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white text-lg">close</span>
      </div>
    </div>
  );
}
