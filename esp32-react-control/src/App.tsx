import { useState, useEffect, useRef } from 'react'
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

  // Garantir bloqueio em modo retrato (portrait) para o aplicativo PWA
  useEffect(() => {
    if (screen.orientation && 'lock' in screen.orientation) {
      try { (screen.orientation as any).lock('portrait').catch(() => {}); } catch { /* ignore */ }
    }
  }, [])

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

  const offline = status !== 'connected' || sensors === null

  const tabsOrder: Tab[] = ['cultivo', 'telemetria', 'camera', 'controle', 'historico']

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef<boolean>(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeTabRef = useRef<Tab>(activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab)
    const newIndex = tabsOrder.indexOf(newTab)
    if (scrollContainerRef.current) {
      isProgrammaticScrollRef.current = true
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      const width = scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollTo({
        left: newIndex * width,
        behavior: 'smooth',
      })

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 700)
    }
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    if (isProgrammaticScrollRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 150)
      return
    }

    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth <= 0) return
    const newIndex = Math.round(scrollLeft / clientWidth)
    if (tabsOrder[newIndex] && tabsOrder[newIndex] !== activeTab) {
      setActiveTab(tabsOrder[newIndex])
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        const index = tabsOrder.indexOf(activeTabRef.current)
        const width = scrollContainerRef.current.clientWidth
        scrollContainerRef.current.scrollLeft = index * width
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="bg-background text-on-surface min-h-dvh flex flex-col font-body-lg relative">
      <TopAppBar 
        status={status} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        voiceEnabled={voice.settings.enabled}
        isSpeaking={voice.isSpeaking}
        toggleVoice={voice.toggleVoice}
        speakSummary={voice.speakSummary}
      />

      {/* Viewport Horizontal com Scroll Snap NATIVO a 60fps */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-16 w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {/* Aba 1: Cultivo */}
        <div className="w-full min-w-full shrink-0 snap-start">
          <div className="w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col">
            <CultivoTab 
              hortalica={hortalica}
              smartMode={smartMode}
              setSmartMode={setSmartMode}
              sensors={sensors}
              setShowSelector={setShowSelector}
              onNavigateToCamera={() => handleTabChange('camera')}
            />
          </div>
        </div>

        {/* Aba 2: Telemetria */}
        <div className="w-full min-w-full shrink-0 snap-start">
          <div className="w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col">
            <TelemetriaTab 
              sensors={sensors}
              status={status}
            />
          </div>
        </div>

        {/* Aba 3: Câmera */}
        <div className="w-full min-w-full shrink-0 snap-start">
          <div className="w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col">
            <CameraTab />
          </div>
        </div>

        {/* Aba 4: Controles */}
        <div className="w-full min-w-full shrink-0 snap-start">
          <div className="w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col">
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
          </div>
        </div>

        {/* Aba 5: Histórico */}
        <div className="w-full min-w-full shrink-0 snap-start">
          <div className="w-full max-w-md md:max-w-5xl mx-auto px-margin-mobile md:px-8 flex flex-col">
            <HistoricoTab logs={logs} />
          </div>
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