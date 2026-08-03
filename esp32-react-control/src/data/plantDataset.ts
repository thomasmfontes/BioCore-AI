export type ChavePlanta = 'alface' | 'tomate' | 'manjericao';

export type EstagioCultivo = 'muda' | 'vegetativo' | 'floracao_frutificacao' | 'colheita';

export interface FaixaValor {
  minCritico: number;  // Valor abaixo do qual a planta entra em estresse severo
  minIdeal: number;    // Limite inferior da zona ideal de cultivo
  alvo: number;        // Setpoint exato para automação (regas / bombas NPK)
  maxIdeal: number;    // Limite superior da zona ideal de cultivo
  maxCritico: number;  // Valor acima do qual há risco de toxicidade/estresse
}

// ─── OS 8 SENSORES COLETADOS NO VASO ESP32 ───────────────────────────────────

export interface SensoresVaso {
  N: FaixaValor;          // Nitrogênio do Solo (mg/kg) - Sensor NPK
  P: FaixaValor;          // Fósforo do Solo (mg/kg) - Sensor NPK
  K: FaixaValor;          // Potássio do Solo (mg/kg) - Sensor NPK
  u_solo: FaixaValor;     // Umidade do Solo (%)
  temp_solo: FaixaValor;  // Temperatura do Solo (°C)
  temp: FaixaValor;       // Temperatura do Ar (°C)
  u_amb: FaixaValor;      // Umidade Relativa do Ar (%)
  fotoperiodo: number;    // Fotoperíodo recomendado (Horas de Luz por Dia)
  ldrEsperado: 0 | 1;     // LDR (0: Com Iluminação / Sol, 1: Escuro)
}

export interface DadosEstagio {
  nome: string;
  duracaoDias: number;
  descricao: string;
  sensores: SensoresVaso;
}

export interface DiagnosticoSintoma {
  parametro: 'N' | 'P' | 'K' | 'u_solo' | 'temp_solo' | 'temp' | 'u_amb' | 'ldr';
  condicao: 'baixo' | 'alto';
  sintomaVisual: string;
  acaoRecomendada: string;
}

export interface CropDatasetItem {
  chave: ChavePlanta;
  nomePopular: string;
  nomeCientifico: string;
  familia: string;
  emoji: string;
  imagemUrl: string;
  cicloTotalDias: number;
  dificuldade: 'Fácil' | 'Média' | 'Alta';
  descricaoGeral: string;
  estagios: Record<EstagioCultivo, DadosEstagio>;
  diagnosticos: DiagnosticoSintoma[];
  dicasManejo: string[];
}

// ─── DATASET EXCLUSIVO PARA OS 8 SENSORES DO VASO ─────────────────────────────

