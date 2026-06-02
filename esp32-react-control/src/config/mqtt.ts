export const MQTT_CONFIG = {
  url:      (import.meta.env.VITE_MQTT_URL  as string | undefined) ?? 'wss://bbbf987f8d724af8a134f9d5e214d5ac.s1.eu.hivemq.cloud:8884/mqtt',
  username: (import.meta.env.VITE_MQTT_USER as string | undefined) ?? 'esp32_user',
  password: (import.meta.env.VITE_MQTT_PASS as string | undefined) ?? '7879Tmf73@',
} as const

export const TOPICS = {
  data:      'biocore/dados',
  light:     'biocore/cmd/luz',
  pump:      (n: 1 | 2 | 3 | 4) => `biocore/cmd/bomba${n}`,
  hortalica: 'biocore/config/hortalica',
} as const
