import React, { useState, useEffect } from 'react'
import { Trophy, X, AlertTriangle, RotateCw, ExternalLink } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ParticipanteSorteio } from '../../types'
import { marcarParticipanteSorteado } from '../../services/sorteioService'
import { WhatsAppIcon } from './WhatsAppIcon'

interface SorteadorModalProps {
  isOpen: boolean
  onClose: () => void
  participantes: ParticipanteSorteio[]
  onWinnerSelected: (ganhador: ParticipanteSorteio) => void
}

// Instância compartilhada de AudioContext para não exceder o limite do navegador
let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return null
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx()
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume()
    }
    return sharedAudioCtx
  } catch {
    return null
  }
}

// Síntese de áudio nativa para suspense mecânico e fanfarra
function playTick(freq = 600) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.03)
  } catch {
    // Ignora restrições de autoplay
  }
}

function playWinChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notas = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.08)
      gain.gain.setValueAtTime(0.08, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.45)
    })
  } catch {}
}

export function SorteadorModal({
  isOpen,
  onClose,
  participantes,
  onWinnerSelected
}: SorteadorModalProps) {
  const [fase, setFase] = useState<'pronto' | 'girando' | 'ganhador'>('pronto')
  const [ganhador, setGanhador] = useState<ParticipanteSorteio | null>(null)

  // Estados dinâmicos da roleta mecânica
  const [nomesRoleta, setNomesRoleta] = useState<{
    anterior: string
    atual: string
    proximo: string
  }>({ anterior: '', atual: '', proximo: '' })
  const [progresso, setProgresso] = useState(0)

  // Participantes elegíveis: quem confirmou o voto
  const elegiveis = participantes.filter(p => p.votou_confirmado)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setFase('pronto')
      setGanhador(null)
      setProgresso(0)
      setNomesRoleta({ anterior: '', atual: '', proximo: '' })
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Disparar confetes elegantes quando o ganhador for revelado (idêntico à tela de sucesso)
  useEffect(() => {
    if (fase === 'ganhador' && ganhador) {
      playWinChime()
      navigator.vibrate?.([30, 50, 30])

      // Efeito de confetes nas cores oficiais do BioCore AI (apenas verdes e brancos)
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#5af09d', '#ffffff', '#48e08f'],
        zIndex: 9999
      })

      const timer = setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 45,
          origin: { x: 0.05, y: 0.7 },
          colors: ['#5af09d', '#ffffff', '#48e08f'],
          zIndex: 9999
        })
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 45,
          origin: { x: 0.95, y: 0.7 },
          colors: ['#5af09d', '#ffffff', '#48e08f'],
          zIndex: 9999
        })
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [fase, ganhador])

  if (!isOpen) return null

  const iniciarSorteio = () => {
    if (elegiveis.length === 0) return

    // 1. Escolher o vencedor aleatoriamente entre os elegíveis
    const sortearIndice = () => Math.floor(Math.random() * elegiveis.length)
    const escolhido = elegiveis[sortearIndice()]

    const totalCiclos = 38 // Quantidade total de giros até travar

    // 2. Montar uma fita contínua (tape) onde participantes adjacentes NUNCA se repetem
    const fita: string[] = []
    let ultimoNome = ''

    for (let i = 0; i <= totalCiclos + 2; i++) {
      if (i === totalCiclos) {
        // Na posição exata do final, cravamos o vencedor
        fita.push(escolhido.nome_completo)
        ultimoNome = escolhido.nome_completo
      } else {
        // Filtrar para que o próximo nunca seja igual ao anterior nem ao vencedor (se estiver logo antes)
        const candidatos = elegiveis.filter(p => {
          if (p.nome_completo === ultimoNome) return false
          if (i === totalCiclos - 1 && p.nome_completo === escolhido.nome_completo) return false
          if (i === totalCiclos + 1 && p.nome_completo === escolhido.nome_completo) return false
          return true
        })

        const pool = candidatos.length > 0 ? candidatos : elegiveis
        const aleatorio = pool[Math.floor(Math.random() * pool.length)]
        fita.push(aleatorio.nome_completo)
        ultimoNome = aleatorio.nome_completo
      }
    }

    setFase('girando')
    setProgresso(0)
    let contador = 0
    let delay = 50 // Começa rápido

    const step = () => {
      contador++

      // O índice atual do visor é o contador
      const nomeAnterior = fita[contador - 1] || elegiveis[0]?.nome_completo || ''
      const nomeAtual = fita[contador] || escolhido.nome_completo
      const nomeProximo = fita[contador + 1] || elegiveis[1]?.nome_completo || ''

      setNomesRoleta({
        anterior: nomeAnterior,
        atual: nomeAtual,
        proximo: nomeProximo
      })

      const progressoAtual = Math.min(100, Math.round((contador / totalCiclos) * 100))
      setProgresso(progressoAtual)

      // Feedback sonoro e tátil crescente
      playTick(450 + contador * 18)
      navigator.vibrate?.(12)

      if (contador < totalCiclos) {
        // Desaceleração gradual e dramática
        if (contador > 16) delay += 15
        if (contador > 24) delay += 35
        if (contador > 30) delay += 75
        if (contador > 34) delay += 120
        setTimeout(step, delay)
      } else {
        // Revelar o ganhador definitivo com pequeno suspense
        setTimeout(() => {
          setGanhador(escolhido)
          setFase('ganhador')
          onWinnerSelected(escolhido)
          if (escolhido.id) {
            marcarParticipanteSorteado(escolhido.id)
          }
        }, 300)
      }
    }

    step()
  }

  // Montar link direto do WhatsApp
  const linkWhatsAppGanhador = () => {
    if (!ganhador) return '#'
    const whatsDigitos = ganhador.whatsapp.replace(/\D/g, '')
    const numeroComDDI = whatsDigitos.startsWith('55') ? whatsDigitos : `55${whatsDigitos}`
    const texto = encodeURIComponent(
      `Olá ${ganhador.nome_completo}!\n\n` +
      `Você foi sorteado(a) e ganhou a Amazon Echo Show 5 do projeto BioCore AI na Feira NEXT!\n\n` +
      `Pode comparecer à nossa banca para retirar seu prêmio.`
    )
    return `https://wa.me/${numeroComDDI}?text=${texto}`
  }

  const instagramUsuario = ganhador?.instagram.replace(/^@/, '') || ''

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in touch-none overscroll-contain">
      <div 
        className="relative w-full max-w-sm sm:max-w-md clay-card-dark border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-center overflow-hidden touch-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar (oculto durante o giro para não sobrepor nem interromper o sorteio) */}
        {fase !== 'girando' && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-highest/60 flex items-center justify-center text-outline hover:text-white transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Fase 1: Pronto para sortear */}
        {fase === 'pronto' && (
          <div className="py-2 space-y-4">
            {/* Foto Oficial do Prêmio com Moldura Elegante */}
            <div className="relative w-32 h-24 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-surface-container-highest/40">
              <img 
                src="/alexa-show-5.png" 
                alt="Amazon Echo Show 5" 
                className="w-full h-full object-cover object-center" 
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-title-md text-xl font-bold text-on-surface">
                Sorteio da Echo Show 5
              </h3>
              <p className="text-xs text-outline">
                {elegiveis.length} {elegiveis.length === 1 ? 'participante' : 'participantes'}
              </p>
            </div>

            {elegiveis.length === 0 ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Nenhum participante elegível cadastrado ainda.</span>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={iniciarSorteio}
                  className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-fixed text-[#00210f] font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(90,240,157,0.25)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Girar Roleta</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fase 2: Roleta Dinâmica de Nomes (Slot Machine Suspense) */}
        {fase === 'girando' && (
          <div className="py-4 space-y-4 animate-fadeIn">
            {/* Tambor Vertical de Roleta */}
            <div className="relative h-36 rounded-2xl bg-surface-container-highest/40 border border-primary/25 overflow-hidden flex flex-col justify-center px-4">
              {/* Marcador Central de Mira com Acentos Verdes */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-primary/10 border-y border-primary/30 pointer-events-none flex items-center justify-between px-3 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(90,240,157,0.8)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(90,240,157,0.8)]" />
              </div>

              {/* Degradê de Profundidade */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-surface-container via-surface-container/70 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-container via-surface-container/70 to-transparent pointer-events-none z-10" />

              {/* Nomes em Rotação */}
              <div className="flex flex-col items-center justify-center gap-2 select-none relative z-0">
                <span className="text-xs text-outline/40 truncate max-w-[260px] blur-[0.4px]">
                  {nomesRoleta.anterior || '••••••••••'}
                </span>
                <span className="text-lg sm:text-xl font-bold text-primary tracking-wide truncate max-w-[280px] drop-shadow-[0_2px_12px_rgba(90,240,157,0.35)]">
                  {nomesRoleta.atual || 'Carregando...'}
                </span>
                <span className="text-xs text-outline/40 truncate max-w-[260px] blur-[0.4px]">
                  {nomesRoleta.proximo || '••••••••••'}
                </span>
              </div>
            </div>

            {/* Barra de Progresso do Sorteio */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-1.5 bg-surface-container-highest/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_8px_rgba(90,240,157,0.6)]"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-outline px-0.5">
                <span>{elegiveis.length} participantes</span>
                <span className="font-mono">{progresso}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Fase 3: Ganhador Revelado */}
        {fase === 'ganhador' && ganhador && (
          <div className="py-2 animate-scale-up text-center">
            {/* Tag elegante */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Ganhador(a) Sorteado(a)</span>
            </div>

            {/* Nome do Ganhador */}
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight">
              {ganhador.nome_completo}
            </h2>
            <p className="text-xs text-outline mt-1 mb-5">
              Prêmio: Amazon Echo Show 5
            </p>

            {/* Dados do Ganhador */}
            <div className="bg-surface-container-highest/40 border border-white/10 rounded-2xl p-4 text-xs space-y-3 mb-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-outline">WhatsApp</span>
                <span className="font-semibold text-on-surface text-sm">{ganhador.whatsapp}</span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                <span className="text-outline">Instagram</span>
                <a 
                  href={`https://instagram.com/${instagramUsuario}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary text-sm hover:underline inline-flex items-center gap-1"
                  title="Abrir perfil no Instagram para conferir se segue @biocoreai_"
                >
                  <span>{ganhador.instagram}</span>
                  <ExternalLink className="w-3 h-3 text-primary/70" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] text-outline">
                <span>Inscrição realizada às</span>
                <span className="font-mono text-on-surface/80">
                  {ganhador.created_at ? new Date(ganhador.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <a
                href={linkWhatsAppGanhador()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-fixed text-[#00210f] font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(90,240,157,0.2)] cursor-pointer flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" />
                <span>Notificar no WhatsApp</span>
              </a>

              <button
                onClick={iniciarSorteio}
                className="w-full h-10 rounded-2xl text-outline hover:text-on-surface font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Sortear outro participante</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
