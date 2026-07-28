import { useEffect, useRef, useState, useCallback } from 'react'
import { plantVoiceService } from '../services/plantVoiceService'
import type { ConnectionStatus, SensorData, LightStage, VoiceState } from '../types'
import type { DadosPlanta } from './useMqtt'

interface UsePlantVoiceParams {
  status: ConnectionStatus
  sensors: SensorData | null
  lightStage: LightStage
  pumps: [boolean, boolean, boolean, boolean]
  hortalica: DadosPlanta
}

export function usePlantVoice({
  status,
  sensors,
  lightStage,
  pumps,
  hortalica,
}: UsePlantVoiceParams) {
  const [voiceState, setVoiceState] = useState<VoiceState>(plantVoiceService.getState())

  // Referências para salvar estados anteriores e evitar mensagens duplicadas
  const prevStatusRef = useRef<ConnectionStatus>(status)
  const prevLightStageRef = useRef<LightStage>(lightStage)
  const prevPumpsRef = useRef<[boolean, boolean, boolean, boolean]>(pumps)
  const prevSoilStateRef = useRef<'dry' | 'ok' | 'unknown'>('unknown')
  const prevTempStateRef = useRef<'hot' | 'cold' | 'normal' | 'unknown'>('unknown')
  const initialGreetingDoneRef = useRef<boolean>(false)
  const isHydratedRef = useRef<boolean>(false)

  // Ignora os disparos dos useEffects durante a hidratação inicial do app (primeiros 1.5s pós-montagem)
  useEffect(() => {
    const timer = setTimeout(() => {
      isHydratedRef.current = true
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Inscreve no serviço de voz para atualizar o estado do React
  useEffect(() => {
    const unsubscribe = plantVoiceService.subscribe(setVoiceState)
    return () => {
      unsubscribe()
    }
  }, [])

  // Gerador da fala de resumo do estado atual
  const speakCurrentSummary = useCallback(() => {
    if (!sensors) {
      if (status !== 'connected') {
        plantVoiceService.speakKey('connection_error')
      } else {
        plantVoiceService.speakKey('connecting')
      }
      return
    }

    const dryThreshold = hortalica.u_solo - 12
    const isDry = sensors.u_solo < dryThreshold
    const isHot = sensors.temp >= 35
    const isCold = sensors.temp <= 15

    if (isHot) {
      plantVoiceService.speakKey('temp_hot')
    } else if (isCold) {
      plantVoiceService.speakKey('temp_cold')
    } else if (isDry) {
      plantVoiceService.speakKey('soil_dry')
    } else {
      plantVoiceService.speakKey('greeting_ok')
    }
  }, [sensors, status, hortalica])

  // 1. Reação a Mudanças no Status de Conexão (Connecting, Connected, Offline, Error, Disconnected)
  useEffect(() => {
    const prevStatus = prevStatusRef.current

    if (status === 'connecting' && prevStatus !== 'connecting') {
      // Só fala "Conectando..." se a conexão demorar mais de 2.5s (evita cortar/interromper o áudio na conexão rápida)
      const timer = setTimeout(() => {
        if (prevStatusRef.current === 'connecting') {
          plantVoiceService.speakKey('connecting')
        }
      }, 2500)

      return () => clearTimeout(timer)
    } else if (
      (status === 'offline' || status === 'error' || status === 'disconnected') &&
      prevStatus !== status
    ) {
      plantVoiceService.speakKey('connection_error')
    }

    prevStatusRef.current = status
  }, [status])

  // 2. Reação a Mudanças nas Bombas (Nutrientes N, P, K e Água) - Apenas após hidratação inicial
  useEffect(() => {
    const prevPumps = prevPumpsRef.current

    if (isHydratedRef.current) {
      // Bomba 0: Nitrogênio (N)
      if (prevPumps[0] !== pumps[0]) {
        if (pumps[0]) {
          plantVoiceService.speakKey('pump_n')
        } else {
          plantVoiceService.speakKey('pump_n_off')
        }
      }

      // Bomba 1: Fósforo (P)
      if (prevPumps[1] !== pumps[1]) {
        if (pumps[1]) {
          plantVoiceService.speakKey('pump_p')
        } else {
          plantVoiceService.speakKey('pump_p_off')
        }
      }

      // Bomba 2: Potássio (K)
      if (prevPumps[2] !== pumps[2]) {
        if (pumps[2]) {
          plantVoiceService.speakKey('pump_k')
        } else {
          plantVoiceService.speakKey('pump_k_off')
        }
      }

      // Bomba 3: Água H2O
      if (prevPumps[3] !== pumps[3]) {
        if (pumps[3]) {
          plantVoiceService.speakKey('pump_on')
        } else {
          plantVoiceService.speakKey('pump_off')
        }
      }
    }

    prevPumpsRef.current = pumps
  }, [pumps])

  // 3. Reação a Mudanças na Iluminação - Apenas após hidratação inicial
  useEffect(() => {
    const prevLight = prevLightStageRef.current
    if (prevLight !== lightStage) {
      if (isHydratedRef.current) {
        if (prevLight === 0 && lightStage > 0) {
          plantVoiceService.speakKey('light_on')
        } else if (prevLight > 0 && lightStage === 0) {
          plantVoiceService.speakKey('light_off')
        }
      }
      prevLightStageRef.current = lightStage
    }
  }, [lightStage])

  // 4. Reação aos Dados dos Sensores (Umidade do Solo e Temperatura)
  useEffect(() => {
    if (!sensors) return

    const dryThreshold = hortalica.u_solo - 12
    const currentSoilState: 'dry' | 'ok' = sensors.u_solo < dryThreshold ? 'dry' : 'ok'
    const prevSoilState = prevSoilStateRef.current

    // Fala inicial de recepção/boas-vindas na primeira leitura de sensores válida
    if (!initialGreetingDoneRef.current && status === 'connected') {
      initialGreetingDoneRef.current = true
      prevSoilStateRef.current = currentSoilState
      speakCurrentSummary()
      return
    }

    // Transição da umidade do solo
    if (prevSoilState !== 'unknown' && prevSoilState !== currentSoilState) {
      prevSoilStateRef.current = currentSoilState

      if (currentSoilState === 'dry') {
        plantVoiceService.speakKey('soil_dry')
      } else if (currentSoilState === 'ok' && prevSoilState === 'dry') {
        plantVoiceService.speakKey('soil_ok')
      }
    } else if (prevSoilState === 'unknown') {
      prevSoilStateRef.current = currentSoilState
    }

    // Transição de Temperatura Extrema
    const currentTempState: 'hot' | 'cold' | 'normal' = 
      sensors.temp >= 35 ? 'hot' : sensors.temp <= 15 ? 'cold' : 'normal'
    const prevTempState = prevTempStateRef.current

    if (prevTempState !== 'unknown' && prevTempState !== currentTempState) {
      prevTempStateRef.current = currentTempState
      if (currentTempState === 'hot') {
        plantVoiceService.speakKey('temp_hot')
      } else if (currentTempState === 'cold') {
        plantVoiceService.speakKey('temp_cold')
      }
    } else if (prevTempState === 'unknown') {
      prevTempStateRef.current = currentTempState
    }
  }, [sensors, hortalica, status, speakCurrentSummary])

  // 5. Tratamento de Retorno do Aplicativo do Segundo Plano (VisibilityChange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (status === 'connected' && sensors) {
          speakCurrentSummary()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [status, sensors, speakCurrentSummary])

  const toggleVoice = useCallback(() => {
    return plantVoiceService.toggleEnabled()
  }, [])

  const setVolume = useCallback((volume: number) => {
    plantVoiceService.setVolume(volume)
  }, [])

  const stopVoice = useCallback(() => {
    plantVoiceService.stop()
  }, [])

  return {
    ...voiceState,
    toggleVoice,
    setVolume,
    stopVoice,
    speakSummary: speakCurrentSummary,
  }
}
