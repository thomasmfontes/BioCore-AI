import React from 'react'
import { ExternalLink, Camera } from 'lucide-react'
import { InstagramIcon } from './InstagramIcon'

export function StepsNotice() {
  return (
    <section className="clay-card-dark rounded-3xl p-6 relative overflow-hidden border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-outline mb-4">
        Regras para concorrer
      </h3>

      <div className="space-y-4">
        {/* Passo 1 */}
        <div className="flex items-start gap-3.5">
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
            1
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              Vote no BioCore AI
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Escaneie com seu celular o QR Code oficial da organização disponível no nosso stand.
            </p>

            {/* Aviso sucinto para tirar print */}
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-medium">
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Tire print da tela para comprovar seu voto!</span>
            </div>
          </div>
        </div>

        {/* Divisor sutil */}
        <div className="h-px bg-white/5 ml-9" />

        {/* Passo 2 */}
        <div className="flex items-start gap-3.5">
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
            2
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              Siga @biocoreai_ no Instagram
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              É por onde divulgaremos o resultado.
            </p>

            <a
              href="https://instagram.com/biocoreai_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-white/10 border border-white/10 text-white text-xs font-medium active:scale-95 transition-all"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-primary" />
              <span>Abrir perfil @biocoreai_</span>
              <ExternalLink className="w-3 h-3 text-outline" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
