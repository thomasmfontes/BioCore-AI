/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_MQTT_URL?: string
  readonly VITE_MQTT_USER?: string
  readonly VITE_MQTT_PASS?: string
  readonly VITE_CAMERA_STREAM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
