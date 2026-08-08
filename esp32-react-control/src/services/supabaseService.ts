import { supabase } from '../lib/supabase'
import type { SensorData } from '../types'

export interface HortalicaDb {
  cd_hortalica: string
  ds_nome: string
  ds_icone: string
  vl_umidade_solo_alvo: number
  vl_n_alvo: number
  vl_p_alvo: number
  vl_k_alvo: number
  vl_fotoperiodo_alvo: number
  ds_descricao?: string
}

export interface ControleLuzDiaria {
  id_luz_diaria?: number
  id_device: string
  dt_referencia: string
  vl_estagio_luz_atual: number
  vl_tempo_sol_acumulado_ms: number
  vl_tempo_led_acumulado_ms: number
  vl_fotoperiodo_meta_hs: number
  st_compensacao_concluida: boolean
  dt_ultima_atualizacao?: string
}

const DEVICE_ID = 'biocore_01'

/**
 * Obtém o estado de luz do dia atual salvo no Supabase
 */
export async function getControleLuzHoje(deviceId: string = DEVICE_ID): Promise<ControleLuzDiaria | null> {
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  try {
    const { data, error } = await supabase
      .from('t_controle_luz_diaria')
      .select('*')
      .eq('id_device', deviceId)
      .eq('dt_referencia', hoje)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase] Erro ao buscar controle de luz:', error)
      return null
    }

    return data as ControleLuzDiaria | null
  } catch (err) {
    console.error('[Supabase] Exceção ao buscar luz:', err)
    return null
  }
}

/**
 * Atualiza ou insere o registro de luz diária no Supabase com mesclagem segura
 */