export const DATASET_PLANTAS: Record<ChavePlanta, CropDatasetItem> = {
  // 🌿 1. MANJERICÃO (Ocimum basilicum)
  manjericao: {
    chave: 'manjericao',
    nomePopular: 'Manjericão Italiano',
    nomeCientifico: 'Ocimum basilicum',
    familia: 'Lamiaceae',
    emoji: '🌿',
    imagemUrl: '/manjericao.jpg',
    cicloTotalDias: 60,
    dificuldade: 'Fácil',
    descricaoGeral: 'Planta aromática de clima quente e ensolarado. Exige solo bem drenado e umidade moderada. A poda constante das flores estimula novas folhas aromáticas.',
    dicasManejo: [
      'Remova botões florais assim que surgirem para focar energia nas folhas.',
      'Mantenha a iluminação diária em 12h para garantir óleos essenciais intensos.',
      'Acione a Bomba 4 (Água) sempre que u_solo cair abaixo de 50%.'
    ],
    diagnosticos: [
      {
        parametro: 'N',
        condicao: 'baixo',
        sintomaVisual: 'Folhas velhas amareladas e crescimento lento.',
        acaoRecomendada: 'Acionar Bomba 1 (Nitrogênio) para elevar N até 35 mg/kg.'
      },
      {
        parametro: 'u_solo',
        condicao: 'baixo',
        sintomaVisual: 'Folhas murchas e caídas.',
        acaoRecomendada: 'Acionar Bomba 4 (Água) para elevar umidade do solo a 55%.'
      },
      {
        parametro: 'u_solo',
        condicao: 'alto',
        sintomaVisual: 'Folhas amareladas de baixo para cima (asfixia radicular).',
        acaoRecomendada: 'Interromper irrigação e permitir secagem do substrato.'
      },
      {
        parametro: 'temp',
        condicao: 'baixo',
        sintomaVisual: 'Manchas escuras nas folhas (queima por frio).',
        acaoRecomendada: 'Manter temperatura do ar acima de 18°C.'
      }
    ],
    estagios: {
      muda: {
        nome: 'Germinação e Mudas',
        duracaoDias: 14,
        descricao: 'Fase inicial. Requer solo constantemente úmido (~70%) e temperatura amena.',
        sensores: {
          N: { minCritico: 15, minIdeal: 25, alvo: 30, maxIdeal: 40, maxCritico: 55 },
          P: { minCritico: 5, minIdeal: 8, alvo: 10, maxIdeal: 15, maxCritico: 25 },
          K: { minCritico: 10, minIdeal: 18, alvo: 22, maxIdeal: 30, maxCritico: 45 },
          u_solo: { minCritico: 55, minIdeal: 65, alvo: 70, maxIdeal: 80, maxCritico: 90 },
          temp_solo: { minCritico: 16, minIdeal: 20, alvo: 24, maxIdeal: 28, maxCritico: 32 },
          temp: { minCritico: 16, minIdeal: 21, alvo: 25, maxIdeal: 29, maxCritico: 34 },
          u_amb: { minCritico: 50, minIdeal: 65, alvo: 75, maxIdeal: 85, maxCritico: 95 },
          fotoperiodo: 14,
          ldrEsperado: 0
        }
      },
      vegetativo: {
        nome: 'Crescimento Vegetativo',
        duracaoDias: 30,
        descricao: 'Expansão de folhas e aroma. Solo mantido em 55% de umidade e fotoperíodo de 12h.',
        sensores: {
          N: { minCritico: 20, minIdeal: 30, alvo: 35, maxIdeal: 45, maxCritico: 65 },
          P: { minCritico: 5, minIdeal: 8, alvo: 10, maxIdeal: 14, maxCritico: 20 },
          K: { minCritico: 15, minIdeal: 20, alvo: 25, maxIdeal: 35, maxCritico: 50 },
          u_solo: { minCritico: 45, minIdeal: 50, alvo: 55, maxIdeal: 65, maxCritico: 80 },
          temp_solo: { minCritico: 15, minIdeal: 18, alvo: 23, maxIdeal: 27, maxCritico: 32 },
          temp: { minCritico: 18, minIdeal: 22, alvo: 26, maxIdeal: 30, maxCritico: 35 },
          u_amb: { minCritico: 40, minIdeal: 55, alvo: 65, maxIdeal: 75, maxCritico: 85 },
          fotoperiodo: 12,
          ldrEsperado: 0
        }
      },
      floracao_frutificacao: {
        nome: 'Manutenção Foliar / Pré-Floração',
        duracaoDias: 16,
        descricao: 'Maturação das folhas. Podar flores assim que surgirem.',
        sensores: {
          N: { minCritico: 20, minIdeal: 28, alvo: 32, maxIdeal: 40, maxCritico: 55 },
          P: { minCritico: 6, minIdeal: 10, alvo: 12, maxIdeal: 16, maxCritico: 22 },
          K: { minCritico: 18, minIdeal: 22, alvo: 28, maxIdeal: 36, maxCritico: 50 },
          u_solo: { minCritico: 40, minIdeal: 50, alvo: 55, maxIdeal: 65, maxCritico: 75 },
          temp_solo: { minCritico: 15, minIdeal: 18, alvo: 22, maxIdeal: 26, maxCritico: 30 },
          temp: { minCritico: 18, minIdeal: 21, alvo: 25, maxIdeal: 28, maxCritico: 33 },
          u_amb: { minCritico: 45, minIdeal: 55, alvo: 65, maxIdeal: 75, maxCritico: 85 },
          fotoperiodo: 12,
          ldrEsperado: 0
        }
      },
      colheita: {
        nome: 'Colheita Contínua',
        duracaoDias: 30,
        descricao: 'Retirada das folhas superiores. Manter umidade em 55%.',
        sensores: {
          N: { minCritico: 15, minIdeal: 22, alvo: 28, maxIdeal: 35, maxCritico: 45 },
          P: { minCritico: 5, minIdeal: 8, alvo: 10, maxIdeal: 12, maxCritico: 18 },
          K: { minCritico: 15, minIdeal: 20, alvo: 24, maxIdeal: 30, maxCritico: 40 },
          u_solo: { minCritico: 45, minIdeal: 50, alvo: 55, maxIdeal: 65, maxCritico: 75 },
          temp_solo: { minCritico: 15, minIdeal: 18, alvo: 22, maxIdeal: 26, maxCritico: 30 },
          temp: { minCritico: 18, minIdeal: 21, alvo: 24, maxIdeal: 28, maxCritico: 32 },
          u_amb: { minCritico: 40, minIdeal: 50, alvo: 60, maxIdeal: 70, maxCritico: 80 },
          fotoperiodo: 12,
          ldrEsperado: 0
        }
      }
    }
  },

  // 🍅 2. TOMATE CEREJA (Solanum lycopersicum var. cerasiforme)
  tomate: {
    chave: 'tomate',
    nomePopular: 'Tomate Cereja Sweet Grape',
    nomeCientifico: 'Solanum lycopersicum var. cerasiforme',
    familia: 'Solanaceae',
    emoji: '🍅',
    imagemUrl: '/tomate-cereja.jpg',
    cicloTotalDias: 90,
    dificuldade: 'Média',
    descricaoGeral: 'Exige nutrição elevada de Fósforo (P) e Potássio (K) na floração/frutificação e fotoperíodo constante de 14h.',
    dicasManejo: [
      'Incremente o Potássio (K) via Bomba 3 a partir da abertura das flores.',
      'Mantenha a umidade do solo em 60% para evitar rachamento nos tomates.',
      'Mantenha fotoperíodo de 14h de iluminação diária.'
    ],
    diagnosticos: [
      {
        parametro: 'K',
        condicao: 'baixo',
        sintomaVisual: 'Frutos com maturação desuniforme e bordas de folhas queimadas.',
        acaoRecomendada: 'Acionar Bomba 3 (Potássio) para atingir 40 mg/kg.'
      },
      {
        parametro: 'P',
        condicao: 'baixo',
        sintomaVisual: 'Parte inferior das folhas arroxeadas e pouca floração.',
        acaoRecomendada: 'Acionar Bomba 2 (Fósforo) para atingir 20 mg/kg.'
      },
      {
        parametro: 'u_solo',
        condicao: 'baixo',
        sintomaVisual: 'Queda de flores por estresse hídrico.',
        acaoRecomendada: 'Acionar Bomba 4 (Água) para restabelecer umidade em 60%.'
      },
      {
        parametro: 'temp',
        condicao: 'alto',
        sintomaVisual: 'Abortamento de flores (temperatura > 32°C).',
        acaoRecomendada: 'Ventilar o ambiente para resfriar abaixo de 28°C.'
      }
    ],
    estagios: {
      muda: {
        nome: 'Germinação e Mudas',
        duracaoDias: 20,
        descricao: 'Formação de raízes e primeiras folhas.',
        sensores: {
          N: { minCritico: 20, minIdeal: 30, alvo: 35, maxIdeal: 45, maxCritico: 60 },
          P: { minCritico: 8, minIdeal: 12, alvo: 15, maxIdeal: 20, maxCritico: 30 },
          K: { minCritico: 15, minIdeal: 22, alvo: 28, maxIdeal: 35, maxCritico: 50 },
          u_solo: { minCritico: 55, minIdeal: 65, alvo: 70, maxIdeal: 75, maxCritico: 85 },
          temp_solo: { minCritico: 18, minIdeal: 21, alvo: 24, maxIdeal: 27, maxCritico: 31 },
          temp: { minCritico: 18, minIdeal: 22, alvo: 25, maxIdeal: 28, maxCritico: 32 },
          u_amb: { minCritico: 55, minIdeal: 65, alvo: 70, maxIdeal: 80, maxCritico: 90 },
          fotoperiodo: 14,
          ldrEsperado: 0
        }
      },
      vegetativo: {
        nome: 'Crescimento Vegetativo',
        duracaoDias: 25,
        descricao: 'Crescimento de hastes e ramos. NPK em 50-18-38 mg/kg.',
        sensores: {
          N: { minCritico: 30, minIdeal: 42, alvo: 50, maxIdeal: 60, maxCritico: 75 },
          P: { minCritico: 10, minIdeal: 15, alvo: 18, maxIdeal: 24, maxCritico: 35 },
          K: { minCritico: 25, minIdeal: 32, alvo: 38, maxIdeal: 48, maxCritico: 65 },
          u_solo: { minCritico: 50, minIdeal: 58, alvo: 62, maxIdeal: 70, maxCritico: 80 },
          temp_solo: { minCritico: 16, minIdeal: 20, alvo: 23, maxIdeal: 27, maxCritico: 31 },
          temp: { minCritico: 18, minIdeal: 22, alvo: 26, maxIdeal: 29, maxCritico: 33 },
          u_amb: { minCritico: 50, minIdeal: 60, alvo: 65, maxIdeal: 75, maxCritico: 85 },
          fotoperiodo: 14,
          ldrEsperado: 0
        }
      },
      floracao_frutificacao: {
        nome: 'Floração e Frutificação (Pico NPK)',
        duracaoDias: 30,
        descricao: 'Formação dos cachos. Demanda máxima de P e K.',
        sensores: {
          N: { minCritico: 30, minIdeal: 40, alvo: 48, maxIdeal: 58, maxCritico: 70 },
          P: { minCritico: 12, minIdeal: 16, alvo: 20, maxIdeal: 26, maxCritico: 38 },
          K: { minCritico: 30, minIdeal: 35, alvo: 40, maxIdeal: 52, maxCritico: 70 },
          u_solo: { minCritico: 52, minIdeal: 58, alvo: 60, maxIdeal: 68, maxCritico: 78 },
          temp_solo: { minCritico: 17, minIdeal: 20, alvo: 23, maxIdeal: 26, maxCritico: 30 },
          temp: { minCritico: 19, minIdeal: 22, alvo: 25, maxIdeal: 28, maxCritico: 32 },
          u_amb: { minCritico: 45, minIdeal: 55, alvo: 60, maxIdeal: 70, maxCritico: 80 },
          fotoperiodo: 14,
          ldrEsperado: 0
        }
      },
      colheita: {
        nome: 'Maturação e Colheita',
        duracaoDias: 15,
        descricao: 'Tomates vermelhos. Manter K elevado (42 mg/kg).',
        sensores: {
          N: { minCritico: 22, minIdeal: 30, alvo: 36, maxIdeal: 45, maxCritico: 58 },
          P: { minCritico: 10, minIdeal: 14, alvo: 16, maxIdeal: 22, maxCritico: 30 },
          K: { minCritico: 28, minIdeal: 35, alvo: 42, maxIdeal: 50, maxCritico: 68 },
          u_solo: { minCritico: 48, minIdeal: 52, alvo: 56, maxIdeal: 62, maxCritico: 72 },
          temp_solo: { minCritico: 16, minIdeal: 19, alvo: 22, maxIdeal: 25, maxCritico: 29 },
          temp: { minCritico: 18, minIdeal: 21, alvo: 24, maxIdeal: 27, maxCritico: 31 },
          u_amb: { minCritico: 40, minIdeal: 50, alvo: 58, maxIdeal: 68, maxCritico: 78 },
          fotoperiodo: 14,
          ldrEsperado: 0
        }
      }
    }
  },

  // 🥬 3. ALFACE CRESPA (Lactuca sativa var. crispa)
  alface: {
    chave: 'alface',
    nomePopular: 'Alface Crespa Verde',
    nomeCientifico: 'Lactuca sativa var. crispa',
    familia: 'Asteraceae',
    emoji: '🥬',
    imagemUrl: '/alface-crespa.jpg',
    cicloTotalDias: 45,
    dificuldade: 'Fácil',
    descricaoGeral: 'Ciclo rápido (45 dias). Necessita de solo bem úmido (65%), fotoperíodo de 16h e temperatura amena (< 25°C) para não pendoar.',
    dicasManejo: [
      'Mantenha a umidade do solo elevada (~65%) acionando a irrigação se cair de 55%.',
      'Garanta fotoperíodo longo de 16 horas para crescimento foliar acelerado.',
      'Evite temperaturas acima de 25°C para não amargar as folhas.'
    ],
    diagnosticos: [
      {
        parametro: 'temp',
        condicao: 'alto',
        sintomaVisual: 'Pendoamento precoce (haste alta e folhas amargas).',
        acaoRecomendada: 'Ventilar ambiente para baixar temperatura abaixo de 24°C.'
      },
      {
        parametro: 'N',
        condicao: 'baixo',
        sintomaVisual: 'Folhas claras/amareladas e crescimento lento.',
        acaoRecomendada: 'Acionar Bomba 1 (Nitrogênio) até atingir 45 mg/kg.'
      },
      {
        parametro: 'u_solo',
        condicao: 'baixo',
        sintomaVisual: 'Bordas de folhas queimadas (tipburn hídrico).',
        acaoRecomendada: 'Acionar Bomba 4 (Água) e manter umidade em 65%.'
      }
    ],
    estagios: {
      muda: {
        nome: 'Germinação e Mudinhas',
        duracaoDias: 10,
        descricao: 'Plântulas delicadas. Solo úmido em 72%.',
        sensores: {
          N: { minCritico: 15, minIdeal: 22, alvo: 28, maxIdeal: 35, maxCritico: 48 },
          P: { minCritico: 5, minIdeal: 8, alvo: 10, maxIdeal: 14, maxCritico: 20 },
          K: { minCritico: 10, minIdeal: 16, alvo: 20, maxIdeal: 26, maxCritico: 38 },
          u_solo: { minCritico: 60, minIdeal: 68, alvo: 72, maxIdeal: 80, maxCritico: 90 },
          temp_solo: { minCritico: 15, minIdeal: 18, alvo: 20, maxIdeal: 23, maxCritico: 26 },
          temp: { minCritico: 15, minIdeal: 18, alvo: 21, maxIdeal: 24, maxCritico: 28 },
          u_amb: { minCritico: 60, minIdeal: 70, alvo: 75, maxIdeal: 85, maxCritico: 95 },
          fotoperiodo: 16,
          ldrEsperado: 0
        }
      },
      vegetativo: {
        nome: 'Expansão Foliar Rápida',
        duracaoDias: 25,
        descricao: 'Fase principal. Alta demanda de Nitrogênio (45 mg/kg) e 16h de luz.',
        sensores: {
          N: { minCritico: 25, minIdeal: 35, alvo: 45, maxIdeal: 55, maxCritico: 70 },
          P: { minCritico: 6, minIdeal: 9, alvo: 12, maxIdeal: 16, maxCritico: 24 },
          K: { minCritico: 18, minIdeal: 24, alvo: 30, maxIdeal: 38, maxCritico: 52 },
          u_solo: { minCritico: 55, minIdeal: 62, alvo: 65, maxIdeal: 72, maxCritico: 82 },
          temp_solo: { minCritico: 14, minIdeal: 17, alvo: 20, maxIdeal: 23, maxCritico: 26 },
          temp: { minCritico: 16, minIdeal: 18, alvo: 22, maxIdeal: 24, maxCritico: 28 },
          u_amb: { minCritico: 50, minIdeal: 60, alvo: 68, maxIdeal: 75, maxCritico: 85 },
          fotoperiodo: 16,
          ldrEsperado: 0
        }
      },
      floracao_frutificacao: {
        nome: 'Pré-Colheita / Formação da Cabeça',
        duracaoDias: 5,
        descricao: 'Roseta formada. Manter umidade em 65%.',
        sensores: {
          N: { minCritico: 22, minIdeal: 32, alvo: 40, maxIdeal: 48, maxCritico: 60 },
          P: { minCritico: 6, minIdeal: 9, alvo: 11, maxIdeal: 14, maxCritico: 20 },
          K: { minCritico: 16, minIdeal: 22, alvo: 28, maxIdeal: 34, maxCritico: 46 },
          u_solo: { minCritico: 55, minIdeal: 62, alvo: 65, maxIdeal: 70, maxCritico: 80 },
          temp_solo: { minCritico: 14, minIdeal: 17, alvo: 19, maxIdeal: 22, maxCritico: 25 },
          temp: { minCritico: 15, minIdeal: 18, alvo: 21, maxIdeal: 23, maxCritico: 26 },
          u_amb: { minCritico: 50, minIdeal: 60, alvo: 65, maxIdeal: 72, maxCritico: 80 },
          fotoperiodo: 16,
          ldrEsperado: 0
        }
      },
      colheita: {
        nome: 'Colheita Total',
        duracaoDias: 5,
        descricao: 'Corte da roseta.',
        sensores: {
          N: { minCritico: 15, minIdeal: 25, alvo: 30, maxIdeal: 38, maxCritico: 48 },
          P: { minCritico: 5, minIdeal: 7, alvo: 9, maxIdeal: 12, maxCritico: 16 },
          K: { minCritico: 12, minIdeal: 18, alvo: 22, maxIdeal: 28, maxCritico: 38 },
          u_solo: { minCritico: 50, minIdeal: 58, alvo: 62, maxIdeal: 68, maxCritico: 75 },
          temp_solo: { minCritico: 14, minIdeal: 16, alvo: 19, maxIdeal: 22, maxCritico: 25 },
          temp: { minCritico: 14, minIdeal: 17, alvo: 20, maxIdeal: 23, maxCritico: 26 },
          u_amb: { minCritico: 45, minIdeal: 55, alvo: 62, maxIdeal: 70, maxCritico: 78 },
          fotoperiodo: 16,
          ldrEsperado: 0
        }
      }
    }
  }
};

