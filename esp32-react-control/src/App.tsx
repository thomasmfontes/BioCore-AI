import { Droplets, Thermometer, Wind } from 'lucide-react'
import { useMqtt } from './hooks/useMqtt'
import { Header } from './components/Header'
import { StatusCard } from './components/StatusCard'
import { NutrientCard } from './components/NutrientCard'
import { ClimateCard } from './components/ClimateCard'
import { LightControl } from './components/LightControl'
import { PumpControl } from './components/PumpControl'
import { ActivityLog } from './components/ActivityLog'

export default function App() {
  const { status, sensors, lightStage, pumps, logs, setLight, togglePump } = useMqtt()
  const offline = status !== 'connected'

  return (
    <div className="min-h-screen bg-bio-dark">
      <Header status={status} />

      <main className="max-w-lg mx-auto px-4 py-5 pb-12 space-y-4">

        <StatusCard sensors={sensors} />

        {/* Nutrientes do Solo */}
        <section>
          <p className="text-[10px] font-bold text-bio-muted uppercase tracking-widest mb-2">
            Nutrientes do Solo
          </p>
          <div className="grid grid-cols-3 gap-2">
            <NutrientCard element="N" label="Nitrogênio" value={sensors?.N} max={200} />
            <NutrientCard element="P" label="Fósforo"    value={sensors?.P} max={100} />
            <NutrientCard element="K" label="Potássio"   value={sensors?.K} max={300} />
          </div>
        </section>

        {/* Microclima */}
        <section>
          <p className="text-[10px] font-bold text-bio-muted uppercase tracking-widest mb-2">
            Microclima
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <ClimateCard
              icon={Droplets}
              label="Umidade Solo"
              value={sensors?.u_solo}
              unit="%"
              barColor="bg-bio-blue"
              barMax={100}
              iconClass="text-bio-blue"
            />
            <ClimateCard
              icon={Thermometer}
              label="Temperatura"
              value={sensors?.temp}
              unit="°C"
              barColor="bg-bio-red"
              barMax={50}
              iconClass="text-bio-red"
            />
          </div>
          <ClimateCard
            icon={Wind}
            label="Umidade Ambiente"
            value={sensors?.u_amb}
            unit="%"
            barColor="bg-bio-muted"
            barMax={100}
            iconClass="text-bio-muted"
          />
        </section>

        <LightControl stage={lightStage} onChange={setLight} disabled={offline} />

        <PumpControl pumps={pumps} onToggle={togglePump} disabled={offline} />

        <ActivityLog logs={logs} />

      </main>
    </div>
  )
}
