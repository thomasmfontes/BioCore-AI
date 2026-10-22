-- =============================================================================
-- BIOCORE AI - TABELA DE PARTICIPANTES DO SORTEIO DA ALEXA SHOW 5 (FEIRA NEXT)
-- Tabela 100% isolada das tabelas agronômicas do Vaso Inteligente
-- =============================================================================

CREATE TABLE IF NOT EXISTS t_sorteio_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(25) UNIQUE NOT NULL,
    instagram VARCHAR(80) NOT NULL,
    votou_confirmado BOOLEAN NOT NULL DEFAULT true,
    sorteado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_sorteio_whatsapp ON t_sorteio_participantes(whatsapp);
CREATE INDEX IF NOT EXISTS idx_sorteio_created_at ON t_sorteio_participantes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sorteio_sorteado ON t_sorteio_participantes(sorteado);

-- Habilitar Row Level Security (RLS)
ALTER TABLE t_sorteio_participantes ENABLE ROW LEVEL SECURITY;

-- 1. Permitir que visitantes insiram seus dados sem login (Anon)
CREATE POLICY "Permitir inscricao publica no sorteio"
ON t_sorteio_participantes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Permitir leitura pública dos participantes para consulta e painel da banca
CREATE POLICY "Permitir leitura dos participantes no sorteio"
ON t_sorteio_participantes
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Permitir atualização do status de sorteado
CREATE POLICY "Permitir marcar participante sorteado"
ON t_sorteio_participantes
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
