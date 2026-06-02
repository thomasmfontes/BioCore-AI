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
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-lg">
      <TopAppBar status={status} />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 px-margin-mobile max-w-md mx-auto w-full flex flex-col gap-stack-lg">
        
        {activeTab === 'cultivo' && (
          <CultivoTab 
            hortalica={hortalica}
            smartMode={smartMode}
            setSmartMode={setSmartMode}
            sensors={sensors}
            setShowSelector={setShowSelector}
          />
        )}

        {activeTab === 'telemetria' && (
          <TelemetriaTab 
            sensors={sensors}
            status={status}
          />
        )}

        {activeTab === 'controle' && (
          <ControleTab 
            smartMode={smartMode}
            offline={offline}
            lightStage={lightStage}
            setLight={setLight}
            pumps={pumps}
            togglePump={togglePump}
            hortalica={hortalica}
          />
        )}

        {activeTab === 'historico' && (
          <HistoricoTab 
            logs={logs}
          />
        )}

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