import { useState } from 'react'
import { useMqtt } from './hooks/useMqtt'
import type { LightStage } from './types'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, setLight, togglePump } = useMqtt()
  const [activeTab, setActiveTab] = useState<'cultivo' | 'telemetria' | 'controle' | 'historico'>('cultivo')
  const [smartMode, setSmartMode] = useState<boolean>(true)

  const offline = status !== 'connected'

  // Get status color/icon for cloud indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return { icon: 'cloud_done', color: 'text-primary' }
      case 'connecting':
        return { icon: 'cloud_sync', color: 'text-secondary animate-pulse' }
      default:
        return { icon: 'cloud_off', color: 'text-error' }
    }
  }

  const indicator = getStatusIndicator()

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-lg">
      {/* TopAppBar */}
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

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 px-margin-mobile max-w-md mx-auto w-full flex flex-col gap-stack-lg">
        
        {/* VIEW 1: CULTIVO */}
        {activeTab === 'cultivo' && (
          <div className="space-y-stack-lg animate-fadeIn">
            {/* Active Crop Section */}
            <section className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant inner-bevel">
              <div className="p-stack-md border-b border-outline-variant">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">Estado Atual</span>
              </div>
              <div className="relative h-64 w-full bg-surface-container-highest">
                <img
                  alt="Alface Crespa"
                  className="w-full h-full object-cover opacity-80"
                  src="https://images.unsplash.com/photo-1621961476421-e09e13d96924?q=80&w=600&auto=format&fit=crop"
                  onError={(e) => {
                    // Fallback to a high-quality scientific image if unspash is slow
                    e.currentTarget.src = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="font-label-caps text-label-caps bg-primary/10 text-primary px-2 py-1 rounded-sm border border-primary/20 mb-2 inline-block">CULTIVANDO</span>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">Alface Crespa</h2>
                </div>
                <div className="absolute top-4 right-4 bg-surface-container/80 backdrop-blur-md p-2 rounded-full border border-outline-variant active-glow">
                  <span className="material-symbols-outlined text-primary text-xl">potted_plant</span>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-outline-variant border-t border-outline-variant">
                <div className="p-stack-md text-center">
                  <p className="font-label-caps text-label-caps text-outline text-[10px]">DIA</p>
                  <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">14/30</p>
                </div>
                <div className="p-stack-md text-center">
                  <p className="font-label-caps text-label-caps text-outline text-[10px]">SAÚDE</p>
                  <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">98%</p>
                </div>
                <div className="p-stack-md text-center">
                  <p className="font-label-caps text-label-caps text-outline text-[10px]">COLHEITA</p>
                  <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">12 JUN</p>
                </div>
              </div>
            </section>

            {/* Smart Mode Card */}
            <section className="bg-surface-container rounded-xl border border-outline-variant inner-bevel p-stack-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">psychology</span>
              </div>
              <div className="flex justify-between items-center mb-stack-md relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                  <h3 className="font-title-md text-title-md font-bold tracking-tight">MODO INTELIGENTE</h3>
                </div>
                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer touch-target-min">
                  <input
                    type="checkbox"
                    checked={smartMode}
                    onChange={(e) => setSmartMode(e.target.checked)}
                    className="sr-only peer switch-input"
                  />
                  <div className="w-12 h-6 bg-surface-container-highest rounded-full transition-colors switch-rail border border-outline-variant relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-outline rounded-full transition-transform switch-knob flex items-center justify-center"></div>
                  </div>
                </label>
              </div>
              <div className="space-y-stack-md relative z-10">
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed text-xs">
                  O BioCore AI gerencia ativamente o ambiente de cultivo para maximizar o rendimento e a eficiência de recursos.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-lg">light_mode</span>
                    <div>
                      <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Fotoperíodo LED</p>
                      <p className="text-xs text-on-surface-variant">Ciclo automático de 16h luz / 8h escuridão.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-lg">water_drop</span>
                    <div>
                      <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Irrigação Inteligente</p>
                      <p className="text-xs text-on-surface-variant">Ativada sob demanda por sensores de umidade.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-lg">science</span>
                    <div>
                      <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Dosagem NPK</p>
                      <p className="text-xs text-on-surface-variant">Correção automatizada baseada nas metas do solo.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex justify-center">
                <button 
                  onClick={() => alert('Parâmetros Inteligentes ativos. IA otimizando fotossíntese.')}
                  className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-3 px-6 rounded-xl w-full transition-transform active:scale-95 bio-glow text-sm"
                >
                  VER LÓGICA DE IA
                </button>
              </div>
            </section>

            {/* Status Grid (Bento style) */}
            <div className="grid grid-cols-2 gap-stack-md">
              <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant">
                <span className="font-label-caps text-[10px] text-outline block mb-1 uppercase font-semibold">Umidade Solo</span>
                <div className="flex items-end gap-1">
                  <span className="font-display-lg text-2xl font-bold text-on-surface">
                    {sensors?.u_solo ?? 65}
                  </span>
                  <span className="font-body-sm text-xs text-outline mb-1">%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-secondary h-1 rounded-full" style={{ width: `${sensors?.u_solo ?? 65}%` }}></div>
                </div>
              </div>
              <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant">
                <span className="font-label-caps text-[10px] text-outline block mb-1 uppercase font-semibold">Temperatura</span>
                <div className="flex items-end gap-1">
                  <span className="font-display-lg text-2xl font-bold text-on-surface">
                    {sensors?.temp ?? 24}
                  </span>
                  <span className="font-body-sm text-xs text-outline mb-1">°C</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-tertiary h-1 rounded-full" style={{ width: `${((sensors?.temp ?? 24) / 50) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TELEMETRIA */}
        {activeTab === 'telemetria' && (
          <div className="space-y-stack-lg animate-fadeIn">
            {/* Hero Card: SOLO (NPK) */}
            <section>
              <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <header className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-2">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Solo (NPK)</span>
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-mono">
                    {sensors ? 'ATURANDO_LIVE' : 'VALORES_MOCK'}
                  </span>
                </header>
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
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
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

            {/* Image Aesthetic Anchor */}
            <div className="rounded-xl overflow-hidden h-40 border border-outline-variant relative">
              <img
                className="w-full h-full object-cover grayscale opacity-60"
                alt="Monitoring Lab"
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <p className="font-label-caps text-[10px] font-bold text-primary uppercase">Câmera de Monitoramento 04</p>
                <p className="text-xs text-on-surface font-semibold">Setor A - Germinação Norte</p>
              </div>
            </div>

            {/* Sensors Grid */}
            <section className="space-y-3">
              <header className="flex justify-between items-center">
                <h2 className="font-title-md text-base text-on-surface font-bold uppercase tracking-wide">Sensores de Ambiente</h2>
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white">filter_list</span>
              </header>
              <div className="grid grid-cols-1 gap-2.5">
                {/* Humidity Card */}
                <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer group active:scale-95">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant group-hover:border-primary transition-all">
                      <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
                    </div>
                    <div>
                      <p className="font-label-caps text-[9px] text-outline uppercase font-bold">Umidade do Solo</p>
                      <p className="text-lg font-bold text-on-surface">{sensors?.u_solo ?? 65}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-xs text-primary">+2.4%</span>
                    <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                  </div>
                </div>

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
        )}

        {/* VIEW 3: CONTROLE */}
        {activeTab === 'controle' && (
          <div className="space-y-stack-lg animate-fadeIn">
            {/* Screen Title Section */}
            <section className="space-y-1">
              <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold">Acesso Manual</span>
              <h2 className="font-headline-lg-mobile text-xl font-bold">Painel de Controle</h2>
            </section>

            {/* Lighting Control Section */}
            <section className="bg-surface-container border border-outline-variant rounded-xl p-stack-md inner-bevel">
              <div className="flex items-center justify-between mb-stack-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">light_mode</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Iluminação LED</span>
                </div>
                <span className="font-mono-data text-xs text-primary font-semibold">
                  {lightStage === 0 ? 'DESLIGADA' : `${[0, 25, 50, 100][lightStage]}% ATIVO`}
                </span>
              </div>

              {/* Selector Track */}
              <div className="mechanical-track rounded-full p-1 flex justify-between items-center border border-outline-variant relative">
                {([0, 1, 2, 3] as LightStage[]).map((stage) => {
                  const labels = ['OFF', '25%', '50%', '100%']
                  const active = lightStage === stage
                  return (
                    <button
                      key={stage}
                      disabled={offline}
                      onClick={() => setLight(stage)}
                      className={`flex-1 py-2 px-1 rounded-full font-label-caps text-[10px] font-bold transition-all text-center
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${active 
                          ? 'bg-primary text-on-primary font-bold glow-primary scale-105' 
                          : 'text-outline hover:text-on-surface'
                        }
                      `}
                    >
                      {labels[stage]}
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Description Box */}
              <div className="mt-stack-md p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5"></div>
                <p className="text-xs text-on-surface-variant relative z-10 italic">
                  {lightStage === 0 && 'Luzes desligadas. Fotossíntese em repouso.'}
                  {lightStage === 1 && 'Espectro noturno de baixa intensidade ativo.'}
                  {lightStage === 2 && 'Espectro ideal para o crescimento vegetativo.'}
                  {lightStage === 3 && 'Espectro de floração plena e sol forte ativado para o Módulo Alfa.'}
                </p>
              </div>
            </section>

            {/* Hydraulic Dock Section */}
            <section className="space-y-stack-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-xl">water_drop</span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Sistema Hidráulico</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Pump Toggle 1: Nutrientes */}
                <div 
                  onClick={() => !offline && togglePump(0)}
                  className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer active:scale-95 select-none
                    ${offline ? 'opacity-50 cursor-not-allowed' : ''}
                    ${pumps[0] 
                      ? 'bg-surface-container border-primary active-toggle' 
                      : 'bg-surface-container border-outline-variant'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold">BOMBA 1</span>
                      <div className="text-sm font-bold mt-0.5">Nutrientes N</div>
                    </div>
                    {/* Visual toggle switch */}
                    <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                      ${pumps[0] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
                    `}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                        ${pumps[0] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                      `}></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <span className={`font-mono-data text-[10px] font-bold ${pumps[0] ? 'text-primary' : 'text-outline'}`}>
                      {pumps[0] ? 'ATIVO' : 'STANDBY'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
                  </div>
                </div>

                {/* Pump Toggle 2: H2O Pura */}
                <div 
                  onClick={() => !offline && togglePump(1)}
                  className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer active:scale-95 select-none
                    ${offline ? 'opacity-50 cursor-not-allowed' : ''}
                    ${pumps[1] 
                      ? 'bg-surface-container border-primary active-toggle' 
                      : 'bg-surface-container border-outline-variant'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold">BOMBA 2</span>
                      <div className="text-sm font-bold mt-0.5">H2O Pura</div>
                    </div>
                    {/* Visual toggle switch */}
                    <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                      ${pumps[1] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
                    `}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                        ${pumps[1] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                      `}></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <span className={`font-mono-data text-[10px] font-bold ${pumps[1] ? 'text-primary' : 'text-outline'}`}>
                      {pumps[1] ? 'ATIVO' : 'STANDBY'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
                  </div>
                </div>

                {/* Pump Toggle 3: Drenagem */}
                <div 
                  onClick={() => !offline && togglePump(2)}
                  className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer active:scale-95 select-none
                    ${offline ? 'opacity-50 cursor-not-allowed' : ''}
                    ${pumps[2] 
                      ? 'bg-surface-container border-primary active-toggle' 
                      : 'bg-surface-container border-outline-variant'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold">BOMBA 3</span>
                      <div className="text-sm font-bold mt-0.5">Drenagem</div>
                    </div>
                    {/* Visual toggle switch */}
                    <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                      ${pumps[2] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
                    `}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                        ${pumps[2] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                      `}></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <span className={`font-mono-data text-[10px] font-bold ${pumps[2] ? 'text-primary' : 'text-outline'}`}>
                      {pumps[2] ? 'ATIVO' : 'STANDBY'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
                  </div>
                </div>

                {/* Pump Toggle 4: Resfriamento */}
                <div 
                  onClick={() => !offline && togglePump(3)}
                  className={`border rounded-xl p-stack-md flex flex-col gap-3 transition-all duration-200 cursor-pointer active:scale-95 select-none
                    ${offline ? 'opacity-50 cursor-not-allowed' : ''}
                    ${pumps[3] 
                      ? 'bg-surface-container border-primary active-toggle' 
                      : 'bg-surface-container border-outline-variant'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold">BOMBA 4</span>
                      <div className="text-sm font-bold mt-0.5">Resfriamento</div>
                    </div>
                    {/* Visual toggle switch */}
                    <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5
                      ${pumps[3] ? 'bg-primary/20 border-primary' : 'bg-surface-container-highest border-outline'}
                    `}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5
                        ${pumps[3] ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'}
                      `}></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <span className={`font-mono-data text-[10px] font-bold ${pumps[3] ? 'text-primary' : 'text-outline'}`}>
                      {pumps[3] ? 'ATIVO' : 'STANDBY'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">valve</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Telemetry Card */}
            <section className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-stack-md border-b border-outline-variant bg-surface-container-highest/30 flex justify-between items-center">
                <span className="font-label-caps text-[10px] text-on-surface uppercase font-bold">Estado do Hardware</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-primary animate-pulse' : 'bg-outline'}`}></span>
                  <span className={`font-mono-data text-[9px] font-bold ${status === 'connected' ? 'text-primary' : 'text-outline'}`}>
                    {status === 'connected' ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
              <div className="p-stack-md grid grid-cols-2 gap-stack-md">
                <div className="space-y-1">
                  <span className="font-label-caps text-[8px] text-outline block font-bold">TEMP. REATOR</span>
                  <span className="font-mono-data text-base font-bold text-on-surface">{sensors?.temp ? `${sensors.temp + 0.5}°C` : '24.5°C'}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[8px] text-outline block font-bold">PRESSÃO BAR</span>
                  <span className="font-mono-data text-base font-bold text-on-surface">1.2 PSI</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 4: HISTÓRICO (LOGS) */}
        {activeTab === 'historico' && (
          <div className="space-y-stack-lg animate-fadeIn">
            <section className="space-y-1">
              <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold">Histórico de Eventos</span>
              <h2 className="font-headline-lg-mobile text-xl font-bold">Logs de Atividade</h2>
            </section>

            <section className="bg-surface-container border border-outline-variant rounded-xl p-4 inner-bevel">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider font-bold">Últimos Eventos</span>
                <span className="text-[9px] text-outline font-mono uppercase bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">MQTT Sync</span>
              </div>
              
              <div className="space-y-3 font-mono-data text-xs max-h-[400px] overflow-y-auto scroll-hide">
                {logs.length === 0 ? (
                  <div className="py-8 text-center text-outline text-xs">
                    Nenhum evento registrado ainda.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex gap-3 leading-relaxed hover:bg-background/25 p-1.5 rounded transition-all">
                      <span className="text-secondary shrink-0 select-none text-[11px] font-bold">[{log.time}]</span>
                      <span className="text-on-surface-variant flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 h-[64px] border-t border-outline-variant bg-surface-container shadow-[0_-4px_10px_rgba(0,0,0,0.3)] flex justify-around items-center px-4">
        
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
            settings_input_component
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
            event_note
          </span>
        </button>

      </nav>
    </div>
  )
}