// ─── FUNÇÃO DE COMPARAÇÃO DE TELEMETRIA COM OS 8 SENSORES DO VASO ───────────

export interface TelemetryComparisonResult {
  sensor: keyof SensoresVaso;
  label: string;
  valorAtual: number;
  unidade: string;
  alvoIdeal: number;
  minIdeal: number;
  maxIdeal: number;
  status: 'perfeito' | 'atencao' | 'critico';
  mensagem: string;
}

export function compararSensoresComDataset(
  sensores: { N?: number; P?: number; K?: number; u_solo?: number; temp_solo?: number; temp?: number; u_amb?: number; ldr?: number },
  chavePlanta: ChavePlanta,
  estagio: EstagioCultivo = 'vegetativo'
): TelemetryComparisonResult[] {
  const dadosPlanta = DATASET_PLANTAS[chavePlanta];
  if (!dadosPlanta) return [];

  const dadosEstagio = dadosPlanta.estagios[estagio] || dadosPlanta.estagios.vegetativo;
  const s = dadosEstagio.sensores;
  const resultados: TelemetryComparisonResult[] = [];

  const avaliar = (
    key: keyof SensoresVaso,
    label: string,
    valor: number | undefined,
    unidade: string,
    faixa: FaixaValor
  ) => {
    if (valor === undefined || valor === null || isNaN(valor)) return;

    let status: 'perfeito' | 'atencao' | 'critico' = 'perfeito';
    let mensagem = `${label} em nível ideal (${faixa.alvo}${unidade}).`;

    if (valor < faixa.minCritico) {
      status = 'critico';
      mensagem = `CRÍTICO: ${label} (${valor}${unidade}) muito abaixo do mínimo crítico (${faixa.minCritico}${unidade}).`;
    } else if (valor > faixa.maxCritico) {
      status = 'critico';
      mensagem = `CRÍTICO: ${label} (${valor}${unidade}) muito acima do máximo crítico (${faixa.maxCritico}${unidade}).`;
    } else if (valor < faixa.minIdeal) {
      status = 'atencao';
      mensagem = `ATENÇÃO: ${label} (${valor}${unidade}) abaixo da faixa ideal (${faixa.minIdeal} - ${faixa.maxIdeal}${unidade}).`;
    } else if (valor > faixa.maxIdeal) {
      status = 'atencao';
      mensagem = `ATENÇÃO: ${label} (${valor}${unidade}) acima da faixa ideal (${faixa.minIdeal} - ${faixa.maxIdeal}${unidade}).`;
    }

    resultados.push({
      sensor: key,
      label,
      valorAtual: valor,
      unidade,
      alvoIdeal: faixa.alvo,
      minIdeal: faixa.minIdeal,
      maxIdeal: faixa.maxIdeal,
      status,
      mensagem
    });
  };

  avaliar('N', 'Nitrogênio (N)', sensores.N, ' mg/kg', s.N);
  avaliar('P', 'Fósforo (P)', sensores.P, ' mg/kg', s.P);
  avaliar('K', 'Potássio (K)', sensores.K, ' mg/kg', s.K);
  avaliar('u_solo', 'Umidade do Solo', sensores.u_solo, '%', s.u_solo);
  avaliar('temp_solo', 'Temperatura do Solo', sensores.temp_solo, '°C', s.temp_solo);
  avaliar('temp', 'Temperatura do Ar', sensores.temp, '°C', s.temp);
  avaliar('u_amb', 'Umidade do Ar', sensores.u_amb, '%', s.u_amb);

  return resultados;
}
