import React from 'react';

interface TelemetriaTabProps {
  sensors: any;
  status: string;
}

export function TelemetriaTab({ sensors, status }: TelemetriaTabProps) {
  const isLive = status === 'connected' && sensors !== null;
  const isConnecting = status === 'connecting' || (status === 'connected' && sensors === null);

  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Hero Card: SOLO (NPK e Sensores) */}

      <section>
        <div className="clay-card-dark rounded-3xl p-stack-md relative overflow-hidden">
          <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Solo (NPK-TH)</span>
            <span 
              aria-live="polite"
              className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold transition-all ${
                isLive 
                  ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' 
                  : isConnecting
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 animate-pulse'
                  : 'bg-error/10 text-error border-error/20'
              }`}
            >
              {isLive ? 'AO VIVO' : isConnecting ? 'CONECTANDO...' : 'OFFLINE'}
            </span>

          </header>

          
          {/* NPK Values */}
          <div className="grid grid-cols-3 gap-3 py-stack-md">
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Nitrogênio</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">
                  {sensors?.N !== undefined && sensors?.N !== null ? sensors.N : '--'}
                </span>
                {sensors?.N !== undefined && sensors?.N !== null && (
                  <span className="text-[8px] text-outline">mg/kg</span>
                )}
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full bio-glow transition-all duration-500" 
                  style={{ width: sensors?.N !== undefined && sensors?.N !== null ? `${Math.min(100, (sensors.N / 200) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Fósforo</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">
                  {sensors?.P !== undefined && sensors?.P !== null ? sensors.P : '--'}
                </span>
                {sensors?.P !== undefined && sensors?.P !== null && (
                  <span className="text-[8px] text-outline">mg/kg</span>
                )}
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-500" 
                  style={{ width: sensors?.P !== undefined && sensors?.P !== null ? `${Math.min(100, (sensors.P / 100) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col border-l border-outline-variant pl-3">
              <span className="font-label-caps text-[9px] text-outline mb-1 uppercase font-bold">Potássio</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-on-surface">
                  {sensors?.K !== undefined && sensors?.K !== null ? sensors.K : '--'}
                </span>
                {sensors?.K !== undefined && sensors?.K !== null && (
                  <span className="text-[8px] text-outline">mg/kg</span>
                )}
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-tertiary h-full transition-all duration-500" 
                  style={{ width: sensors?.K !== undefined && sensors?.K !== null ? `${Math.min(100, (sensors.K / 300) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Soil moisture & temperature */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/30 mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow">
                <span className="material-symbols-outlined text-secondary text-xl shadow-secondary/20 drop-shadow-md">water_drop</span>
              </div>
              <div>
                <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Umidade do Solo</span>
                <span className="text-base font-bold text-on-surface">
                  {sensors?.u_solo !== undefined && sensors?.u_solo !== null ? `${sensors.u_solo}%` : '--'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow">
                <span className="material-symbols-outlined text-red-400 text-xl shadow-red-400/20 drop-shadow-md">device_thermostat</span>
              </div>
              <div>
                <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Temperatura Solo</span>
                <span className="text-base font-bold text-on-surface">
                  {sensors?.temp_solo !== undefined && sensors?.temp_solo !== null 
                    ? `${Number(sensors.temp_solo).toFixed(1)}°C` 
                    : sensors?.temp !== undefined && sensors?.temp !== null 
                    ? `${(sensors.temp - 1.5).toFixed(1)}°C` 
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sensors Grid */}
      <section className="space-y-3">
        <header className="flex justify-between items-center">
          <h2 className="font-title-md text-base text-on-surface font-bold uppercase tracking-wide">Sensores de Ambiente</h2>
        </header>

        <div className="grid grid-cols-3 gap-2.5 items-stretch">
          {/* Left Column: Temperature & Humidity Cards */}
          <div className="col-span-2 flex flex-col gap-2.5">
            {/* Temperature Card */}
            <div className="clay-card-dark rounded-3xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow">
                  <span className="material-symbols-outlined text-red-400 text-lg drop-shadow-md">device_thermostat</span>
                </div>
                <div>
                  <p className="font-label-caps text-[9px] text-outline uppercase font-bold">Temperatura do Ar</p>
                  <p className="text-base font-bold text-on-surface">
                    {sensors?.temp !== undefined && sensors?.temp !== null ? `${sensors.temp}°C` : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Air Humidity Card */}
            <div className="clay-card-dark rounded-3xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow">
                  <span className="material-symbols-outlined text-secondary text-lg drop-shadow-md">air</span>
                </div>
                <div>
                  <p className="font-label-caps text-[9px] text-outline uppercase font-bold">Umidade do Ar</p>
                  <p className="text-base font-bold text-on-surface">
                    {sensors?.u_amb !== undefined && sensors?.u_amb !== null ? `${sensors.u_amb}%` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Minimalist Vertical LDR Light Card */}
          <div className="col-span-1 clay-card-dark rounded-3xl p-3 flex flex-col items-center justify-between text-center relative overflow-hidden h-full">
            <span className="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider">Luz (LDR)</span>

            <div className="my-auto flex items-center justify-center py-2">
              <div className={`w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow transition-all ${
                sensors?.ldr === 0 ? 'text-amber-400' : sensors?.ldr === 1 ? 'text-[#d2d7e1]' : 'text-outline'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  {sensors?.ldr === 0 ? 'wb_sunny' : sensors?.ldr === 1 ? 'dark_mode' : 'light_mode'}
                </span>
              </div>
            </div>

            <div className="h-2"></div>
          </div>

        </div>
      </section>
    </div>
  );
}
