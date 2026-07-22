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
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  const offline = status !== 'connected'

  const tabsOrder: Tab[] = ['cultivo', 'telemetria', 'camera', 'controle', 'historico']
  const activeIndex = tabsOrder.indexOf(activeTab)

  const handleTabChange = (newTab: Tab) => {
    const newIndex = tabsOrder.indexOf(newTab)
    if (newIndex > activeIndex) {
      setSlideDirection('right')
    } else if (newIndex < activeIndex) {
      setSlideDirection('left')
    }
    setActiveTab(newTab)
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cultivo':
        return (
          <CultivoTab 
            hortalica={hortalica}
            smartMode={smartMode}
            setSmartMode={setSmartMode}
            sensors={sensors}
            setShowSelector={setShowSelector}
            onNavigateToCamera={() => handleTabChange('camera')}
          />
        )
      case 'telemetria':
        return (
          <TelemetriaTab 
            sensors={sensors}
            status={status}
          />
        )
      case 'camera':
        return <CameraTab />
      case 'controle':
        return (
          <ControleTab 
            smartMode={smartMode}
            offline={offline}
            lightStage={lightStage}
            setLight={setLight}
            pumps={pumps}
            togglePump={togglePump}
            hortalica={hortalica}
          />
        )
      case 'historico':
        return <HistoricoTab logs={logs} />
      default:
        return null
    }
  }

  return (
    <div className="bg-background text-on-surface h-dvh md:h-auto md:min-h-screen flex flex-col font-body-lg overflow-hidden md:overflow-visible">
      <TopAppBar status={status} activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area com rolagem inercial nativa PWA */}
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-12 px-margin-mobile md:px-8 max-w-md md:max-w-5xl mx-auto w-full flex flex-col overflow-y-auto overscroll-y-contain touch-pan-y md:overflow-visible">
        
        {/* Contêiner de Transição Lateral da Aba Ativa (Deslizando da direita ou da esquerda) */}
        <div 
          key={activeTab} 
          className={`w-full flex-1 flex flex-col gap-stack-lg pb-4 ${
            slideDirection === 'right' ? 'animate-slideInFromRight' : 'animate-slideInFromLeft'
          }`}
        >
          {renderActiveTab()}
        </div>

      </main>

      <BottomNavBar activeTab={activeTab} setActiveTab={handleTabChange} />

      <PlantSelector 
        showSelector={showSelector}
        setShowSelector={setShowSelector}
        hortalica={hortalica}
        alterarHortalica={alterarHortalica}
        bancoHortalicas={BANCO_HORTALICAS}
      />

      {/* Container de Notificações Flutuantes do PWA */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[999] flex flex-col gap-3 pointer-events-none">
        <PwaUpdater />
        <PwaInstallPrompt />
      </div>
    </div>
  )
}