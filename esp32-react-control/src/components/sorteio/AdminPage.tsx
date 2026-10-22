import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  Trophy, 
  RefreshCw, 
  Lock, 
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react'
import { listarParticipantes, exportarParticipantesCSV } from '../../services/sorteioService'
import { ParticipanteSorteio } from '../../types'
import { SorteadorModal } from './SorteadorModal'
import { WhatsAppIcon } from './WhatsAppIcon'

const ADMIN_PIN = 'biocore2026'

function CountUp({ end, duration = 800 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = 0

    if (end === 0) {
      setCount(0)
      return
    }

    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startValue + (end - startValue) * easeOut))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
  }, [end, duration])

  return <span>{count}</span>
}

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('biocore_admin_auth') === 'true'
  })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  const [participantes, setParticipantes] = useState<ParticipanteSorteio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSorteadorOpen, setIsSorteadorOpen] = useState(false)

  // Carregar lista de participantes
  const carregarDados = async () => {
    setLoading(true)
    try {
      const lista = await listarParticipantes()
      setParticipantes(lista)
    } catch (err) {
      console.error('Erro ao carregar participantes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      carregarDados()
    }
  }, [isAuthenticated])

  // Login por PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = pinInput.trim().toLowerCase()
    if (clean === ADMIN_PIN || clean === '2026') {
      sessionStorage.setItem('biocore_admin_auth', 'true')
      setIsAuthenticated(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  // Filtragem em tempo real
  const participantesFiltrados = participantes.filter(p => {
    const termo = searchTerm.toLowerCase()
    return (
      p.nome_completo.toLowerCase().includes(termo) ||
      p.whatsapp.includes(termo) ||
      p.instagram.toLowerCase().includes(termo)
    )
  })

  // Tela de Autenticação (PIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background text-on-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm clay-card-dark rounded-3xl p-6 sm:p-7 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-highest/60 border border-white/10 flex items-center justify-center text-outline mb-3.5">
              <Lock className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <h2 className="font-title-md text-lg font-bold text-on-surface">
              Painel da Equipe
            </h2>
            <p className="text-xs text-outline mt-1 max-w-[240px]">
              Insira a senha de acesso para gerenciar os participantes e o sorteio.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-outline text-left">
                Senha de acesso
              </label>
              <input
                type="password"
                autoFocus
                autoComplete="current-password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value)
                  setPinError(false)
                }}
                className="w-full h-12 px-4 rounded-2xl bg-surface-container-highest/50 border border-white/10 text-on-surface placeholder:text-outline/40 focus:border-primary/60 focus:bg-surface-container-highest focus:outline-none transition-colors text-sm text-center tracking-[0.25em]"
              />
            </div>

            {pinError && (
              <div className="p-3 rounded-2xl bg-error/10 border border-error/20 text-error text-xs flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Senha incorreta. Tente novamente.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-fixed text-[#00210f] font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(90,240,157,0.2)] cursor-pointer flex items-center justify-center"
            >
              Entrar
            </button>

            <div className="pt-2 text-center">
              <a
                href="/sorteio"
                className="inline-flex items-center gap-1.5 text-xs text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao sorteio</span>
              </a>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col font-body-lg relative overflow-x-hidden">
      {/* Top Header - Padrão oficial BioCore AI */}
      <header className="fixed top-0 left-0 right-0 w-full z-[60] h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] clay-card-dark rounded-b-3xl rounded-t-none flex items-center px-margin-mobile md:px-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <a 
            href="/sorteio"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors outline-none active:scale-95 cursor-pointer"
            title="Voltar ao sorteio"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            Painel do Sorteio
          </h1>
        </div>

        {/* Canto Direito: Ações */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={carregarDados}
            disabled={loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors outline-none active:scale-95 cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={() => exportarParticipantesCSV(participantes)}
            className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors outline-none active:scale-95 border border-white/5 cursor-pointer"
            title="Exportar dados em CSV"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline font-medium">CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content com espaçamento compatível com o header fixo */}
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] w-full">
        <div className="max-w-3xl w-full mx-auto px-margin-mobile space-y-4">
          {/* Banner CTA Sorteador */}
          <div className="clay-card-dark rounded-3xl p-5 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Sorteio da Echo Show 5
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Sorteie aleatoriamente os participantes inscritos.
              </p>
            </div>

            <button
              onClick={() => setIsSorteadorOpen(true)}
              disabled={participantes.length === 0}
              className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary-fixed text-[#00210f] font-bold text-xs tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(90,240,157,0.2)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span>Realizar Sorteio</span>
            </button>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="clay-card-dark rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-outline font-medium">Inscritos</div>
              <div className="text-2xl font-bold text-on-surface mt-1">
                <CountUp end={participantes.length} />
              </div>
            </div>

            <div className="clay-card-dark rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-outline font-medium">Votos Confirmados</div>
              <div className="text-2xl font-bold text-primary mt-1">
                <CountUp end={participantes.filter(p => p.votou_confirmado).length} />
              </div>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-surface-container-highest/50 border border-white/10 text-on-surface placeholder:text-outline/40 focus:border-primary/60 focus:bg-surface-container-highest focus:outline-none transition-colors text-xs sm:text-sm"
            />
          </div>

          {/* Lista de Participantes */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1 text-xs text-outline">
              <span>Participantes ({participantesFiltrados.length})</span>
              {loading && <span className="text-primary text-[11px]">Atualizando...</span>}
            </div>

            {participantesFiltrados.length === 0 ? (
              <div className="clay-card-dark rounded-2xl p-8 text-center border border-white/5 text-outline text-xs">
                {searchTerm ? 'Nenhum participante encontrado.' : 'Nenhum participante cadastrado ainda.'}
              </div>
            ) : (
              participantesFiltrados.map((p, index) => {
                const whatsNumeros = p.whatsapp.replace(/\D/g, '')
                const whatsComDDI = whatsNumeros.startsWith('55') ? whatsNumeros : `55${whatsNumeros}`

                return (
                  <div 
                    key={p.id || index}
                    className={`clay-card-dark rounded-2xl p-4 border transition-colors flex items-center justify-between gap-3 ${
                      p.sorteado ? 'border-primary/40 bg-primary/5' : 'border-white/5'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-on-surface truncate">
                          {p.nome_completo}
                        </span>
                        {p.sorteado && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                            Sorteado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-outline">
                        <span>{p.whatsapp}</span>
                        <span>•</span>
                        <span className="text-primary/90">{p.instagram}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <a
                        href={`https://wa.me/${whatsComDDI}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-3 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest border border-white/10 text-xs font-medium text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Conversar no WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal do Sorteador */}
      <SorteadorModal
        isOpen={isSorteadorOpen}
        onClose={() => setIsSorteadorOpen(false)}
        participantes={participantes}
        onWinnerSelected={(ganhador) => {
          // Atualiza lista localmente
          setParticipantes(prev => prev.map(p => p.id === ganhador.id ? { ...p, sorteado: true } : p))
        }}
      />
    </div>
  )
}
