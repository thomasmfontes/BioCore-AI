import React, { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cadastrarParticipante } from '../../services/sorteioService'
import { ParticipanteSorteio } from '../../types'

interface RaffleFormProps {
  onSuccess: (participante: ParticipanteSorteio) => void
}

export function RaffleForm({ onSuccess }: RaffleFormProps) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [votouConfirmado, setVotouConfirmado] = useState(false)
  const [printConfirmado, setPrintConfirmado] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Máscara automática de WhatsApp
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length <= 2) {
      setWhatsapp(value.length > 0 ? `(${value}` : '')
    } else if (value.length <= 7) {
      setWhatsapp(`(${value.slice(0, 2)}) ${value.slice(2)}`)
    } else {
      setWhatsapp(`(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`)
    }
  }

  // Tratamento do Instagram
  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim()
    if (value && !value.startsWith('@')) {
      value = `@${value}`
    }
    setInstagram(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const nomeLimpo = nome.trim()
    if (nomeLimpo.length < 3) {
      setErrorMessage('Por favor, informe seu nome completo.')
      return
    }

    const whatsDigitos = whatsapp.replace(/\D/g, '')
    if (whatsDigitos.length < 10) {
      setErrorMessage('Digite um WhatsApp válido com DDD.')
      return
    }

    const instaLimpo = instagram.trim()
    if (instaLimpo.length < 2) {
      setErrorMessage('Por favor, informe seu usuário do Instagram.')
      return
    }

    if (!votouConfirmado) {
      setErrorMessage('Confirme que votou no BioCore AI na feira NEXT.')
      return
    }

    if (!printConfirmado) {
      setErrorMessage('Confirme que tirou print da tela da votação.')
      return
    }

    setLoading(true)
    try {
      const res = await cadastrarParticipante({
        nome_completo: nomeLimpo,
        whatsapp,
        instagram: instaLimpo,
        votou_confirmado: votouConfirmado
      })

      if (!res.success) {
        setErrorMessage(res.message)
        setLoading(false)
        return
      }

      if (res.data) {
        onSuccess(res.data)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="clay-card-dark rounded-3xl p-6 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-4"
    >
      <div className="pb-1 border-b border-white/5">
        <h3 className="font-title-md text-base font-bold text-on-surface">
          Inscrição no Sorteio
        </h3>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Nome Completo */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-outline">
          Nome completo <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          required
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Como prefere ser chamado(a)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-surface-container-highest/50 border border-white/10 text-on-surface placeholder:text-outline/40 focus:border-primary/60 focus:bg-surface-container-highest focus:outline-none transition-colors text-sm"
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-outline">
          WhatsApp <span className="text-primary">*</span>
        </label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(11) 98765-4321"
          value={whatsapp}
          onChange={handleWhatsappChange}
          className="w-full h-12 px-4 rounded-2xl bg-surface-container-highest/50 border border-white/10 text-on-surface placeholder:text-outline/40 focus:border-primary/60 focus:bg-surface-container-highest focus:outline-none transition-colors text-sm font-mono"
        />
      </div>

      {/* Instagram */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-outline">
          Instagram <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          placeholder="@usuario"
          value={instagram}
          onChange={handleInstagramChange}
          className="w-full h-12 px-4 rounded-2xl bg-surface-container-highest/50 border border-white/10 text-on-surface placeholder:text-outline/40 focus:border-primary/60 focus:bg-surface-container-highest focus:outline-none transition-colors text-sm"
        />
      </div>

      {/* Confirmações Obrigatórias */}
      <div className="space-y-2 pt-1">
        {/* Checkbox 1: Confirmação de Voto */}
        <div
          onClick={() => setVotouConfirmado(!votouConfirmado)}
          className={`flex items-center gap-2.5 p-3 rounded-2xl cursor-pointer select-none transition-colors border min-h-[42px] ${
            votouConfirmado
              ? 'bg-primary/10 border-primary/40 text-on-surface shadow-[0_2px_10px_rgba(90,240,157,0.08)]'
              : 'bg-surface-container-highest/30 border-white/5 text-outline hover:border-white/10'
          }`}
        >
          <div 
            className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border shrink-0 transition-colors ${
              votouConfirmado 
                ? 'bg-primary border-primary text-[#00210f]' 
                : 'border-outline/40 bg-surface-container'
            }`}
          >
            {votouConfirmado && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-[11px] leading-tight">
            Confirmo que votei no projeto <strong className="text-white font-semibold">BioCore AI</strong> no NEXT.<span className="text-primary ml-0.5">*</span>
          </span>
        </div>

        {/* Checkbox 2: Print da Votação */}
        <div
          onClick={() => setPrintConfirmado(!printConfirmado)}
          className={`flex items-center gap-2.5 p-3 rounded-2xl cursor-pointer select-none transition-colors border min-h-[42px] ${
            printConfirmado
              ? 'bg-primary/10 border-primary/40 text-on-surface shadow-[0_2px_10px_rgba(90,240,157,0.08)]'
              : 'bg-surface-container-highest/30 border-white/5 text-outline hover:border-white/10'
          }`}
        >
          <div 
            className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border shrink-0 transition-colors ${
              printConfirmado 
                ? 'bg-primary border-primary text-[#00210f]' 
                : 'border-outline/40 bg-surface-container'
            }`}
          >
            {printConfirmado && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-[11px] leading-tight">
            Confirmo que tirei print da tela da votação.<span className="text-primary ml-0.5">*</span>
          </span>
        </div>
      </div>

      {/* Botão de Envio (Estilo Claymorphism BioCore) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-fixed text-[#00210f] font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(90,240,157,0.2)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando...</span>
            </>
          ) : (
            <span>Confirmar Inscrição</span>
          )}
        </button>
      </div>
    </form>
  )
}
