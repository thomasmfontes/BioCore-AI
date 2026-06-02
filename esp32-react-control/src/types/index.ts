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
