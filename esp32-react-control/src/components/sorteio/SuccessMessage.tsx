import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { ParticipanteSorteio } from '../../types'

interface SuccessMessageProps {
  participante: ParticipanteSorteio
  onReset?: () => void
}

export function SuccessMessage({ participante, onReset }: SuccessMessageProps) {
  const primeiroNome = participante.nome_completo.split(' ')[0]

  useEffect(() => {
    // Vibração tátil sutil em smartphones
    navigator.vibrate?.([30, 50, 30])

    // Efeito de confetes nas cores oficiais do BioCore AI (apenas verdes e brancos)
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#5af09d', '#ffffff', '#48e08f']
    })

    const timer = setTimeout(() => {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 45,
        origin: { x: 0.05, y: 0.7 },
        colors: ['#5af09d', '#ffffff', '#48e08f']
      })
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 45,
        origin: { x: 0.95, y: 0.7 },
        colors: ['#5af09d', '#ffffff', '#48e08f']
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="clay-card-dark rounded-3xl p-6 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-center relative overflow-hidden animate-fadeIn">
      {/* Ícone de Sucesso com Animação Estilo Mercado Livre */}
      <div className="w-20 h-20 mx-auto rounded-3xl bg-surface-container-highest/60 border border-white/5 flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-ml-pop">
        <svg 
          className="w-12 h-12 text-primary" 
          viewBox="0 0 52 52"
        >
          {/* Círculo que se desenha no sentido horário */}
          <circle 
            className="animate-ml-circle" 
            cx="26" 
            cy="26" 
            r="22" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="100"
          />
          {/* Checkmark que se desenha de forma suave logo em seguida */}
          <path 
            className="animate-ml-check" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15 27 l8 8 l15 -16"
            pathLength="100"
          />
        </svg>
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 font-label-caps">
        Inscrição Confirmada
      </span>

      <h3 className="text-2xl font-bold text-white mt-3">
        Boa sorte, {primeiroNome}!
      </h3>

      {/* Foto Oficial da Equipe BioCore AI */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-surface-container-highest/30">
        <img 
          src="/equipe-biocore.jpg" 
          alt="Equipe BioCore AI: Matheus, Gabriel, Vitoria e Thomas" 
          className="w-full h-auto object-cover"
          loading="eager"
        />
      </div>

      <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
        Muito obrigado pelo seu voto e por apoiar o projeto <strong className="text-white">BioCore AI</strong> no NEXT!
      </p>

      <div className="mt-3.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary/90 leading-snug">
        O sorteio será realizado no dia seguinte do evento. Entraremos em contato com o vencedor pelo WhatsApp!
      </div>
    </section>
  )
}
