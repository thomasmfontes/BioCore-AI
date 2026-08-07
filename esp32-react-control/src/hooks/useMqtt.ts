import { useState, useEffect, useRef, useCallback } from 'react'
import mqtt from 'mqtt'
import { MQTT_CONFIG, TOPICS } from '../config/mqtt'
import type { SensorData, ConnectionStatus, LightStage, LogEntry } from '../types'
import { 
  salvarTelemetria, 
  salvarControleLuzHoje, 
  registrarAtuacao, 
  iniciarAtuacao,
  finalizarAtuacao,
  getCultivoAtivo, 
  salvarCultivoAtivo, 
  getHistoricoEventos,
  atualizarStatusDispositivo
} from '../services/supabaseService'

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
  temp_amb: number     // °C temperatura ambiente alvo
  u_amb: number        // % umidade ambiente alvo
  temp_solo: number    // °C temperatura solo alvo
  descricaoIA: string  // texto contextual exibido no Modo Inteligente
  imagemUrl: string    // foto real de fundo
}

export const BANCO_HORTALICAS: Record<ChavePlanta, DadosPlanta> = {
  alface: {
    chave: 'alface',
    nome: 'Alface Crespa',
    emoji: '🥬',
    imagemUrl: '/alface-crespa.jpg',
    u_solo: 70,
    fotoperiodo: 14,
    N: 150, P: 40, K: 180,
    temp_amb: 20.0,
    u_amb: 65,
    temp_solo: 18.0,
    descricaoIA: 'Folhosa de clima ameno (20°C). Exige solo bem úmido (70%), NPK foliar (150-40-180 mg/kg) e fotoperíodo de 14h.',
  },
  tomate: {
    chave: 'tomate',
    nome: 'Tomate Cereja',
    emoji: '🍅',
    imagemUrl: '/tomate-cereja.jpg',
    u_solo: 65,
    fotoperiodo: 16,
    N: 180, P: 60, K: 250,
    temp_amb: 25.0,
    u_amb: 60,
    temp_solo: 21.0,
    descricaoIA: 'Frutífera de alto DLI (16h) e temperatura (25°C). Elevado consumo de Potássio e Nitrogênio (180-60-250 mg/kg).',
  },
  manjericao: {
    chave: 'manjericao',
    nome: 'Manjericão',
    emoji: '🌿',
    imagemUrl: '/manjericao.jpg',
    u_solo: 55,
    fotoperiodo: 14,
    N: 120, P: 35, K: 160,
    temp_amb: 24.0,
    u_amb: 60,
    temp_solo: 22.0,
    descricaoIA: 'Erva aromática termófila (24°C). Solo drenado (55%), NPK para óleos essenciais (120-35-160 mg/kg) e fotoperíodo de 14h.',
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
  smartMode: boolean
  setLight: (stage: LightStage) => void
  togglePump: (index: 0 | 1 | 2 | 3) => void
  alterarHortalica: (chave: ChavePlanta) => void
  toggleSmartMode: (mode: boolean) => void
  resetWifi: () => void
}

let _id = 0

function makeLog(message: string): LogEntry {
  return {
    id: ++_id,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    message,
  }
}

function pushLog(log: LogEntry, prev: LogEntry[]): LogEntry[] {
  // Evita duplicatas consecutivas registradas no mesmo segundo com a mesma mensagem
  if (prev.length > 0 && prev[0].time === log.time && prev[0].message === log.message) {
    return prev
  }
  return [log, ...prev].slice(0, 50)
}

const STORAGE_LUZ_KEY    = 'biocore_luz_stage'
const STORAGE_BOMBAS_KEY = 'biocore_bombas_state'
const STORAGE_PLANTA_KEY = 'biocore_planta_ativa'

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useMqtt(): MqttState {
  const [status, setStatus]         = useState<ConnectionStatus>('disconnected')
  const [sensors, setSensors]       = useState<SensorData | null>(null)
  
  const [smartMode, setSmartModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('biocore_smart_mode')
      return saved === null ? true : saved === 'true'
    } catch {
      return true
    }
  })

  const [lightStage, setLightStageState] = useState<LightStage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LUZ_KEY)
      return saved !== null ? (Number(saved) as LightStage) : 0
    } catch {
      return 0
    }
  })

  const [pumps, setPumpsState]      = useState<[boolean, boolean, boolean, boolean]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOMBAS_KEY)
      return saved ? JSON.parse(saved) : [false, false, false, false]
    } catch {
      return [false, false, false, false]
    }
  })

  const pumpsRef = useRef<[boolean, boolean, boolean, boolean]>(pumps)
  const pumpStartTimesRef = useRef<(number | null)[]>([null, null, null, null])
  const pumpActiveRowIdsRef = useRef<(number | null)[]>([null, null, null, null])

  const activeLightRowIdRef = useRef<number | null>(null)
  const activeLightStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    pumpsRef.current = pumps
  }, [pumps])

  const [logs, setLogs]             = useState<LogEntry[]>([])

  const toggleSmartMode = useCallback((mode: boolean) => {
    clientRef.current?.publish(TOPICS.smart, mode ? '1' : '0', { retain: true })
    setSmartModeState(mode)
    try {
      localStorage.setItem('biocore_smart_mode', String(mode))
    } catch { /* ignore */ }

    // Salva no Supabase (Garante que nunca resete ao abrir o app!)
    salvarCultivoAtivo(mode)
    registrarAtuacao('BIOCORE_AI', undefined, mode ? 'Modo Autônomo ATIVADO' : 'Modo Autônomo DESATIVADO')

    setLogs(prev => pushLog(makeLog(`BioCore AI → ${mode ? 'ATIVADO' : 'DESATIVADO'}`), prev))
  }, [])
  
  const [hortalica, setHortalica]   = useState<DadosPlanta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLANTA_KEY) as ChavePlanta | null
      if (saved && BANCO_HORTALICAS[saved]) {
        return BANCO_HORTALICAS[saved]
      }
    } catch {
      /* ignore */
    }
    return BANCO_HORTALICAS.alface
  })

  const hortalicaRef = useRef<DadosPlanta>(hortalica)
  useEffect(() => {
    hortalicaRef.current = hortalica
  }, [hortalica])

  const lightStageRef = useRef<LightStage>(lightStage)
  useEffect(() => {
    lightStageRef.current = lightStage
  }, [lightStage])

  // Rastreamento em tempo real do acúmulo de tempo de LED ativo
  const ledStartTimeRef = useRef<number | null>(lightStage > 0 ? Date.now() : null)
  const ledAccumulatedMsRef = useRef<number>(0)

  const getTempoLedMs = useCallback(() => {
    const decorrido = ledStartTimeRef.current ? (Date.now() - ledStartTimeRef.current) : 0
    return ledAccumulatedMsRef.current + decorrido
  }, [])
  
  const clientRef                   = useRef<mqtt.MqttClient | null>(null)

  const setLight = useCallback((stage: LightStage) => {
    clientRef.current?.publish(TOPICS.light, String(stage), { retain: true })
    setLightStageState(stage)
    try {
      localStorage.setItem(STORAGE_LUZ_KEY, String(stage))
    } catch { /* ignore */ }

    // Atualiza contadores de tempo LED
    if (stage > 0) {
      if (ledStartTimeRef.current === null) {
        ledStartTimeRef.current = Date.now()
      }
    } else {
      if (ledStartTimeRef.current !== null) {
        ledAccumulatedMsRef.current += (Date.now() - ledStartTimeRef.current)
        ledStartTimeRef.current = null
      }
    }

    const currentLedMs = getTempoLedMs()
    salvarControleLuzHoje({
      vl_estagio_luz_atual: stage,
      vl_fotoperiodo_meta_hs: hortalicaRef.current.fotoperiodo,
      vl_tempo_led_acumulado_ms: Math.round(currentLedMs),
    })

    const labels = ['Desligada', '25%', '50%', '100%']

    // Se a luz estava ligada anteriormente, finaliza a atuação anterior preenchendo dt_fim e vl_duracao_ms
    if (activeLightStartTimeRef.current) {
      const duracao = Date.now() - activeLightStartTimeRef.current
      finalizarAtuacao(activeLightRowIdRef.current, duracao, 'LED_PWM', `Manual - Brilho em ${labels[stage]}`, activeLightStartTimeRef.current)
      activeLightRowIdRef.current = null
      activeLightStartTimeRef.current = null
    }

    // Se o novo estágio for ligado (> 0), inicia nova atuação deixando dt_fim = NULL enquanto ativa
    if (stage > 0) {
      activeLightStartTimeRef.current = Date.now()
      iniciarAtuacao('LED_PWM', `Manual - Brilho em ${labels[stage]}`).then(rowId => {
        activeLightRowIdRef.current = rowId
      })
    }

    setLogs(prev => pushLog(makeLog(`Luz → ${labels[stage]}`), prev))
  }, [getTempoLedMs])

  const togglePump = useCallback((index: 0 | 1 | 2 | 3) => {
    const currentValue = pumpsRef.current[index]
    const newValue = !currentValue

    const next = [...pumpsRef.current] as [boolean, boolean, boolean, boolean]
    next[index] = newValue
    setPumpsState(next)

    clientRef.current?.publish(TOPICS.pump((index + 1) as 1 | 2 | 3 | 4), newValue ? '1' : '0', { retain: true })
    try {
      localStorage.setItem(STORAGE_BOMBAS_KEY, JSON.stringify(next))
    } catch { /* ignore */ }

    const names = ['Bomba N', 'Bomba P', 'Bomba K', 'Bomba Água']
    const tpAtuadores: ('BOMBA_N' | 'BOMBA_P' | 'BOMBA_K' | 'BOMBA_H2O')[] = ['BOMBA_N', 'BOMBA_P', 'BOMBA_K', 'BOMBA_H2O']

    if (newValue) {
      // 🟢 LIGOU: Insere linha no Supabase com dt_inicio = NOW(), dt_fim = NULL enquanto ligada!
      pumpStartTimesRef.current[index] = Date.now()
      iniciarAtuacao(tpAtuadores[index], 'Manual (Aplicativo)').then(rowId => {
        pumpActiveRowIdsRef.current[index] = rowId
      })
    } else {
      // 🔴 DESLIGOU: Atualiza a linha existente no Supabase preenchendo dt_fim = NOW() e vl_duracao_ms!
      const inicioMs = pumpStartTimesRef.current[index] || Date.now()
      const duracaoMs = Date.now() - inicioMs
      const activeRowId = pumpActiveRowIdsRef.current[index]

      pumpStartTimesRef.current[index] = null
      pumpActiveRowIdsRef.current[index] = null

      finalizarAtuacao(activeRowId, duracaoMs, tpAtuadores[index], 'Manual (Aplicativo)', inicioMs)
    }

    setLogs(p => pushLog(makeLog(`${names[index]} → ${newValue ? 'ON' : 'OFF'}`), p))
  }, [])

  const alterarHortalica = useCallback((chave: ChavePlanta) => {
    const planta = BANCO_HORTALICAS[chave]
    setHortalica(planta)

    try {
      localStorage.setItem(STORAGE_PLANTA_KEY, chave)
    } catch {
      /* ignore */
    }

    // Mapeamento correto com as chaves primárias da tabela t_hortalica no Supabase
    const mapaSupabase: Record<ChavePlanta, string> = {
      alface: 'ALFACE',
      manjericao: 'MANJERICAO',
      tomate: 'TOMATE_CEREJA'
    }

    // Salva a alteração no Supabase
    salvarCultivoAtivo(smartMode, mapaSupabase[chave])
    salvarControleLuzHoje({
      vl_fotoperiodo_meta_hs: planta.fotoperiodo,
      vl_tempo_led_acumulado_ms: Math.round(getTempoLedMs()),
      vl_estagio_luz_atual: lightStageRef.current
    })

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
  }, [smartMode, getTempoLedMs])

  useEffect(() => {
    setStatus('connecting')
    setLogs([makeLog('Sincronizando com Supabase e broker MQTT...')])

    // 1. Restaura o estado persistente do Supabase no Boot
    getCultivoAtivo().then(cultivo => {
      if (cultivo) {
        if (typeof cultivo.st_modo_inteligente === 'boolean') {
          const mode = cultivo.st_modo_inteligente
          setSmartModeState(mode)
          try { localStorage.setItem('biocore_smart_mode', String(mode)) } catch { /* ignore */ }
          clientRef.current?.publish(TOPICS.smart, mode ? '1' : '0', { retain: true })
        }
        if (cultivo.cd_hortalica) {
          const cd = cultivo.cd_hortalica.toUpperCase()
          let keyFound: ChavePlanta = 'alface'
          if (cd.includes('TOMATE')) keyFound = 'tomate'
          else if (cd.includes('MANJERICAO')) keyFound = 'manjericao'
          else if (cd.includes('ALFACE')) keyFound = 'alface'

          setHortalica(BANCO_HORTALICAS[keyFound])
        }
      }
    })

    // 2. Restaura histórico persistente de eventos
    getHistoricoEventos().then(eventos => {
      if (eventos && eventos.length > 0) {
        setLogs(eventos)
      }
    })

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
      client.subscribe(TOPICS.hortalica)
      client.subscribe(TOPICS.light)
      client.subscribe(TOPICS.pump(1))
      client.subscribe(TOPICS.pump(2))
      client.subscribe(TOPICS.pump(3))
      client.subscribe(TOPICS.pump(4))
      client.subscribe(TOPICS.smart)
      setLogs(prev => pushLog(makeLog('Hardware online'), prev))
    })


    client.on('message', (topic, payload) => {
      const payloadStr = payload.toString()

      // 0. Chave SmartMode
      if (topic === TOPICS.smart) {
        const isSmart = payloadStr === '1' || payloadStr === 'true'
        setSmartModeState(isSmart)
        try { localStorage.setItem('biocore_smart_mode', String(isSmart)) } catch { /* ignore */ }
        return
      }


      // 1. Hortaliça ativa
      if (topic === TOPICS.hortalica) {
        try {
          const config = JSON.parse(payloadStr)
          const chaveEncontrada = (Object.keys(BANCO_HORTALICAS) as ChavePlanta[]).find(
            k => BANCO_HORTALICAS[k].nome.toLowerCase() === config.planta?.toLowerCase()
          )
          if (chaveEncontrada) {
            setHortalica(BANCO_HORTALICAS[chaveEncontrada])
            try {
              localStorage.setItem(STORAGE_PLANTA_KEY, chaveEncontrada)
            } catch { /* ignore */ }
          }
        } catch { /* payload malformado */ }
        return
      }

      // 2. Iluminação LED
      if (topic === TOPICS.light) {
        const stage = Number(payloadStr) as LightStage
        if (!isNaN(stage) && [0, 1, 2, 3].includes(stage)) {
          setLightStageState(prev => {
            if (prev !== stage) {
              const labels = ['Desligada', '25%', '50%', '100%']
              registrarAtuacao('LED_PWM', undefined, `Suplementação/Ajuste de Luz (${labels[stage]})`)
              salvarControleLuzHoje({
                vl_estagio_luz_atual: stage,
                vl_fotoperiodo_meta_hs: hortalicaRef.current.fotoperiodo,
                vl_tempo_led_acumulado_ms: Math.round(getTempoLedMs())
              })
            }
            return stage
          })
          try {
            localStorage.setItem(STORAGE_LUZ_KEY, String(stage))
          } catch { /* ignore */ }
        }
        return
      }

      // 3. Bombas Hidráulicas N, P, K, H2O (bomba1, bomba2, bomba3, bomba4)
      if (topic.startsWith('biocore/cmd/bomba')) {
        const numStr = topic.replace('biocore/cmd/bomba', '')
        const idx = parseInt(numStr, 10) - 1
        if (idx >= 0 && idx <= 3) {
          const isON = payloadStr === '1'
          setPumpsState(prev => {
            if (prev[idx] === isON) return prev
            const next = [...prev] as [boolean, boolean, boolean, boolean]
            next[idx] = isON

            const tpAtuadores: ('BOMBA_N' | 'BOMBA_P' | 'BOMBA_K' | 'BOMBA_H2O')[] = ['BOMBA_N', 'BOMBA_P', 'BOMBA_K', 'BOMBA_H2O']
            
            if (isON) {
              pumpStartTimesRef.current[idx] = Date.now()
            } else {
              // Quando o ESP32 desliga a bomba, calcula duração e grava 1 evento completo no Supabase
              const inicioMs = pumpStartTimesRef.current[idx] || Date.now()
              const fimMs = Date.now()
              const duracaoMs = fimMs - inicioMs
              pumpStartTimesRef.current[idx] = null

              registrarAtuacao(tpAtuadores[idx], duracaoMs, 'Acionamento Autônomo (BioCore AI)', inicioMs, fimMs)
            }

            try {
              localStorage.setItem(STORAGE_BOMBAS_KEY, JSON.stringify(next))
            } catch { /* ignore */ }
            return next
          })
        }
        return
      }

      // 4. Telemetria dos Sensores do ESP32 Físico
      if (topic === TOPICS.data) {
        try {
          const dataParsed = JSON.parse(payloadStr) as SensorData
          setSensors(dataParsed)
          // O ESP32 físico acabou de responder! Atualiza para ONLINE no Supabase:
          atualizarStatusDispositivo('ONLINE')
          salvarTelemetria(dataParsed)
          if (typeof dataParsed.sol_ms === 'number' || typeof dataParsed.led_ms === 'number') {
            const solMs = dataParsed.sol_ms ?? 0
            const ledMs = typeof dataParsed.led_ms === 'number' ? dataParsed.led_ms : Math.round(getTempoLedMs())
            const metaHs = hortalicaRef.current.fotoperiodo
            const metaMs = metaHs * 3600000
            const concluida = (solMs + ledMs) >= metaMs

            salvarControleLuzHoje({
              vl_tempo_sol_acumulado_ms: solMs,
              vl_tempo_led_acumulado_ms: ledMs,
              vl_fotoperiodo_meta_hs: metaHs,
              st_compensacao_concluida: concluida,
              vl_estagio_luz_atual: lightStageRef.current,
            })
          }
        } catch { /* payload malformado */ }
      }
    })

    client.on('offline',   () => { setStatus('offline');  atualizarStatusDispositivo('OFFLINE'); setLogs(prev => pushLog(makeLog('Hardware offline'), prev)) })
    client.on('error',     () => { setStatus('error');    atualizarStatusDispositivo('OFFLINE'); setLogs(prev => pushLog(makeLog('Erro de conexão'), prev)) })
    client.on('reconnect', () => { setStatus('connecting') })

    return () => { client.end(true) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetWifi = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected) return
    clientRef.current.publish(TOPICS.resetWifi, '1')
    setLogs(prev => pushLog(makeLog('Comando de reset de Wi-Fi enviado ao vaso'), prev))
  }, [])

  return { status, sensors, lightStage, pumps, logs, hortalica, smartMode, setLight, togglePump, alterarHortalica, toggleSmartMode, resetWifi }
}

