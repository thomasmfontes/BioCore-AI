import React from 'react'
import { PrizeHero } from './PrizeHero'
import { StepsNotice } from './StepsNotice'
import { RaffleForm } from './RaffleForm'
import { Lock } from 'lucide-react'

export function SorteioPage() {
  const handleSuccess = () => {
    window.location.href = '/sorteio/sucesso'
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col font-body-lg relative overflow-x-hidden">
      {/* Top Header - Idêntico ao TopAppBar oficial do BioCore AI */}
      <header className="fixed top-0 left-0 right-0 w-full z-[60] h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] clay-card-dark rounded-b-3xl rounded-t-none flex items-center px-margin-mobile md:px-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <img src="/biocore-logo.png" alt="BioCore AI Logo" className="h-10 w-10 object-contain" />
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            BIOCORE <span className="text-primary">AI</span>
          </h1>
        </div>

        {/* Canto Direito: Botão discreto para o Admin da Banca */}
        <div className="flex items-center gap-2 ml-auto">
          <a
            href="/sorteio/admin"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors outline-none active:scale-95"
            title="Área da Banca"
          >
            <Lock className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Conteúdo Principal do Formulário */}
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] w-full overflow-hidden flex flex-col">
        <div className="w-full max-w-md mx-auto px-margin-mobile flex flex-col space-y-stack-lg animate-fadeIn">
          <PrizeHero />
          <StepsNotice />
          <RaffleForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  )
}
