import { useState } from 'react'
import { useMqtt, BANCO_HORTALICAS } from './hooks/useMqtt'
import { usePlantVoice } from './hooks/usePlantVoice'
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
import { VoiceWidget } from './components/ui/VoiceWidget'

export type Tab = 'cultivo' | 'telemetria' | 'camera' | 'controle' | 'historico'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, hortalica, setLight, togglePump, alterarHortalica } = useMqtt()
  const voice = usePlantVoice({ status, sensors, lightStage, pumps, hortalica })

  const [activeTab, setActiveTab] = useState<Tab>('cultivo')
  const [smartMode, setSmartModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('biocore_smart_mode')
      if (saved !== null) {
        return saved === 'true'
      }
    } catch {
      /* ignore */
    }
    return true
  })

  const setSmartMode = (mode: boolean) => {
    setSmartModeState(mode)
    try {
      localStorage.setItem('biocore_smart_mode', String(mode))
    } catch {
      /* ignore */
    }
  }

  const [showSelector, setShowSelector] = useState<boolean>(false)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')


  const offline = status !== 'connected' || sensors === null

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
            status={status}
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
      <TopAppBar 
        status={status} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        voiceEnabled={voice.settings.enabled}
        isSpeaking={voice.isSpeaking}
        toggleVoice={voice.toggleVoice}
        speakSummary={voice.speakSummary}
      />

      {/* Main Content Area com padding inferior ampliado (pb-32 / pb-[calc(7.5rem+env(safe-area-inset-bottom))]) para permitir rolagem completa sem cobrir o botão da câmera */}
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-16 px-margin-mobile md:px-8 max-w-md md:max-w-5xl mx-auto w-full flex flex-col overflow-y-auto overscroll-y-contain touch-pan-y md:overflow-visible">
        
        {/* Contêiner de Transição Lateral da Aba Ativa */}
        <div 
          key={activeTab} 
          className={`w-full flex-1 flex flex-col gap-stack-lg pb-8 ${
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

      {/* Toast Notificação de Fala da Planta (exibido apenas quando a planta está falando) */}
      <VoiceWidget 
        isSpeaking={voice.isSpeaking}
        currentMessage={voice.currentMessage}
        stopVoice={voice.stopVoice}
        plantEmoji={hortalica.emoji}
      />


      {/* Container de Notificações Flutuantes do PWA */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[999] flex flex-col gap-3 pointer-events-none">
        <PwaUpdater />
        <PwaInstallPrompt />
      </div>
    </div>
  )
}