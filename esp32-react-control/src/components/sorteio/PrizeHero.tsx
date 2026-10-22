import React from 'react'

export function PrizeHero() {
  return (
    <section className="clay-card-dark rounded-3xl p-6 relative overflow-hidden border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Cabeçalho do Card */}
      <div className="text-center relative z-10">
        <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
          Sorteio Echo Show 5
        </h2>

        <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs mx-auto leading-relaxed">
          Vote no projeto <strong className="text-white font-semibold">BioCore AI</strong> e concorra ao prêmio exclusivo.
        </p>
      </div>

      {/* Imagem Original da Alexa */}
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
        <img 
          src="/alexa-show-5.png" 
          alt="Amazon Echo Show 5 - Prêmio BioCore AI" 
          className="w-full h-auto object-cover"
          loading="eager"
        />
      </div>
    </section>
  )
}
