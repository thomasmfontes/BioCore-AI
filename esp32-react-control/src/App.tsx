import { useState } from 'react'
import { useMqtt, BANCO_HORTALICAS } from './hooks/useMqtt'
import { TopAppBar } from './components/layout/TopAppBar'
import { BottomNavBar } from './components/layout/BottomNavBar'
import { CultivoTab } from './components/tabs/CultivoTab'
import { TelemetriaTab } from './components/tabs/TelemetriaTab'
import { CameraTab } from './components/tabs/CameraTab'
import { ControleTab } from './components/tabs/ControleTab'
import { HistoricoTab } from './components/tabs/HistoricoTab'
import { PlantSelector } from './components/ui/PlantSelector'
import { PwaUpdater } from './components/ui/PwaUpdater'
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt'

export type Tab = 'cultivo' | 'telemetria' | 'camera' | 'controle' | 'historico'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, hortalica, setLight, togglePump, alterarHortalica } = useMqtt()
  const [activeTab, setActiveTab] = useState<Tab>('cultivo')
  const [smartMode, setSmartMode] = useState<boolean>(true)
  const [showSelector, setShowSelector] = useState<boolean>(false)

  const offline = status !== 'connected'

  const getTabClass = (tabId: Tab) => {
    const isActive = activeTab === tabId
    return `w-full h-full overflow-y-auto overscroll-y-contain touch-pan-y px-0.5 flex flex-col gap-stack-lg transition-opacity duration-200
      ${isActive 
        ? 'flex opacity-100 animate-fadeIn md:h-auto md:overflow-visible' 
        : 'hidden md:flex md:w-full md:opacity-100 md:h-auto'
      }
    `
  }

  return (
    <div className="bg-background text-on-surface h-dvh md:h-auto md:min-h-screen flex flex-col font-body-lg overflow-hidden md:overflow-visible">
      <TopAppBar status={status} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-12 px-margin-mobile md:px-8 max-w-md md:max-w-5xl mx-auto w-full flex flex-col min-h-0 overflow-hidden md:overflow-visible">
        
        {/* Contêiner de Abas Otimizado para PWA Standalone (Sem 500% transform que travava o toque) */}
        <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col md:overflow-visible">
          {/* Tab: Cultivo */}
          <div className={getTabClass('cultivo')}>
            <CultivoTab 
              hortalica={hortalica}
              smartMode={smartMode}
              setSmartMode={setSmartMode}
              sensors={sensors}
              setShowSelector={setShowSelector}
              onNavigateToCamera={() => setActiveTab('camera')}
            />
          </div>

          {/* Tab: Telemetria */}
          <div className={getTabClass('telemetria')}>
            <TelemetriaTab 
              sensors={sensors}
              status={status}
            />
          </div>

          {/* Tab: Câmera */}
          <div className={getTabClass('camera')}>
            <CameraTab />
          </div>

          {/* Tab: Controle */}
          <div className={getTabClass('controle')}>
            <ControleTab 
              smartMode={smartMode}
              offline={offline}
              lightStage={lightStage}
              setLight={setLight}
              pumps={pumps}
              togglePump={togglePump}
              hortalica={hortalica}
            />
          </div>

          {/* Tab: Historico */}
          <div className={getTabClass('historico')}>
            <HistoricoTab 
              logs={logs}
            />
          </div>
        </div>

      </main>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <PlantSelector 
        showSelector={showSelector}
        setShowSelector={setShowSelector}
        hortalica={hortalica}
        alterarHortalica={alterarHortalica}
        bancoHortalicas={BANCO_HORTALICAS}
      />

      {/* Container de Notificações Flutuantes do PWA - Empilha múltiplos banners sem sobreposição */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[999] flex flex-col gap-3 pointer-events-none">
        <PwaUpdater />
        <PwaInstallPrompt />
      </div>
    </div>
  )
}