import type { VoiceAudioKey, VoicePriority, VoiceSettings, VoiceState } from '../types'

const PRIORITY_MAP: Record<VoicePriority, number> = {
  critical: 3,
  warning: 2,
  info: 1,
}

const STORAGE_KEY = 'biocore_voice_settings'

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  volume: 1,
  pitch: 1.0,
  rate: 1.0,
  lang: 'pt-BR',
}

export interface PhraseVariation {
  text: string
  audioUrl: string
  legacyAudioUrl?: string
}

export interface AudioPhraseDefinition {
  key: VoiceAudioKey
  priority: VoicePriority
  variations: PhraseVariation[]
}

export const AUDIO_PHRASES: Record<VoiceAudioKey, AudioPhraseDefinition> = {
  greeting_ok: {
    key: 'greeting_ok',
    priority: 'info',
    variations: [
      {
        text: 'Olá! Está tudo bem comigo. A umidade e a temperatura estão adequadas.',
        audioUrl: '/audio/greeting_ok_1.wav',
        legacyAudioUrl: '/audio/greeting_ok.wav',
      },
      {
        text: 'Oi! Tudo em ordem com meu cultivo. Estou me sentindo ótima hoje!',
        audioUrl: '/audio/greeting_ok_2.wav',
      },
      {
        text: 'Tudo tranquilo por aqui. Meus parâmetros vitais estão todos equilibrados.',
        audioUrl: '/audio/greeting_ok_3.wav',
      },
    ],
  },
  soil_dry: {
    key: 'soil_dry',
    priority: 'warning',
    variations: [
      {
        text: 'Meu solo está um pouco seco. Você pode me regar?',
        audioUrl: '/audio/soil_dry_1.wav',
        legacyAudioUrl: '/audio/soil_dry.wav',
      },
      {
        text: 'Estou ficando com sede! Que tal uma regada com água fresca?',
        audioUrl: '/audio/soil_dry_2.wav',
      },
      {
        text: 'Minha umidade caiu. Uma irrigação agora cairia muito bem!',
        audioUrl: '/audio/soil_dry_3.wav',
      },
    ],
  },

  soil_ok: {
    key: 'soil_ok',
    priority: 'info',
    variations: [
      {
        text: 'Obrigada! Agora minha umidade está adequada.',
        audioUrl: '/audio/soil_ok_1.wav',
        legacyAudioUrl: '/audio/soil_ok.wav',
      },
      {
        text: 'Ah, que alívio! Água fresquinha recebida com sucesso.',
        audioUrl: '/audio/soil_ok_2.wav',
      },
      {
        text: 'Muito melhor! Minhas raízes agradecem a rega.',
        audioUrl: '/audio/soil_ok_3.wav',
      },
    ],
  },
  pump_on: {
    key: 'pump_on',
    priority: 'warning',
    variations: [
      {
        text: 'Minha bomba de água foi ligada.',
        audioUrl: '/audio/pump_on_1.wav',
        legacyAudioUrl: '/audio/pump_on.wav',
      },
      {
        text: 'Acionando o sistema de irrigação!',
        audioUrl: '/audio/pump_on_2.wav',
      },
    ],
  },
  pump_off: {
    key: 'pump_off',
    priority: 'info',
    variations: [
      {
        text: 'A bomba de água foi desligada.',
        audioUrl: '/audio/pump_off_1.wav',
        legacyAudioUrl: '/audio/pump_off.wav',
      },
      {
        text: 'Rega finalizada e bombas em repouso.',
        audioUrl: '/audio/pump_off_2.wav',
      },
    ],
  },
  pump_n: {
    key: 'pump_n',
    priority: 'info',
    variations: [
      {
        text: 'Dosando Nitrogênio! Isso vai deixar minhas folhas verdinhas e fortes.',
        audioUrl: '/audio/pump_n_1.wav',
      },
      {
        text: 'Reforço de Nitrogênio ativo para meu crescimento vegetativo.',
        audioUrl: '/audio/pump_n_2.wav',
      },
    ],
  },
  pump_n_off: {
    key: 'pump_n_off',
    priority: 'info',
    variations: [
      {
        text: 'Dosagem de Nitrogênio concluída.',
        audioUrl: '/audio/pump_n_off_1.wav',
        legacyAudioUrl: '/audio/pump_n_off.wav',
      },
      {
        text: 'Bomba de Nitrogênio desligada.',
        audioUrl: '/audio/pump_n_off_2.wav',
      },
    ],
  },
  pump_p: {
    key: 'pump_p',
    priority: 'info',
    variations: [
      {
        text: 'Dosando Fósforo! Perfeito para fortalecer minhas raízes.',
        audioUrl: '/audio/pump_p_1.wav',
      },
      {
        text: 'Carga de Fósforo acionada para potencializar minhas flores e estrutura.',
        audioUrl: '/audio/pump_p_2.wav',
      },
    ],
  },
  pump_p_off: {
    key: 'pump_p_off',
    priority: 'info',
    variations: [
      {
        text: 'Dosagem de Fósforo concluída.',
        audioUrl: '/audio/pump_p_off_1.wav',
        legacyAudioUrl: '/audio/pump_p_off.wav',
      },
      {
        text: 'Bomba de Fósforo desligada.',
        audioUrl: '/audio/pump_p_off_2.wav',
      },
    ],
  },
  pump_k: {
    key: 'pump_k',
    priority: 'info',
    variations: [
      {
        text: 'Dosando Potássio! Reforçando minha saúde e resistência.',
        audioUrl: '/audio/pump_k_1.wav',
      },
      {
        text: 'Nutrição com Potássio em andamento.',
        audioUrl: '/audio/pump_k_2.wav',
      },
    ],
  },
  pump_k_off: {
    key: 'pump_k_off',
    priority: 'info',
    variations: [
      {
        text: 'Dosagem de Potássio concluída.',
        audioUrl: '/audio/pump_k_off_1.wav',
        legacyAudioUrl: '/audio/pump_k_off.wav',
      },
      {
        text: 'Bomba de Potássio desligada.',
        audioUrl: '/audio/pump_k_off_2.wav',
      },
    ],
  },

  light_on: {
    key: 'light_on',
    priority: 'info',
    variations: [
      {
        text: 'Minha iluminação foi ligada. Hora de fazer fotossíntese!',
        audioUrl: '/audio/light_on_1.wav',
        legacyAudioUrl: '/audio/light_on.wav',
      },
      {
        text: 'Luzes acesas! Energia renovada para o meu crescimento.',
        audioUrl: '/audio/light_on_2.wav',
      },
    ],
  },
  light_off: {
    key: 'light_off',
    priority: 'info',
    variations: [
      {
        text: 'Minha iluminação foi desligada. Hora do meu ciclo noturno de descanso.',
        audioUrl: '/audio/light_off_1.wav',
        legacyAudioUrl: '/audio/light_off.wav',
      },
      {
        text: 'Luzes apagadas. Modo repouso ativado.',
        audioUrl: '/audio/light_off_2.wav',
      },
    ],
  },
  temp_hot: {
    key: 'temp_hot',
    priority: 'warning',
    variations: [
      {
        text: 'Aff, está muito quente por aqui! Preciso de um ambiente mais fresco.',
        audioUrl: '/audio/temp_hot_1.wav',
        legacyAudioUrl: '/audio/temp_hot.wav',
      },
      {
        text: 'Está fazendo um calor danado aqui no cultivo!',
        audioUrl: '/audio/temp_hot_2.wav',
      },
    ],
  },
  temp_cold: {
    key: 'temp_cold',
    priority: 'warning',
    variations: [
      {
        text: 'Brrr, está muito frio por aqui! Pode atrasar o meu desenvolvimento.',
        audioUrl: '/audio/temp_cold_1.wav',
        legacyAudioUrl: '/audio/temp_cold.wav',
      },
      {
        text: 'Que gelado! A temperatura caiu bastante por aqui.',
        audioUrl: '/audio/temp_cold_2.wav',
      },
    ],
  },
}

