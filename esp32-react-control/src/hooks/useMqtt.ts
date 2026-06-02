import { useState, useEffect, useRef, useCallback } from 'react'
import mqtt from 'mqtt'
import { MQTT_CONFIG, TOPICS } from '../config/mqtt'
import type { SensorData, ConnectionStatus, LightStage, LogEntry } from '../types'

export interface MqttState {
  status: ConnectionStatus
  sensors: SensorData | null
  lightStage: LightStage
  pumps: [boolean, boolean, boolean, boolean]
  logs: LogEntry[]
  setLight: (stage: LightStage) => void
  togglePump: (index: 0 | 1 | 2 | 3) => void
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

export function useMqtt(): MqttState {
  const [status, setStatus]     = useState<ConnectionStatus>('disconnected')
  const [sensors, setSensors]   = useState<SensorData | null>(null)
  const [lightStage, setLightStageState] = useState<LightStage>(0)
  const [pumps, setPumps]       = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false])
  const [logs, setLogs]         = useState<LogEntry[]>([])
  const clientRef               = useRef<mqtt.MqttClient | null>(null)

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

  return { status, sensors, lightStage, pumps, logs, setLight, togglePump }
}
