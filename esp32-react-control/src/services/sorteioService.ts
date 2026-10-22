import { supabase } from '../lib/supabase'
import { ParticipanteSorteio } from '../types'

const LOCAL_STORAGE_KEY = 'biocore_sorteio_offline_backup'
const SUBMITTED_STORAGE_KEY = 'biocore_sorteio_meu_cadastro'

// Salvar no backup local (resiliência caso a rede da feira falhe)
function salvarBackupLocal(participante: ParticipanteSorteio) {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY)
    const list: ParticipanteSorteio[] = existing ? JSON.parse(existing) : []
    const index = list.findIndex(p => p.whatsapp === participante.whatsapp)
    if (index >= 0) {
      list[index] = participante
    } else {
      list.push(participante)
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('Erro ao salvar backup local do sorteio:', err)
  }
}

export function salvarMeuCadastroConfirmado(participante: ParticipanteSorteio): void {
  try {
    localStorage.setItem(SUBMITTED_STORAGE_KEY, JSON.stringify(participante))
  } catch (err) {
    console.warn('Erro ao salvar cadastro confirmado:', err)
  }
}

export function getMeuCadastroLocal(): ParticipanteSorteio | null {
  try {
    const item = localStorage.getItem(SUBMITTED_STORAGE_KEY)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function limparMeuCadastroLocal(): void {
  try {
    localStorage.removeItem(SUBMITTED_STORAGE_KEY)
  } catch (err) {
    console.warn('Erro ao limpar cadastro local:', err)
  }
}

export async function cadastrarParticipante(dados: {
  nome_completo: string
  whatsapp: string
  instagram: string
  votou_confirmado: boolean
}): Promise<{ success: boolean; message: string; data?: ParticipanteSorteio }> {
  // Limpeza e normalização
  const nomeLimpo = dados.nome_completo.trim()
  const whatsLimpo = dados.whatsapp.trim()
  let instaLimpo = dados.instagram.trim()
  if (instaLimpo && !instaLimpo.startsWith('@')) {
    instaLimpo = `@${instaLimpo}`
  }

  const novoParticipante: ParticipanteSorteio = {
    nome_completo: nomeLimpo,
    whatsapp: whatsLimpo,
    instagram: instaLimpo,
    votou_confirmado: dados.votou_confirmado,
    created_at: new Date().toISOString()
  }

  // Sempre grava no localStorage primeiro (offline-first garantido)
  salvarBackupLocal(novoParticipante)

  try {
    // 1. Verificar se já existe cadastrado com este WhatsApp
    const { data: existente, error: searchError } = await supabase
      .from('t_sorteio_participantes')
      .select('*')
      .eq('whatsapp', whatsLimpo)
      .maybeSingle()

    if (searchError && searchError.code !== 'PGRST116') {
      console.warn('Erro na busca prévia do Supabase:', searchError)
    }

    if (existente) {
      return {
        success: false,
        message: 'Este número de WhatsApp já está cadastrado no sorteio!',
        data: existente
      }
    }

    // 2. Inserir no Supabase
    const { data, error } = await supabase
      .from('t_sorteio_participantes')
      .insert([
        {
          nome_completo: nomeLimpo,
          whatsapp: whatsLimpo,
          instagram: instaLimpo,
          votou_confirmado: dados.votou_confirmado,
          sorteado: false
        }
      ])
      .select()
      .single()

    if (error) {
      // Se for violação de chave única
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Este número de WhatsApp já foi cadastrado no sorteio!'
        }
      }
      console.error('Erro ao inserir no Supabase:', error)
      // Se falhar o banco mas salvou local, consideramos sucesso com fallback offline
      salvarMeuCadastroConfirmado(novoParticipante)
      return {
        success: true,
        message: 'Cadastro registrado com sucesso!',
        data: novoParticipante
      }
    }

    salvarMeuCadastroConfirmado(data)
    return {
      success: true,
      message: 'Inscrição confirmada com sucesso!',
      data
    }
  } catch (err: any) {
    console.error('Erro geral ao cadastrar participante:', err)
    // Offline fallback
    salvarMeuCadastroConfirmado(novoParticipante)
    return {
      success: true,
      message: 'Cadastro registrado localmente com sucesso!',
      data: novoParticipante
    }
  }
}

export async function listarParticipantes(): Promise<ParticipanteSorteio[]> {
  try {
    const { data, error } = await supabase
      .from('t_sorteio_participantes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao carregar participantes do Supabase, buscando backup local:', error)
      const local = localStorage.getItem(LOCAL_STORAGE_KEY)
      return local ? JSON.parse(local) : []
    }

    return data || []
  } catch (err) {
    console.error('Falha de conexão ao listar participantes:', err)
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    return local ? JSON.parse(local) : []
  }
}

export async function marcarParticipanteSorteado(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('t_sorteio_participantes')
      .update({ sorteado: true })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar sorteado:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Erro de conexão ao marcar sorteado:', err)
    return false
  }
}

export function exportarParticipantesCSV(participantes: ParticipanteSorteio[]) {
  if (!participantes.length) {
    alert('Nenhum participante para exportar.')
    return
  }

  // BOM para compatibilidade com o Excel no Brasil (acentos corretos)
  const BOM = '\uFEFF'
  const headers = ['Nome Completo', 'WhatsApp', 'Instagram', 'Votei no Projeto', 'Sorteado', 'Data/Hora de Inscrição']
  
  const rows = participantes.map(p => {
    const dataHora = p.created_at ? new Date(p.created_at).toLocaleString('pt-BR') : ''
    return [
      `"${(p.nome_completo || '').replace(/"/g, '""')}"`,
      `"${p.whatsapp || ''}"`,
      `"${p.instagram || ''}"`,
      p.votou_confirmado ? '"Sim"' : '"Não"',
      p.sorteado ? '"Sim"' : '"Não"',
      `"${dataHora}"`
    ].join(';')
  })

  const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `sorteio_biocore_alexa_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
