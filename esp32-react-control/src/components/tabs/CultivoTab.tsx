import React from 'react';
import type { DadosPlanta } from '../../hooks/useMqtt';
import type { ReservoirEstimate } from '../../types';
import { RefillModal } from '../ui/RefillModal';

interface CultivoTabProps {
  hortalica: DadosPlanta;
  smartMode: boolean;
  setSmartMode: (mode: boolean) => void;
  sensors: any;
  setShowSelector: (show: boolean) => void;
  onNavigateToCamera?: () => void;
  reservoir: ReservoirEstimate | null;
  reservoirLoading: boolean;
  onRefillReservoir: () => Promise<boolean>;
}

function formatLastRefill(timestamp: number | null): string {
  if (!timestamp) return 'data indisponível';

  const refillDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();

  const time = refillDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSameDay(refillDate, today)) return `hoje às ${time}`;
  if (isSameDay(refillDate, yesterday)) return `ontem às ${time}`;

  const date = refillDate
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '');

  return `em ${date} às ${time}`;
}

export function CultivoTab({
  hortalica,
  smartMode,
  setSmartMode,
  sensors,
  setShowSelector,
  onNavigateToCamera,
  reservoir,
  reservoirLoading,
  onRefillReservoir,
}: CultivoTabProps) {
  const [showRefillConfirm, setShowRefillConfirm] = React.useState(false);
  const [refillError, setRefillError] = React.useState(false);

  const percentage = reservoir?.percentage ?? 100;
  const reservoirTone = percentage <= 10
    ? {
        text: 'text-error',
        border: 'border-error/30',
        background: 'bg-error/10',
        fill: 'bg-error',
        label: 'CRÍTICO',
      }
    : percentage <= 30
      ? {
          text: 'text-warning',
          border: 'border-warning/30',
          background: 'bg-warning/10',
          fill: 'bg-warning',
          label: 'BAIXO',
        }
      : {
          text: 'text-secondary',
          border: 'border-secondary/30',
          background: 'bg-secondary/10',
          fill: 'bg-secondary',
          label: 'ESTIMADO',
        };

  const handleRefill = async () => {
    setRefillError(false);
    const success = await onRefillReservoir();
    if (success) {
      setShowRefillConfirm(false);
      navigator.vibrate?.([20, 40, 20]);
    } else {
      setRefillError(true);
    }
  };

  return (
    <div className="space-y-stack-lg animate-fadeIn">
      {/* Active Crop Section */}
      <section className="clay-card-dark rounded-3xl overflow-hidden">
        <div className="relative h-56 w-full bg-surface-container-highest">
          <img
            alt={hortalica.nome}
            className="w-full h-full object-cover opacity-90"
            src={hortalica.imagemUrl}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2226] via-black/20 to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <span className="font-label-caps text-[10px] bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg uppercase tracking-wider">
              {smartMode ? 'Cultivo Inteligente' : 'Controle Manual'}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <button
              onClick={() => setShowSelector(true)}
              className="flex items-center gap-2 text-left bg-black/50 backdrop-blur-md hover:bg-black/70 active:scale-95 transition-all px-4 py-2 rounded-2xl border border-white/20 min-h-[44px]"
            >
              <span className="text-xl">{hortalica.emoji}</span>
              <span className="font-title-lg text-lg text-white font-bold">{hortalica.nome}</span>
              <span className="material-symbols-outlined text-white/70">expand_more</span>
            </button>
          </div>
        </div>
      </section>

      {/* Smart Mode Card */}
      <section 
        onClick={() => {
          navigator.vibrate?.([10, 30, 10]);
          setSmartMode(!smartMode);
        }}
        className={`p-4 relative overflow-hidden select-none transition-all duration-300 active:scale-[0.98] rounded-3xl cursor-pointer clay-card-dark border
          ${smartMode 
            ? 'border-primary/30 shadow-[0_4px_16px_rgba(90,240,157,0.08)]' 
            : 'border-transparent'
          }
        `}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">memory</span>
            <h3 className={`font-title-md text-base font-bold transition-colors duration-300 ${smartMode ? 'text-primary' : 'text-on-surface'}`}>BioCore AI</h3>
          </div>
          {/* Switch Toggle Botão Real */}
          <button 
            id="toggle-smart-mode-cultivo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.vibrate?.([10, 30, 10]);
              setSmartMode(!smartMode);
            }}
            className="relative inline-flex items-center justify-center cursor-pointer p-1 min-w-[44px] min-h-[44px] touch-target-min outline-none focus:outline-none z-20 active:scale-95 transition-transform"
            title="Ativar ou desativar modo inteligente BioCore AI"
          >
            <div className={`w-10 h-5 rounded-full relative border transition-colors p-0.5 ${
              smartMode ? 'bg-primary/20 border-primary/40' : 'bg-surface-container-highest border-outline'
            }`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${
                smartMode ? 'bg-primary right-0.5 shadow-[0_0_8px_#5af09d]' : 'bg-outline left-0.5'
              }`} />
            </div>
          </button>
        </div>

        <div>
          {smartMode ? (
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              A inteligência autônoma está ativa. O BioCore AI cuida da luz, água e nutrientes do seu cultivo para você não se preocupar.
            </p>
          ) : (
            <p className="text-xs text-error mb-4 leading-relaxed font-semibold">
              O modo autônomo está desativado. Você precisa controlar tudo manualmente.
            </p>
          )}

          {smartMode && (
            <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Cultivo Perfeito</p>
                  <p className="text-[10px] text-on-surface-variant">Ambiente 100% otimizado</p>
                </div>
              </div>
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Simplified Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Umidade Card */}
        <div className="clay-card-dark p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary text-lg shadow-secondary/20 drop-shadow-md">water_drop</span>
            <span className="font-label-caps text-[10px] text-outline uppercase font-semibold">Solo</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-sm text-xl font-bold text-on-surface">
                {sensors?.u_solo !== undefined && sensors?.u_solo !== null ? sensors.u_solo : '--'}
              </span>
              {sensors?.u_solo !== undefined && sensors?.u_solo !== null && (
                <span className="font-body-sm text-xs text-outline">%</span>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Meta: {hortalica.u_solo}%
            </p>
          </div>
        </div>

        {/* Luz Card */}
        <div className="clay-card-dark p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-400 text-lg drop-shadow-md">light_mode</span>
            <span className="font-label-caps text-[10px] text-outline uppercase font-semibold">Luz Diária</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-sm text-xl font-bold text-on-surface">{hortalica.fotoperiodo}</span>
              <span className="font-body-sm text-xs text-outline">h</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Ciclo ideal automático
            </p>
          </div>
        </div>
      </div>

       {/* Water Reservoir Estimate — Side-by-Side Layout with Glass Horizontal Reservoir */}
      <section className={`clay-card-dark rounded-3xl p-4 sm:p-5 border transition-colors duration-300 ${
        reservoir?.configured ? reservoirTone.border : 'border-outline-variant/20'
      }`}>
        <header className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-outline-variant/30 gap-3">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
              reservoir?.configured
                ? `${reservoirTone.background} ${reservoirTone.border}`
                : 'bg-secondary/10 border-secondary/20'
            }`}>
              <span className={`material-symbols-outlined text-xl sm:text-2xl ${
                reservoir?.configured ? reservoirTone.text : 'text-secondary'
              }`}>
                water_drop
              </span>
            </div>
            <div className="min-w-0 pt-0.5 sm:pt-0">
              <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface leading-tight sm:truncate">Reservatório de Água</h3>
              {(!reservoir?.configured || reservoirLoading) && (
                <p className="sm:hidden text-[11px] mt-0.5 text-on-surface-variant">
                  {reservoirLoading ? 'Atualizando estimativa...' : 'Estimativa ainda não iniciada'}
                </p>
              )}
              {reservoir?.configured && !reservoirLoading && (
                <p className="sm:hidden mt-1 text-[10px] leading-tight text-on-surface-variant">
                  Reabastecido <strong className="text-on-surface font-semibold">{formatLastRefill(reservoir.lastRefillAt)}</strong>
                </p>
              )}
              <p className="hidden sm:block text-xs text-on-surface-variant mt-0.5 truncate">1,5 L de capacidade</p>
            </div>
          </div>

          {!reservoir?.configured && (
            <span className="sm:hidden shrink-0 px-2.5 py-1 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-[10px] font-mono font-bold text-secondary">
              1,5 L
            </span>
          )}

          <span className={`hidden sm:inline-flex text-[10px] px-2.5 py-1 rounded-full border font-mono font-bold tracking-wider shrink-0 whitespace-nowrap ${
            reservoir?.configured
              ? `${reservoirTone.background} ${reservoirTone.text} ${reservoirTone.border}`
              : 'bg-surface-variant/50 text-outline border-outline/30'
          }`}>
            {reservoirLoading ? 'ATUALIZANDO' : reservoir?.configured ? reservoirTone.label : 'NÃO CONFIGURADO'}
          </span>
        </header>

        {reservoirLoading && !reservoir ? (
          <div className="py-8 flex items-center justify-center gap-3 text-outline">
            <span className="material-symbols-outlined text-xl animate-spin [animation-direction:reverse]">sync</span>
            <span className="text-xs font-semibold">Calculando nível estimado do reservatório...</span>
          </div>
        ) : reservoir?.configured ? (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-5 items-stretch">
            {/* Coluna Esquerda: Recipiente Retangular em Vidro 3D Limpo com Água Animada */}
            <div className="flex sm:col-span-5 flex-col">
              <div className="water-tank-glass w-full h-[145px] sm:h-full sm:min-h-[190px] relative overflow-hidden flex flex-col justify-between p-3">
                {/* Marcações Graduadas de Volume no Vidro (Alinhamento Preciso com o Nível de Água) */}
                <div className="absolute inset-y-0 left-3 z-30 text-[9px] font-mono font-bold text-white/85 select-none pointer-events-none drop-shadow-md">
                  <span className="absolute bottom-[88%] translate-y-1/2 flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-white/80 rounded-full inline-block shadow-[0_0_4px_rgba(255,255,255,0.6)]" />1.5L
                  </span>
                  <span className="absolute bottom-[62%] translate-y-1/2 flex items-center gap-1.5">
                    <span className="w-2 h-0.5 bg-white/60 rounded-full inline-block" />1.0L
                  </span>
                  <span className="absolute bottom-[36%] translate-y-1/2 flex items-center gap-1.5">
                    <span className="w-2 h-0.5 bg-white/60 rounded-full inline-block" />0.5L
                  </span>
                  <span className="absolute bottom-[10%] translate-y-1/2 flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-white/80 rounded-full inline-block" />0L
                  </span>
                </div>

                {/* Coluna do Líquido com Altura Dinâmica Mapeada de 10% a 88% */}
                <div 
                  className={`water-tank-liquid ${
                    percentage <= 10
                      ? 'water-tank-liquid-error'
                      : percentage <= 30
                        ? 'water-tank-liquid-warning'
                        : 'water-tank-liquid-blue'
                  }`}
                  style={{ height: `${10 + (Math.max(0, Math.min(100, percentage)) / 100) * 78}%` }}
                >
                  {/* Superfície Ondulada Animada (Wave layers cobrindo toda a extensão horizontal) */}
                  <div className="absolute -top-3 left-0 right-0 h-6 pointer-events-none z-10">
                    <svg 
                      className="wave-anim-1 absolute -top-1 left-0 w-[200%] h-6" 
                      viewBox="0 0 1200 120" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M 0,60 C 150,110 350,10 600,60 C 850,110 1050,10 1200,60 L 1200,120 L 0,120 Z" 
                        fill="rgba(255, 255, 255, 0.55)"
                      />
                    </svg>
                    <svg 
                      className="wave-anim-2 absolute -top-2 left-0 w-[200%] h-7" 
                      viewBox="0 0 1200 120" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M 0,60 C 200,10 400,110 600,60 C 800,10 1000,110 1200,60 L 1200,120 L 0,120 Z" 
                        fill="rgba(186, 230, 253, 0.4)"
                      />
                    </svg>
                  </div>

                  {/* Linha de Brilho na Superfície */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70 shadow-[0_0_8px_#ffffff] z-10" />

                  {/* Bolhas Subindo Espalhadas pelo Reservatório */}
                  <div className="absolute bottom-2 w-2 h-2 rounded-full bg-white/60 bubble-float-1" />
                  <div className="absolute bottom-4 w-1.5 h-1.5 rounded-full bg-white/50 bubble-float-2" />
                  <div className="absolute bottom-1 w-2.5 h-2.5 rounded-full bg-white/40 bubble-float-3" />
                  <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-white/60 bubble-float-4" />
                  <div className="absolute bottom-5 w-1 h-1 rounded-full bg-white/70 bubble-float-5" />
                </div>

                {/* Leitura central compacta no tanque mobile */}
                <div className="sm:hidden absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="rounded-2xl bg-[#07101a]/55 backdrop-blur-sm border border-white/15 px-4 py-2 text-center shadow-lg">
                    <div className="text-2xl font-bold text-white font-mono-data drop-shadow-md">
                      {(reservoir.remainingMl / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold text-blue-100 mt-0.5">
                      {percentage}% estimado
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Métricas e Ações em Layout Empilhado */}
            <div className="sm:col-span-7 flex flex-col justify-between gap-3">
              <div className="hidden sm:flex items-center gap-2 px-1 py-0.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-outline">history</span>
                <span className="text-[11px] leading-tight">
                  Reabastecido <strong className="text-on-surface font-semibold">{formatLastRefill(reservoir.lastRefillAt)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Card Nível Atual */}
                <div className="hidden sm:flex col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-3.5 items-center justify-between">
                  <div>
                    <span className="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider block">Nível Atual do Reservatório</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className={`text-2xl font-bold font-mono-data ${reservoirTone.text}`}>
                        {(reservoir.remainingMl / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L
                      </span>
                      <span className="text-xs text-outline font-mono">de {(reservoir.capacityMl / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L</span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${reservoirTone.background} ${reservoirTone.text} ${reservoirTone.border}`}>
                    {percentage}%
                  </span>
                </div>

                {/* Regas Restantes */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-3 flex flex-col justify-between">
                  <span className="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider">Regas restantes</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold text-on-surface font-mono-data">≈ {reservoir.remainingWaterings}</span>
                    <span className="text-[10px] text-outline">doses</span>
                  </div>
                </div>

                {/* Previsão */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-3 flex flex-col justify-between">
                  <span className="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider">Previsão</span>
                  <span className="text-[11px] sm:text-xs font-bold text-on-surface block mt-1 leading-tight">
                    {reservoir.remainingMl <= 0
                      ? 'Reabasteça agora'
                      : reservoir.predictedRefillAt
                        ? new Date(reservoir.predictedRefillAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })
                        : `${reservoir.wateringEventsInWindow}/3 regas para calcular`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRefillError(false);
                  setShowRefillConfirm(true);
                }}
                disabled={reservoirLoading}
                className="w-full min-h-[46px] px-4 py-2 rounded-2xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-secondary text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(56,189,248,0.12)]"
              >
                <span className="material-symbols-outlined text-base">water_drop</span>
                Reabasteci agora
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => {
                setRefillError(false);
                setShowRefillConfirm(true);
              }}
              className="sm:hidden w-full min-h-[58px] p-2.5 rounded-2xl bg-secondary/[0.07] border border-secondary/25 active:scale-[0.98] transition-all flex items-center gap-3 text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-on-surface">Reservatório cheio?</span>
                <span className="block text-[10px] text-on-surface-variant mt-0.5">Toque para iniciar a estimativa</span>
              </span>
              <span className="material-symbols-outlined text-secondary text-lg shrink-0">chevron_right</span>
            </button>

            <div className="hidden sm:flex items-center justify-between gap-4">
              <div className="text-left">
                <h4 className="text-sm font-bold text-on-surface">Comece com o reservatório cheio</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Depois da confirmação, o app acompanha automaticamente a água usada nas regas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRefillError(false);
                  setShowRefillConfirm(true);
                }}
                className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-secondary text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_16px_rgba(56,189,248,0.12)]"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                Informar reservatório cheio
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Live Camera Shortcut Card */}
      {onNavigateToCamera && (
        <section 
          onClick={onNavigateToCamera}
          className="clay-card-dark p-4 rounded-3xl flex items-center justify-between cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-title-md text-sm font-bold text-on-surface">Câmera da Planta</h4>
              </div>
              <p className="text-xs text-on-surface-variant">Visualizar transmissão ao vivo</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline">
            chevron_right
          </span>
        </section>
      )}

      {/* Componente RefillModal dedicado com animação de saída de mola 1-para-1 idêntica ao PlantSelector */}
      <RefillModal
        showModal={showRefillConfirm}
        setShowModal={setShowRefillConfirm}
        onConfirmRefill={async () => {
          await handleRefill();
        }}
        loading={reservoirLoading}
        error={refillError}
      />
    </div>
  );
}
