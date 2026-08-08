import React from 'react'
import type { SensorData } from '../../types'
import type { DadosPlanta } from '../../hooks/useMqtt'

interface InteligenciaTabProps {
  smartMode: boolean
  setSmartMode: (mode: boolean) => void
  sensors: SensorData | null
  hortalica: DadosPlanta
  status: string
}

export function InteligenciaTab({
  smartMode,
  setSmartMode,
  sensors,
  hortalica,
  status
}: InteligenciaTabProps) {
  const uSoloAtual = sensors?.u_solo ?? 0
  const uSoloAlvo = hortalica.u_solo
  const solHoras = ((sensors?.sol_ms ?? 0) / 3600000)
  const ledHoras = ((sensors?.led_ms ?? 0) / 3600000)
  const luzTotalHoras = solHoras + ledHoras
  const metaLuzHoras = hortalica.fotoperiodo
  const progressoLuz = Math.min(100, Math.round((luzTotalHoras / metaLuzHoras) * 100))

  const tempAmb = sensors?.temp ?? 0
  const umidAmb = sensors?.u_amb ?? 0

  // Análise da Evapotranspiração por Clima
  let fatorClimaTexto = 'Clima Ameno (Transpiração Normal)'
  let cooldownTempoTexto = '1 Hora (60 min)'
  if (tempAmb > 30) {
    fatorClimaTexto = 'Calor Elevado (> 30°C) — Alta Evapotranspiração'
    cooldownTempoTexto = '30 Minutos (Frequência Acelerada)'
  } else if (tempAmb > 0 && tempAmb < 16) {
    fatorClimaTexto = 'Frio (< 16°C) — Metabolismo Lento'
    cooldownTempoTexto = '2 Horas (Frequência Reduzida)'
  }

  // Trava de Segurança Radicular NPK (u_solo >= 45%)
  const protecaoNPKAtiva = uSoloAtual < 45

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header Hero Card - Status BioCore AI */}
      <div className="clay-card-dark p-6 rounded-3xl relative overflow-hidden flex flex-col gap-4 border border-outline-variant/30">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl clay-card-primary flex items-center justify-center text-primary-fixed-dim">
              <span className="material-symbols-outlined text-2xl animate-pulse">psychology</span>
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Central BioCore AI</h2>
              <p className="text-xs text-outline font-body">Decisões e Automação Agronômica em Tempo Real</p>
            </div>
          </div>

          <button
            onClick={() => setSmartMode(!smartMode)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold font-headline transition-all duration-300 flex items-center gap-2 ${
              smartMode
                ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(54,211,131,0.2)]'
                : 'bg-surface-variant/50 text-outline border border-outline/30'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${smartMode ? 'bg-primary animate-ping' : 'bg-outline'}`} />
            {smartMode ? 'AUTÔNOMO' : 'MANUAL'}
          </button>
        </div>

        <div className="bg-surface/60 rounded-2xl p-4 border border-outline/20 flex items-center gap-4">
          <span className="text-4xl">{hortalica.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-on-surface">{hortalica.nome}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono">
                {smartMode ? 'Modo IA Ativo' : 'Modo Manual'}
              </span>
            </div>
            <p className="text-xs text-outline mt-1 leading-relaxed">{hortalica.descricaoIA}</p>
          </div>
        </div>
      </div>

      {/* Grid de Decisões Fisiológicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Card de Irrigação & Absorção */}
        <div className="clay-card-dark p-5 rounded-3xl border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">water_drop</span>
              <h3 className="text-sm font-bold text-on-surface font-headline">Regra de Irrigação (Água)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{uSoloAtual}% / Meta {uSoloAlvo}%</span>
          </div>

          <div className="bg-surface/40 rounded-2xl p-3 text-xs leading-relaxed border border-outline/10 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-primary mt-0.5">info</span>
              <div>
                <p className="font-semibold text-on-surface">Período de Absorção do Solo (Cooldown):</p>
                <p className="text-outline text-[11px] mt-0.5">
                  Após cada rega de 15s, a IA aguarda <strong className="text-on-surface">{cooldownTempoTexto}</strong> antes de liberar uma nova rega. Isso garante que a água penetre no substrato sem afogar as raízes.
                </p>
              </div>
            </div>

            <div className="border-t border-outline/10 pt-2 flex items-center justify-between text-[11px]">
              <span className="text-outline">Clima Atual:</span>
              <span className="font-semibold text-on-surface">{fatorClimaTexto}</span>
            </div>
          </div>
        </div>

        {/* 2. Card de Proteção Radicular NPK */}
        <div className="clay-card-dark p-5 rounded-3xl border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">verified_user</span>
              <h3 className="text-sm font-bold text-on-surface font-headline">Proteção Radicular NPK</h3>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold font-mono ${
              protecaoNPKAtiva ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {protecaoNPKAtiva ? 'PAUSA DE SEGURANÇA' : 'PROTEÇÃO OK'}
            </span>
          </div>

          <div className="bg-surface/40 rounded-2xl p-3 text-xs leading-relaxed border border-outline/10 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className={`material-symbols-outlined text-sm mt-0.5 ${protecaoNPKAtiva ? 'text-amber-400' : 'text-emerald-400'}`}>
                {protecaoNPKAtiva ? 'warning' : 'check_circle'}
              </span>
              <div>
                <p className="font-semibold text-on-surface">Trava de Salinização das Raízes:</p>
                <p className="text-outline text-[11px] mt-0.5">
                  {protecaoNPKAtiva ? (
                    <span className="text-amber-300">
                      Fertirrigação NPK em pausa porque a umidade do solo está em {uSoloAtual}% (&lt; 45%). A água pura é aplicada primeiro para hidratar o solo e evitar queimaduras de raízes.
                    </span>
                  ) : (
                    <span>
                      Solo com umidade adequada ({uSoloAtual}% &ge; 45%). Dosagens micro-fracionadas de Nitrogênio (N), Fósforo (P) e Potássio (K) autorizadas com segurança.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card de Suplementação DLI (Fotoperíodo & Sol/LED) */}
      <div className="clay-card-dark p-6 rounded-3xl border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">light_mode</span>
            <h3 className="text-base font-bold text-on-surface font-headline">Fotoperíodo & Cota de Luz (DLI)</h3>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {luzTotalHoras.toFixed(1)}h / {metaLuzHoras}h Meta
          </span>
        </div>

        {/* Barra de Progresso DLI */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-3 bg-surface/80 rounded-full overflow-hidden p-0.5 border border-outline/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressoLuz}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-outline font-mono">
            <span>Sol Acumulado: {solHoras.toFixed(1)}h</span>
            <span>LED Acumulado: {ledHoras.toFixed(1)}h</span>
            <span>Progresso: {progressoLuz}%</span>
          </div>
        </div>

        <div className="bg-surface/40 rounded-2xl p-4 text-xs leading-relaxed border border-outline/10 flex flex-col gap-2">
          <p className="font-semibold text-on-surface">Funcionamento Autônomo da Iluminação:</p>
          <p className="text-outline text-[11px]">
            O sensor LDR físico no ESP32 monitora a luz natural durante o dia. Ao anoitecer, se a luz solar recebida for menor que a meta de <strong>{metaLuzHoras} horas</strong> da cultura ({hortalica.nome}), a IA aciona o Mosfet LED PWM para compensar a diferença sem intervenção humana.
          </p>
        </div>
      </div>
    </div>
  )
}
