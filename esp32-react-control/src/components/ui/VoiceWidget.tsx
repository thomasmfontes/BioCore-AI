import { useEffect, useState, useRef } from 'react'

interface VoiceWidgetProps {
  isSpeaking: boolean
  currentMessage: string | null
  stopVoice: () => void
  plantEmoji?: string
}

export function VoiceWidget({
  isSpeaking,
  currentMessage,
  stopVoice,
  plantEmoji = '🌱',
}: VoiceWidgetProps) {
  const [displayMessage, setDisplayMessage] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isSpeaking && currentMessage) {
      // Limpa qualquer timeout de saída pendente
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
        exitTimeoutRef.current = null
      }
      setDisplayMessage(currentMessage)
      setIsExiting(false)
    } else if (!isSpeaking && displayMessage && !isExiting) {
      // Inicia a animação de saída suave quando a fala termina
      setIsExiting(true)
      exitTimeoutRef.current = setTimeout(() => {
        setDisplayMessage(null)
        setIsExiting(false)
      }, 300) // Duração correspondente a animate-toastExit (280ms/300ms)
    }

    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [isSpeaking, currentMessage, displayMessage, isExiting])

  useEffect(() => {
    const isVisible = !!displayMessage && !isExiting
    window.dispatchEvent(new CustomEvent('biocore-voicewidget-status', { detail: { isVisible } }))
  }, [displayMessage, isExiting])

  const handleClose = () => {
    setIsExiting(true)
    stopVoice()
    exitTimeoutRef.current = setTimeout(() => {
      setDisplayMessage(null)
      setIsExiting(false)
    }, 300)
  }

  // Se não houver mensagem para exibir e não estiver em transição de saída, ignora
  if (!displayMessage) return null

  return (
    <div className="fixed top-[calc(4.5rem+env(safe-area-inset-top))] left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-50 pointer-events-auto">
      <div
        className={`bg-[#181c1f]/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(44,184,116,0.15)] flex items-center gap-3.5 transition-all duration-300 ${
          isExiting ? 'animate-toastExit' : 'animate-toastEnter'
        }`}
      >
        {/* Avatar da Planta */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high/80 border border-primary/20 text-primary flex-shrink-0">
          <span className="text-xl select-none">{plantEmoji}</span>
        </div>

        {/* Conteúdo: Título, Equalizador e Mensagem */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">
              Voz da Planta
            </span>

            {/* Equalizador de Áudio Realista (Ondas Sonoras) */}
            <div className="flex items-end gap-0.5 h-4 px-1">
              <span className="w-0.5 bg-primary rounded-full sound-wave-bar sound-wave-bar-1" />
              <span className="w-0.5 bg-primary rounded-full sound-wave-bar sound-wave-bar-2" />
              <span className="w-0.5 bg-primary rounded-full sound-wave-bar sound-wave-bar-3" />
              <span className="w-0.5 bg-primary rounded-full sound-wave-bar sound-wave-bar-4" />
            </div>
          </div>


          <p className="text-xs text-on-surface font-semibold italic leading-snug line-clamp-2">
            "{displayMessage}"
          </p>
        </div>

        {/* Botão de Fechar / Silenciar */}
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-xl bg-surface-container-highest/50 hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          title="Silenciar fala"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  )
}