export async function salvarControleLuzHoje(dados: Partial<ControleLuzDiaria>, deviceId: string = DEVICE_ID) {
  // Usa a data local no fuso do Brasil (YYYY-MM-DD) para virar o dia exatamente à meia-noite local (00:00 BRT)
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  try {
    // 1. Busca linha existente do dia para não zerar fotoperíodo ou contadores acumulados
    const { data: linhaExistente } = await supabase
      .from('t_controle_luz_diaria')
      .select('*')
      .eq('id_device', deviceId)
      .eq('dt_referencia', hoje)
      .maybeSingle()

    const payload = {
      id_device: deviceId,
      dt_referencia: hoje,
      vl_fotoperiodo_meta_hs: dados.vl_fotoperiodo_meta_hs ?? linhaExistente?.vl_fotoperiodo_meta_hs ?? 14,
      vl_tempo_sol_acumulado_ms: dados.vl_tempo_sol_acumulado_ms ?? linhaExistente?.vl_tempo_sol_acumulado_ms ?? 0,
      vl_tempo_led_acumulado_ms: dados.vl_tempo_led_acumulado_ms ?? linhaExistente?.vl_tempo_led_acumulado_ms ?? 0,
      vl_estagio_luz_atual: dados.vl_estagio_luz_atual ?? linhaExistente?.vl_estagio_luz_atual ?? 0,
      st_compensacao_concluida: dados.st_compensacao_concluida ?? linhaExistente?.st_compensacao_concluida ?? false,
      dt_ultima_atualizacao: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('t_controle_luz_diaria')
      .upsert(payload, { onConflict: 'id_device,dt_referencia' })
      .select()

    if (error) {
      console.error('[Supabase] Erro ao salvar controle de luz:', error)
    }

    return data
  } catch (err) {
    console.error('[Supabase] Exceção ao salvar luz:', err)
  }
}

/**
 * Registra leitura de telemetria dos sensores no Supabase
 */
export async function salvarTelemetria(telemetria: SensorData, deviceId: string = DEVICE_ID) {
  try {
    const { error } = await supabase.from('t_telemetria_leitura').insert({
      id_device: deviceId,
      vl_umidade_solo: telemetria.u_solo,
      vl_temperatura_solo: telemetria.temp_solo ?? null,
      vl_temperatura_ambiente: telemetria.temp,
      vl_umidade_ambiente: telemetria.u_amb,
      vl_sensor_npk_n: telemetria.N,
      vl_sensor_npk_p: telemetria.P,
      vl_sensor_npk_k: telemetria.K,
      st_sensor_ldr_sol: telemetria.ldr === 0, // LDR LOW = Sol
    })

    if (error) {
      console.error('[Supabase] Erro ao registrar telemetria:', error)
    }
  } catch (err) {
    console.error('[Supabase] Exceção na telemetria:', err)
  }
}

/**
 * Inicia o registro de uma atuação (bomba ou luz) no Supabase.
 * Deixa dt_fim = NULL e vl_duracao_ms = NULL enquanto estiver ligada.
 */
export async function iniciarAtuacao(
  tpAtuador: 'BOMBA_N' | 'BOMBA_P' | 'BOMBA_K' | 'BOMBA_H2O' | 'LED_PWM' | 'BIOCORE_AI',
  motivo?: string,
  deviceId: string = DEVICE_ID
): Promise<number | null> {
  try {
    const agora = new Date().toISOString()
    const { data, error } = await supabase
      .from('t_historico_atuacao')
      .insert({
        id_device: deviceId,
        tp_atuador: tpAtuador,
        ds_motivo: motivo,
        dt_inicio: agora,
        dt_fim: null,
        vl_duracao_ms: null,
        dt_atuacao: agora,
      })
      .select('id_atuacao')
      .single()

    if (error) {
      console.error('[Supabase] Erro ao iniciar atuação:', error)
      return null
    }

    return data?.id_atuacao || null
  } catch (err) {
    console.error('[Supabase] Exceção ao iniciar atuação:', err)
    return null
  }
}

/**
 * Finaliza o registro de uma atuação no Supabase preenchendo dt_fim e vl_duracao_ms.
 */
export async function finalizarAtuacao(
  idAtuacao: number | null,
  duracaoMs: number,
  tpAtuador?: 'BOMBA_N' | 'BOMBA_P' | 'BOMBA_K' | 'BOMBA_H2O' | 'LED_PWM' | 'BIOCORE_AI',
  motivo?: string,
  dtInicioMs?: number,
  deviceId: string = DEVICE_ID
) {
  try {
    const agora = new Date().toISOString()

    if (idAtuacao) {
      const { error } = await supabase
        .from('t_historico_atuacao')
        .update({
          dt_fim: agora,
          vl_duracao_ms: Math.round(duracaoMs),
        })
        .eq('id_atuacao', idAtuacao)

      if (!error) return
    }

    // Se idAtuacao não existia ou falhou, insere o registro completo direto
    const inicioDate = dtInicioMs ? new Date(dtInicioMs).toISOString() : agora
    await supabase.from('t_historico_atuacao').insert({
      id_device: deviceId,
      tp_atuador: tpAtuador || 'BOMBA_H2O',
      vl_duracao_ms: Math.round(duracaoMs),
      ds_motivo: motivo || 'Concluído',
      dt_inicio: inicioDate,
      dt_fim: agora,
      dt_atuacao: inicioDate,
    })
  } catch (err) {
    console.error('[Supabase] Exceção ao finalizar atuação:', err)
  }
}

/**
 * Registra histórico de atuação instantânea no Supabase
 */
export async function registrarAtuacao(
  tpAtuador: 'BOMBA_N' | 'BOMBA_P' | 'BOMBA_K' | 'BOMBA_H2O' | 'LED_PWM' | 'BIOCORE_AI',
  duracaoMs?: number,
  motivo?: string,
  dtInicioMs?: number,
  dtFimMs?: number,
  deviceId: string = DEVICE_ID
) {
  try {
    const inicioDate = dtInicioMs ? new Date(dtInicioMs).toISOString() : new Date().toISOString()
    const fimDate = dtFimMs ? new Date(dtFimMs).toISOString() : (duracaoMs ? new Date().toISOString() : null)

    const { error } = await supabase.from('t_historico_atuacao').insert({
      id_device: deviceId,
      tp_atuador: tpAtuador,
      vl_duracao_ms: duracaoMs || null,
      ds_motivo: motivo,
      dt_inicio: inicioDate,
      dt_fim: fimDate,
      dt_atuacao: inicioDate,
    })

    if (error) {
      console.error('[Supabase] Erro ao registrar atuação:', error)
    }
  } catch (err) {
    console.error('[Supabase] Exceção na atuação:', err)
  }
}

/**
 * Busca a sessão de cultivo ativa (Modo Inteligente & Hortaliça)
 */
export async function getCultivoAtivo(deviceId: string = DEVICE_ID) {
  try {
    const { data, error } = await supabase
      .from('t_cultivo_sessao')
      .select('*')
      .eq('id_device', deviceId)
      .eq('st_ativo', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase] Erro ao buscar cultivo ativo:', error)
      return null
    }

    return data as { id_cultivo: number; id_device: string; cd_hortalica: string; st_modo_inteligente: boolean } | null
  } catch (err) {
    console.error('[Supabase] Exceção ao buscar cultivo ativo:', err)
    return null
  }
}

