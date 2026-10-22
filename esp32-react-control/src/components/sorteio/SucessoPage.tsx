import React, { useState, useEffect } from 'react'
import { SuccessMessage } from './SuccessMessage'
import { getMeuCadastroLocal, limparMeuCadastroLocal } from '../../services/sorteioService'
import { supabase } from '../../lib/supabase'
import { ParticipanteSorteio } from '../../types'
import { Lock, ArrowLeft } from 'lucide-react'

export function SucessoPage() {
  const [participante, setParticipante] = useState<ParticipanteSorteio | null>(() => {
    return getMeuCadastroLocal()
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validarCadastro() {
      const local = getMeuCadastroLocal()
      if (!local) {
        // Sem cadastro local, redireciona para a inscrição
        window.location.href = '/sorteio'
        return
      }

      try {
        const { data, error } = await supabase
          .from('t_sorteio_participantes')
          .select('*')
          .eq('whatsapp', local.whatsapp)
          .maybeSingle()

        // Se o banco foi limpo e o participante não existe mais
        if (!error && !data) {
          limparMeuCadastroLocal()
          window.location.href = '/sorteio'
          return
        }

        if (data) {
          // Sincroniza sempre com os dados reais salvos no Supabase
          setParticipante(data)
          localStorage.setItem('biocore_sorteio_meu_cadastro', JSON.stringify(data))
        } else {
          setParticipante(local)
        }
      } catch (err) {
        console.warn('Erro ao validar cadastro no banco:', err)
      } finally {
        setLoading(false)
      }
    }

    validarCadastro()
  }, [])

  if (loading && !participante) {
    return null
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col font-body-lg relative overflow-x-hidden">
      {/* Top Header - Padrão oficial BioCore AI */}
      <header className="fixed top-0 left-0 right-0 w-full z-[60] h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] clay-card-dark rounded-b-3xl rounded-t-none flex items-center px-margin-mobile md:px-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <a
            href="/sorteio"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors outline-none active:scale-95 mr-1"
            title="Voltar ao início do sorteio"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <img src="/biocore-logo.png" alt="BioCore AI Logo" className="h-10 w-10 object-contain" />
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            BIOCORE <span className="text-primary">AI</span>
          </h1>
        </div>

        {/* Canto Direito: Acesso administrativo */}
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

      {/* Conteúdo Centralizado */}
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] w-full overflow-hidden flex flex-col justify-center my-auto">
        <div className="w-full max-w-md mx-auto px-margin-mobile flex flex-col space-y-stack-lg animate-fadeIn">
          {participante && (
            <SuccessMessage 
              participante={participante} 
            />
          )}
        </div>
      </main>
    </div>
  )
}
