import React from 'react';
import type { DadosPlanta } from '../../hooks/useMqtt';

interface CultivoTabProps {
  hortalica: DadosPlanta;
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: any;
  setShowSelector: (show: boolean) => void;
}

export function CultivoTab({ hortalica, smartMode, setSmartMode, sensors, setShowSelector }: CultivoTabProps) {
  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Active Crop Section */}
      <section className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant inner-bevel">
        <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">Estado Atual</span>
          {smartMode && (
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
              AUTO AI
            </span>
          )}
        </div>
        <div className="relative h-64 w-full bg-surface-container-highest">
          <img
            alt={hortalica.nome}
            className="w-full h-full object-cover opacity-80"
            src={
              hortalica.chave === 'alface'
                ? "https://images.unsplash.com/photo-1621961476421-e09e13d96924?q=80&w=600&auto=format&fit=crop"
                : hortalica.chave === 'tomate'
                ? "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1594900010996-a9c0490b411d?q=80&w=600&auto=format&fit=crop"
            }
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <span className="font-label-caps text-label-caps bg-primary/10 text-primary px-2 py-1 rounded-sm border border-primary/20 mb-2 inline-block">CULTIVANDO</span>
              <button
                onClick={() => setShowSelector(true)}
                className="flex items-center gap-2 text-left bg-black/50 hover:bg-black/70 active:scale-95 transition-all px-4 py-2 rounded-xl border border-outline-variant/40 min-h-[44px] bio-glow"
              >
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold flex items-center gap-2">
                  <span>{hortalica.emoji}</span>
                  <span>{hortalica.nome}</span>
                </span>
                <span className="material-symbols-outlined text-primary text-xl">expand_more</span>
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-surface-container/80 backdrop-blur-md p-2 rounded-full border border-outline-variant active-glow cursor-pointer" onClick={() => setShowSelector(true)}>
            <span className="material-symbols-outlined text-primary text-xl">potted_plant</span>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-outline-variant border-t border-outline-variant">
          <div className="p-stack-md text-center">
            <p className="font-label-caps text-label-caps text-outline text-[10px]">DIA</p>
            <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">14/30</p>
          </div>
          <div className="p-stack-md text-center">
            <p className="font-label-caps text-label-caps text-outline text-[10px]">SAÚDE</p>
            <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">98%</p>
          </div>
          <div className="p-stack-md text-center">
            <p className="font-label-caps text-label-caps text-outline text-[10px]">COLHEITA</p>
            <p className="font-mono-data text-mono-data text-primary text-sm font-semibold">12 JUN</p>
          </div>
        </div>
      </section>

      {/* Smart Mode Card */}
      <section className="bg-surface-container rounded-xl border border-outline-variant inner-bevel p-stack-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">psychology</span>
        </div>
        <div className="flex justify-between items-center mb-stack-md relative z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
            <h3 className="font-title-md text-title-md font-bold tracking-tight">MODO INTELIGENTE</h3>
          </div>
          {/* Switch Toggle */}
          <label className="relative inline-flex items-center cursor-pointer touch-target-min">
            <input
              type="checkbox"
              checked={smartMode}
              onChange={(e) => setSmartMode(e.target.checked)}
              className="sr-only peer switch-input"
            />
            <div className="w-12 h-6 bg-surface-container-highest rounded-full transition-colors switch-rail border border-outline-variant relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-outline rounded-full transition-transform switch-knob flex items-center justify-center"></div>
            </div>
          </label>
        </div>

        <div className="space-y-stack-md relative z-10">
          {smartMode ? (
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-mono mb-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              🧠 INTELIGÊNCIA AUTÔNOMA ATIVA
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-error/10 border border-error/20 text-error rounded-full px-2.5 py-0.5 text-[10px] font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              ⚠️ OPERAÇÃO MANUAL ASSISTIDA
            </div>
          )}

          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed text-xs">
            {smartMode 
              ? hortalica.descricaoIA 
              : 'O sistema de IA está desativado. O cultivo agora depende do controle manual dos atuadores de luz e bombas no painel de controle.'
            }
          </p>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary text-lg">light_mode</span>
              <div>
                <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Fotoperíodo LED</p>
                <p className="text-xs text-on-surface-variant">
                  {smartMode 
                    ? `Ciclo automático de ${hortalica.fotoperiodo}h luz / ${24 - hortalica.fotoperiodo}h escuridão.`
                    : 'Controle desativado. Aguardando comandos manuais na aba Controle.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary text-lg">water_drop</span>
              <div>
                <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Irrigação Inteligente</p>
                <p className="text-xs text-on-surface-variant">
                  {smartMode 
                    ? `Ativada sob demanda quando umidade do solo cai abaixo de ${hortalica.u_solo}%.`
                    : 'Modo manual ativo. Perigo de estresse hídrico sem controle do usuário.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary text-lg">science</span>
              <div>
                <p className="font-label-caps text-[10px] font-bold text-on-surface uppercase">Dosagem NPK</p>
                <p className="text-xs text-on-surface-variant">
                  {smartMode 
                    ? `Manutenção em tempo real das metas NPK da planta (${hortalica.N}-${hortalica.P}-${hortalica.K}).`
                    : 'Dosador inativo. Risco de desbalanço de nutrientes.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex justify-center">
          <button 
            onClick={() => alert(`Parâmetros Inteligentes para ${hortalica.nome}:\n- Umidade Solo Alvo: ${hortalica.u_solo}%\n- Fotoperíodo: ${hortalica.fotoperiodo}h/dia\n- Nutrientes Alvo: N:${hortalica.N} P:${hortalica.P} K:${hortalica.K}`)}
            className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-3 px-6 rounded-xl w-full transition-transform active:scale-95 bio-glow text-sm"
          >
            VER DETALHES DE METAS IA
          </button>
        </div>
      </section>

      {/* Bento Grid: Leituras e Metas Alvo */}
      <div className="grid grid-cols-2 gap-stack-md">
        {/* Umidade do Solo Card */}
        <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant inner-bevel flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-[9px] text-outline block mb-1 uppercase font-semibold">Umidade Solo</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-2xl font-bold text-on-surface">
                {sensors?.u_solo ?? 65}
              </span>
              <span className="font-body-sm text-xs text-outline">%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/30 flex justify-between items-center text-[10px]">
            <span className="text-on-surface-variant font-medium">Meta Alvo:</span>
            <span className="font-mono-data text-primary font-bold">{hortalica.u_solo}%</span>
          </div>
        </div>

        {/* Fotoperíodo Card */}
        <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant inner-bevel flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-[9px] text-outline block mb-1 uppercase font-semibold">Fotoperíodo Ideal</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-2xl font-bold text-on-surface">
                {hortalica.fotoperiodo}
              </span>
              <span className="font-body-sm text-xs text-outline">horas</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/30 flex justify-between items-center text-[10px]">
            <span className="text-on-surface-variant font-medium">Ciclo LED:</span>
            <span className="font-mono-data text-primary font-bold">{hortalica.fotoperiodo}h / {24 - hortalica.fotoperiodo}h</span>
          </div>
        </div>

        {/* NPK Alvo Card */}
        <div className="col-span-2 bg-surface-container p-stack-md rounded-xl border border-outline-variant inner-bevel">
          <span className="font-label-caps text-[9px] text-outline block mb-3 uppercase font-semibold">Nutrientes Alvo IA (NPK)</span>
          <div className="grid grid-cols-3 divide-x divide-outline-variant/40 text-center">
            <div>
              <span className="font-label-caps text-[8px] text-outline uppercase block">Nitrogênio (N)</span>
              <span className="font-mono-data text-base font-bold text-primary block mt-1">{hortalica.N} <span className="text-[9px] text-outline font-normal">mg/kg</span></span>
            </div>
            <div>
              <span className="font-label-caps text-[8px] text-outline uppercase block">Fósforo (P)</span>
              <span className="font-mono-data text-base font-bold text-secondary block mt-1">{hortalica.P} <span className="text-[9px] text-outline font-normal">mg/kg</span></span>
            </div>
            <div>
              <span className="font-label-caps text-[8px] text-outline uppercase block">Potássio (K)</span>
              <span className="font-mono-data text-base font-bold text-tertiary block mt-1">{hortalica.K} <span className="text-[9px] text-outline font-normal">mg/kg</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
