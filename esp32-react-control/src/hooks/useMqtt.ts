import { useState, useEffect, useRef, useCallback } from 'react'
import mqtt from 'mqtt'
import { MQTT_CONFIG, TOPICS } from '../config/mqtt'
import type { SensorData, ConnectionStatus, LightStage, LogEntry } from '../types'

// ─── Banco de Hortaliças ─────────────────────────────────────────────────────
export type ChavePlanta = 'alface' | 'tomate' | 'manjericao'

export interface DadosPlanta {
  chave: ChavePlanta
  nome: string
  emoji: string
  u_solo: number       // % umidade ideal do solo
  fotoperiodo: number  // horas de luz por dia
  N: number            // mg/kg nitrogênio alvo
  P: number            // mg/kg fósforo alvo
  K: number            // mg/kg potássio alvo
  descricaoIA: string  // texto contextual exibido no Modo Inteligente
}

export const BANCO_HORTALICAS: Record<ChavePlanta, DadosPlanta> = {
  alface: {
    chave: 'alface',
    nome: 'Alface Crespa',
    emoji: '🥬',
    u_solo: 65,
    fotoperiodo: 16,
    N: 45, P: 12, K: 30,
    descricaoIA: 'Fotoperíodo de 16h ativo. Irrigação acionada ao atingir 55% de umidade. Dosagem NPK suave em andamento.',
  },
  tomate: {
    chave: 'tomate',
    nome: 'Tomate Cereja',
    emoji: '🍅',
    u_solo: 60,
    fotoperiodo: 14,
    N: 50, P: 20, K: 40,
    descricaoIA: 'Fotoperíodo ajustado para 14h. Solo mantido em 60% de umidade. Carga NPK elevada para floração intensa.',
  },
  manjericao: {
    chave: 'manjericao',
    nome: 'Manjericão',
    emoji: '🌿',
    u_solo: 55,
    fotoperiodo: 12,
    N: 35, P: 10, K: 25,
    descricaoIA: 'Ciclo solar de 12h simulado. Solo leve em 55% de umidade. Nutrição NPK reduzida para aroma e densidade foliar.',
  },
}

// ─── Hook State Interface ─────────────────────────────────────────────────────
export interface MqttState {
  status: ConnectionStatus
  sensors: SensorData | null
  lightStage: LightStage
  pumps: [boolean, boolean, boolean, boolean]
  logs: LogEntry[]
  hortalica: DadosPlanta
  setLight: (stage: LightStage) => void
  togglePump: (index: 0 | 1 | 2 | 3) => void
  alterarHortalica: (chave: ChavePlanta) => void
}

let _id = 0

function makeLog(message: string): LogEntry {
  return {
    id: ++_id,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    message,
  }
}

function pushLog(entry: LogEntry, prev: LogEntry[]): LogEntry[] {
  return [entry, ...prev].slice(0, 10)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useMqtt(): MqttState {
  const [status, setStatus]         = useState<ConnectionStatus>('disconnected')
  const [sensors, setSensors]       = useState<SensorData | null>(null)
  const [lightStage, setLightStageState] = useState<LightStage>(0)
  const [pumps, setPumps]           = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false])
  const [logs, setLogs]             = useState<LogEntry[]>([])
  const [hortalica, setHortalica]   = useState<DadosPlanta>(BANCO_HORTALICAS.alface)
  const clientRef                   = useRef<mqtt.MqttClient | null>(null)

  const setLight = useCallback((stage: LightStage) => {
    clientRef.current?.publish(TOPICS.light, String(stage))
    setLightStageState(stage)
    const labels = ['Desligada', '25%', '50%', '100%']
    setLogs(prev => pushLog(makeLog(`Luz → ${labels[stage]}`), prev))
  }, [])

  const togglePump = useCallback((index: 0 | 1 | 2 | 3) => {
    setPumps(prev => {
      const next = [...prev] as [boolean, boolean, boolean, boolean]
      next[index] = !next[index]
      clientRef.current?.publish(TOPICS.pump((index + 1) as 1 | 2 | 3 | 4), next[index] ? '1' : '0')
      const names = ['Bomba N', 'Bomba P', 'Bomba K', 'Irrigação']
      setLogs(p => pushLog(makeLog(`${names[index]} → ${next[index] ? 'ON' : 'OFF'}`), p))
      return next
    })
  }, [])

  const alterarHortalica = useCallback((chave: ChavePlanta) => {
    const planta = BANCO_HORTALICAS[chave]
    setHortalica(planta)

    // Publica config JSON completo para o ESP32
    const payload = JSON.stringify({
      planta:      planta.nome,
      u_solo_alvo: planta.u_solo,
      luz_horas:   planta.fotoperiodo,
      n_alvo:      planta.N,
      p_alvo:      planta.P,
      k_alvo:      planta.K,
    })

    clientRef.current?.publish(TOPICS.hortalica, payload, { retain: true })
    setLogs(prev => pushLog(makeLog(`Hortaliça → ${planta.nome} (config enviada)`), prev))
  }, [])

  useEffect(() => {
    setStatus('connecting')
    setLogs([makeLog('Conectando ao broker...')])

    const client = mqtt.connect(MQTT_CONFIG.url, {
      username:        MQTT_CONFIG.username,
      password:        MQTT_CONFIG.password,
      reconnectPeriod: 5000,
      connectTimeout:  10000,
    })

    clientRef.current = client

    client.on('connect', () => {
      setStatus('connected')
      client.subscribe(TOPICS.data)
      setLogs(prev => pushLog(makeLog('Hardware online'), prev))
    })

    client.on('message', (_topic, payload) => {
      try {
        setSensors(JSON.parse(payload.toString()) as SensorData)
      } catch { /* payload malformado */ }
    })

    client.on('offline',   () => { setStatus('offline');  setLogs(prev => pushLog(makeLog('Hardware offline'), prev)) })
    client.on('error',     () => { setStatus('error');    setLogs(prev => pushLog(makeLog('Erro de conexão'), prev)) })
    client.on('reconnect', () => { setStatus('connecting') })

    return () => { client.end(true) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { status, sensors, lightStage, pumps, logs, hortalica, setLight, togglePump, alterarHortalica }
}
