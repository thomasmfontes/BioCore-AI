import { useState } from 'react'
import { useMqtt, BANCO_HORTALICAS } from './hooks/useMqtt'
import { TopAppBar } from './components/layout/TopAppBar'
import { BottomNavBar } from './components/layout/BottomNavBar'
import { CultivoTab } from './components/tabs/CultivoTab'
import { TelemetriaTab } from './components/tabs/TelemetriaTab'
import { ControleTab } from './components/tabs/ControleTab'
import { HistoricoTab } from './components/tabs/HistoricoTab'
import { PlantSelector } from './components/ui/PlantSelector'

export type Tab = 'cultivo' | 'telemetria' | 'controle' | 'historico'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, hortalica, setLight, togglePump, alterarHortalica } = useMqtt()
  const [activeTab, setActiveTab] = useState<Tab>('cultivo')
  const [smartMode, setSmartMode] = useState<boolean>(true)
  const [showSelector, setShowSelector] = useState<boolean>(false)

  const offline = status !== 'connected'

  return (
    <div className="bg-background text-on-surface h-dvh md:h-auto md:min-h-screen flex flex-col font-body-lg overflow-hidden md:overflow-visible">
      <TopAppBar status={status} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-28 md:pb-12 px-margin-mobile md:px-8 max-w-md md:max-w-5xl mx-auto w-full flex flex-col gap-stack-lg overflow-y-auto md:overflow-y-visible">
        
        <div className={activeTab === 'cultivo' ? 'block' : 'hidden'}>
          <CultivoTab 
            hortalica={hortalica}
            smartMode={smartMode}
            setSmartMode={setSmartMode}
            sensors={sensors}
            setShowSelector={setShowSelector}
          />
        </div>

        <div className={activeTab === 'telemetria' ? 'block' : 'hidden'}>
          <TelemetriaTab 
            sensors={sensors}
            status={status}
          />
        </div>

        <div className={activeTab === 'controle' ? 'block' : 'hidden'}>
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

        <div className={activeTab === 'historico' ? 'block' : 'hidden'}>
          <HistoricoTab 
            logs={logs}
          />
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
    </div>
  )
}