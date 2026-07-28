export interface SensorData {
  N: number
  P: number
  K: number
  temp: number
  u_solo: number
  u_amb: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'offline'

export type LightStage = 0 | 1 | 2 | 3

export interface LogEntry {
  id: number
  time: string
  message: string
}

export type VoicePriority = 'critical' | 'warning' | 'info'

export type VoiceAudioKey =
  | 'greeting_ok'
  | 'soil_dry'
  | 'soil_ok'
  | 'pump_on'
  | 'pump_off'
  | 'pump_n'
  | 'pump_n_off'
  | 'pump_p'
  | 'pump_p_off'
  | 'pump_k'
  | 'pump_k_off'
  | 'light_on'
  | 'light_off'
  | 'temp_hot'
  | 'temp_cold'
  | 'connection_error'
  | 'connecting'



export interface VoiceSettings {
  enabled: boolean
  volume: number // 0 a 1
  pitch: number  // 0.5 a 1.5
  rate: number   // 0.5 a 1.5
  lang: string   // ex: 'pt-BR'
}

export interface VoiceState {
  isSpeaking: boolean
  currentMessage: string | null
  settings: VoiceSettings
}