/**
 * Salva ou atualiza a sessão de cultivo ativa no Supabase (Persiste o botão BioCore AI)
 */
export async function salvarCultivoAtivo(stModoInteligente: boolean, cdHortalica?: string, deviceId: string = DEVICE_ID) {
  try {
    // Busca a sessão ativa atual
    const atual = await getCultivoAtivo(deviceId)

    if (atual) {
      const payload: any = {
        st_modo_inteligente: stModoInteligente,
      }
      if (cdHortalica) payload.cd_hortalica = cdHortalica

      const { error } = await supabase
        .from('t_cultivo_sessao')
        .update(payload)
        .eq('id_cultivo', atual.id_cultivo)

      if (error) console.error('[Supabase] Erro ao atualizar cultivo ativo:', error)
    } else {
      const { error } = await supabase.from('t_cultivo_sessao').insert({
        id_device: deviceId,
        cd_hortalica: cdHortalica || 'MANJERICAO',
        st_modo_inteligente: stModoInteligente,
        st_ativo: true,
      })

      if (error) console.error('[Supabase] Erro ao criar cultivo ativo:', error)
    }
  } catch (err) {
    console.error('[Supabase] Exceção ao salvar cultivo ativo:', err)
  }
}

/**
 * Busca histórico persistente de eventos registrados no Supabase
 */
export async function getHistoricoEventos(deviceId: string = DEVICE_ID) {
  try {
    const { data, error } = await supabase
      .from('t_historico_atuacao')
      .select('*')
      .eq('id_device', deviceId)
      .order('dt_atuacao', { ascending: false })
      .limit(30)

    if (error) {
      console.error('[Supabase] Erro ao buscar histórico de eventos:', error)
      return []
    }

    return (data || []).map(item => {
      let label = item.ds_motivo || 'Acionamento'
      if (item.tp_atuador.startsWith('BOMBA_')) {
        const nomeBomba = item.tp_atuador.replace('BOMBA_', 'Bomba ')
        label = `${nomeBomba} → ${item.ds_motivo}`
      } else if (item.tp_atuador === 'LED_PWM' && item.ds_motivo.includes('Modo BioCore AI')) {
        label = `BioCore AI → ${item.ds_motivo.includes('ATIVADO') ? 'ATIVADO' : 'DESATIVADO'}`
      }

      return {
        id: item.id_atuacao,
        time: new Date(item.dt_atuacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: label
      }
    })
  } catch (err) {
    console.error('[Supabase] Exceção ao buscar histórico de eventos:', err)
    return []
  }
}

/**
 * Busca a data/hora do último acionamento da Bomba de Água (BOMBA_H2O) no Supabase
 */
export async function getUltimoAcionamentoBombaH2O(deviceId: string = DEVICE_ID): Promise<number | null> {
  try {
    const { data } = await supabase
      .from('t_historico_atuacao')
      .select('dt_inicio')
      .eq('id_device', deviceId)
      .eq('tp_atuador', 'BOMBA_H2O')
      .order('dt_inicio', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.dt_inicio) {
      return new Date(data.dt_inicio).getTime()
    }
    return null
  } catch {
    return null
  }
}
/**
 * Atualiza o status de conectividade do dispositivo na tabela t_dispositivo (ONLINE/OFFLINE)
 */
export async function atualizarStatusDispositivo(status: 'ONLINE' | 'OFFLINE' | 'SETUP', ipLocal?: string, deviceId: string = DEVICE_ID) {
  try {
    const payload: any = {
      st_status: status,
      dt_ultimo_ping: new Date().toISOString()
    }
    if (ipLocal) payload.ds_ip_local = ipLocal

    const { error } = await supabase
      .from('t_dispositivo')
      .update(payload)
      .eq('id_device', deviceId)

    if (error) console.error('[Supabase] Erro ao atualizar status do dispositivo:', error)
  } catch (err) {
    console.error('[Supabase] Exceção ao atualizar status do dispositivo:', err)
  }
}