type VoiceStateListener = (state: VoiceState) => void

class PlantVoiceService {
  private settings: VoiceSettings
  private currentPriority: number = 0
  private currentMessage: string | null = null
  private isSpeaking: boolean = false
  private lastSpokenTime: number = 0
  private lastMessageKey: string = ''
  private variationIndices: Map<VoiceAudioKey, number> = new Map()
  private listeners: Set<VoiceStateListener> = new Set()
  private synth: SpeechSynthesis | null = null
  private selectedVoice: SpeechSynthesisVoice | null = null
  private activeAudio: HTMLAudioElement | null = null

  constructor() {
    this.settings = this.loadSettings()

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.initVoice()

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice()
      }
    }
  }

  private loadSettings(): VoiceSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_SETTINGS
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch {
      /* ignore */
    }
  }

  private initVoice() {
    if (!this.synth) return
    const voices = this.synth.getVoices()
    if (!voices.length) return

    const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'))
    if (ptVoice) {
      this.selectedVoice = ptVoice
    } else {
      this.selectedVoice = voices[0]
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const state = this.getState()
    this.listeners.forEach(l => l(state))
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      currentMessage: this.currentMessage,
      settings: { ...this.settings },
    }
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    
    if (this.activeAudio) {
      this.activeAudio.volume = this.settings.volume
    }

    if (!this.settings.enabled && this.isSpeaking) {
      this.stop()
    }

    this.notify()
  }

  public toggleEnabled(): boolean {
    const nextEnabled = !this.settings.enabled
    this.updateSettings({ enabled: nextEnabled })
    return nextEnabled
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume))
    this.updateSettings({ volume: clamped })
  }

  public stop() {
    if (this.activeAudio) {
      this.activeAudio.onplay = null
      this.activeAudio.onended = null
      this.activeAudio.onerror = null
      this.activeAudio.pause()
      this.activeAudio.currentTime = 0
      this.activeAudio = null
    }

    if (this.synth) {
      this.synth.cancel()
    }

    this.isSpeaking = false
    this.currentMessage = null
    this.currentPriority = 0
    this.notify()
  }

  /**
   * Obtém a próxima variação de frase para uma chave específica (faz rodízio para não repetir a mesma frase seguida)
   */
  private getNextVariation(key: VoiceAudioKey): PhraseVariation {
    const def = AUDIO_PHRASES[key]
    const currentIndex = this.variationIndices.get(key) ?? 0
    const variation = def.variations[currentIndex % def.variations.length]
    this.variationIndices.set(key, currentIndex + 1)
    return variation
  }

  /**
   * Reproduz uma variação de áudio gravado por chave, com fallback automático para Web Speech API.
   */
  public speakKey(key: VoiceAudioKey, force: boolean = false, customDynamicText?: string): boolean {
    const def = AUDIO_PHRASES[key]
    if (!def) return false

    const variation = this.getNextVariation(key)
    const messageText = customDynamicText || variation.text
    return this.speakPayload(variation.audioUrl, variation.legacyAudioUrl ?? null, messageText, def.priority, key, force)
  }

  public speakText(text: string, priority: VoicePriority = 'info', force: boolean = false): boolean {
    return this.speakPayload(null, null, text, priority, text, force)
  }

  private speakPayload(
    audioUrl: string | null,
    legacyAudioUrl: string | null,
    text: string,
    priority: VoicePriority,
    keyIdentifier: string,
    force: boolean
  ): boolean {
    if (!this.settings.enabled) {
      return false
    }

    const priorityVal = PRIORITY_MAP[priority]
    const now = Date.now()

    // Evita repetição contínua da mesma fala dentro de 8s (a menos que seja force ou prioridade crítica)
    if (!force && keyIdentifier === this.lastMessageKey && (now - this.lastSpokenTime < 8000) && priorityVal < 3) {
      return false
    }

    // Trava de intervalo mínimo (2.5s) entre QUALQUER fala para evitar que mensagens fiquem sobrepostas/encavaladas
    if (!force && (now - this.lastSpokenTime < 2500) && priorityVal < 3) {
      return false
    }

    // Se já estiver falando:
    if (this.isSpeaking) {
      // Se a nova mensagem tiver prioridade MAIOR ou se for forçada, interrompe o áudio em reprodução
      if (force || priorityVal > this.currentPriority) {
        this.stop()
      } else {
        // Se a prioridade for menor ou igual, ignora a nova fala para NÃO sobrepor áudios!
        return false
      }
    } else {
      // Garante que qualquer resíduo de áudio anterior esteja pausado e limpo
      this.stop()
    }

    // Tenta reproduzir arquivo de áudio
    if (audioUrl && typeof window !== 'undefined') {
      const playAudioFile = (urlToPlay: string, fallbackUrl?: string | null) => {
        let handledFailure = false

        const handleFailure = () => {
          if (handledFailure) return
          handledFailure = true

          // Se a tentativa principal falhou e há um fallbackUrl, tenta ele; se não, vai pro TTS
          if (fallbackUrl) {
            playAudioFile(fallbackUrl, null)
          } else {
            this.activeAudio = null
            this.speakFallbackTTS(text, priorityVal, keyIdentifier)
          }
        }

        const audio = new Audio(urlToPlay)
        audio.volume = this.settings.volume

        audio.onplay = () => {
          this.isSpeaking = true
          this.currentMessage = text
          this.currentPriority = priorityVal
          this.lastSpokenTime = Date.now()
          this.lastMessageKey = keyIdentifier
          this.activeAudio = audio
          this.notify()
        }

        audio.onended = () => {
          this.isSpeaking = false
          this.currentMessage = null
          this.currentPriority = 0
          this.activeAudio = null
          this.notify()
        }

        audio.onerror = () => {
          handleFailure()
        }

        audio.play().catch(() => {
          handleFailure()
        })
      }

      playAudioFile(audioUrl, legacyAudioUrl)
      return true
    }

    return this.speakFallbackTTS(text, priorityVal, keyIdentifier)
  }

  private speakFallbackTTS(text: string, priorityVal: number, keyIdentifier: string): boolean {
    if (!this.synth) return false

    if (!this.selectedVoice) {
      this.initVoice()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = this.settings.volume
    utterance.pitch = this.settings.pitch
    utterance.rate = this.settings.rate
    utterance.lang = this.settings.lang

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice
    }

    utterance.onstart = () => {
      this.isSpeaking = true
      this.currentMessage = text
      this.currentPriority = priorityVal
      this.lastSpokenTime = Date.now()
      this.lastMessageKey = keyIdentifier
      this.notify()
    }

    utterance.onend = () => {
      this.isSpeaking = false
      this.currentMessage = null
      this.currentPriority = 0
      this.notify()
    }

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.warn('[PlantVoiceService] TTS fallback error:', e)
      }
      this.isSpeaking = false
      this.currentMessage = null
      this.currentPriority = 0
      this.notify()
    }

    try {
      this.synth.cancel()
      this.synth.speak(utterance)
      return true
    } catch {
      return false
    }
  }
}

export const plantVoiceService = new PlantVoiceService()
