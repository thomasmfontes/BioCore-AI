import { useState, useEffect, useRef } from 'react'
import { useMqtt, BANCO_HORTALICAS } from './hooks/useMqtt'
import { usePlantVoice } from './hooks/usePlantVoice'
import { TopAppBar } from './components/layout/TopAppBar'
import { BottomNavBar } from './components/layout/BottomNavBar'
import { CultivoTab } from './components/tabs/CultivoTab'
import { InteligenciaTab } from './components/tabs/InteligenciaTab'
import { TelemetriaTab } from './components/tabs/TelemetriaTab'
import { CameraTab } from './components/tabs/CameraTab'
import { ControleTab } from './components/tabs/ControleTab'
import { HistoricoTab } from './components/tabs/HistoricoTab'
import { PlantSelector } from './components/ui/PlantSelector'
import { PwaUpdater } from './components/ui/PwaUpdater'
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt'
import { VoiceWidget } from './components/ui/VoiceWidget'

export type Tab = 'cultivo' | 'inteligencia' | 'telemetria' | 'camera' | 'controle' | 'historico'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, hortalica, smartMode, setLight, togglePump, alterarHortalica, toggleSmartMode, resetWifi } = useMqtt()
  const voice = usePlantVoice({ status, sensors, lightStage, pumps, hortalica })

  // Garantir bloqueio em modo retrato (portrait) para o aplicativo PWA
  useEffect(() => {
    if (screen.orientation && 'lock' in screen.orientation) {
      try { (screen.orientation as any).lock('portrait').catch(() => {}); } catch { /* ignore */ }
    }
  }, [])

  const [activeTab, setActiveTab] = useState<Tab>('cultivo')
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  const tabsOrder: Tab[] = ['cultivo', 'inteligencia', 'telemetria', 'camera', 'controle', 'historico']

  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab) return
    const currentIndex = tabsOrder.indexOf(activeTab)
    const newIndex = tabsOrder.indexOf(newTab)
    if (newIndex > currentIndex) {
      setSlideDirection('right')
    } else {
      setSlideDirection('left')
    }
    setActiveTab(newTab)
  }

  const setSmartMode = (mode: boolean) => {
    toggleSmartMode(mode)
  }


  const [showSelector, setShowSelector] = useState<boolean>(false)

  const offline = status !== 'connected' || sensors === null

  return (
    <div className="bg-background text-on-surface min-h-dvh flex flex-col font-body-lg relative overflow-x-hidden">
      <TopAppBar 
        status={status} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        voiceEnabled={voice.settings.enabled}
        isSpeaking={voice.isSpeaking}
        toggleVoice={voice.toggleVoice}
        speakSummary={voice.speakSummary}
        resetWifi={resetWifi}
      />

      {/* Conteúdo Principal com Transição Direcional Suave */}
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-16 w-full overflow-hidden">
        <div 
          key={activeTab}
          className={`w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col ${
            slideDirection === 'right' ? 'animate-slideFromRight' : 'animate-slideFromLeft'
          }`}
        >
          {activeTab === 'cultivo' && (
            <CultivoTab 
              hortalica={hortalica}
              smartMode={smartMode}
              setSmartMode={setSmartMode}
              sensors={sensors}
              setShowSelector={setShowSelector}
              onNavigateToCamera={() => handleTabChange('camera')}
            />
          )}

          {activeTab === 'inteligencia' && (
            <InteligenciaTab 
              smartMode={smartMode}
              setSmartMode={setSmartMode}
              sensors={sensors}
              hortalica={hortalica}
              status={status}
              logs={logs}
            />
          )}

          {activeTab === 'telemetria' && (
            <TelemetriaTab 
              sensors={sensors}
              status={status}
            />
          )}

          {activeTab === 'camera' && (
            <CameraTab />
          )}

          {activeTab === 'controle' && (
            <ControleTab 
              smartMode={smartMode}
              offline={offline}
              status={status}
              lightStage={lightStage}
              setLight={setLight}
              pumps={pumps}
              togglePump={togglePump}
              hortalica={hortalica}
              resetWifi={resetWifi}
            />
          )}

          {activeTab === 'historico' && (
            <HistoricoTab logs={logs} />
          )}
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

      {/* Toast Notificação de Fala da Planta */}
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