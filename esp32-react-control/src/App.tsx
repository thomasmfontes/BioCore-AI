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

  const tabsOrder: Tab[] = ['cultivo', 'telemetria', 'camera', 'controle', 'historico']
  const activeIndex = tabsOrder.indexOf(activeTab)

  const getTabClass = (tabId: Tab) => {
    const isActive = activeTab === tabId
    return `w-1/5 md:w-full shrink-0 h-full overflow-y-auto px-0.5 flex flex-col gap-stack-lg transition-all duration-300
      ${isActive 
        ? 'opacity-100 md:h-auto md:overflow-visible' 
        : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden md:pointer-events-none'
      }
    `
  }

  return (
    <div className="bg-background text-on-surface h-dvh md:h-auto md:min-h-screen flex flex-col font-body-lg overflow-hidden md:overflow-visible">
      <TopAppBar status={status} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-12 px-margin-mobile md:px-8 max-w-md md:max-w-5xl mx-auto w-full flex flex-col overflow-hidden md:overflow-visible">
        
        {/* Sliding Carousel Container */}
        <div className="flex-1 w-full overflow-hidden flex flex-col h-full md:overflow-visible">
          <div 
            className="flex flex-row h-full transition-transform duration-300 ease-out w-[500%] md:w-full md:flex-col md:!transform-none"
            style={{ transform: `translateX(-${activeIndex * 20}%)` }}
          >
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