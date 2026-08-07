-- =============================================================================
-- BIOCORE AI - MODELAGEM DE BANCO DE DADOS RELACIONAL (SUPABASE / POSTGRESQL)
-- Padrão de Nomenclatura Enterprise:
--   t_  : Tabelas
--   id_ : Identificadores / Chaves Primárias e Estrangeiras
--   cd_ : Códigos e Slugs de referência
--   ds_ : Descrições, Nomes e Textos
--   vl_ : Valores numéricos e métricas
--   st_ : Status e Flags booleanos
--   dt_ : Datas e Carimbos de Data/Hora (Timestamps)
-- =============================================================================

-- 1. TABELA DE CADASTRO DE HORTALIÇAS (PARÂMETROS ALVO AGRONÔMICOS)
CREATE TABLE IF NOT EXISTS t_hortalica (
    cd_hortalica          VARCHAR(50) PRIMARY KEY, -- 'MANJERICAO', 'TOMATE_CEREJA', 'ALFACE'
    ds_nome               VARCHAR(100) NOT NULL,
    ds_icone              VARCHAR(10) DEFAULT '🌱',
    vl_umidade_solo_alvo  INT NOT NULL DEFAULT 60,
    vl_n_alvo             INT NOT NULL DEFAULT 45,
    vl_p_alvo             INT NOT NULL DEFAULT 10,
    vl_k_alvo             INT NOT NULL DEFAULT 25,
    vl_fotoperiodo_alvo   INT NOT NULL DEFAULT 12,
    vl_temp_ambiente_alvo NUMERIC(4,1) DEFAULT 24.0,
    vl_u_ambiente_alvo    INT DEFAULT 60,
    vl_temp_solo_alvo     NUMERIC(4,1) DEFAULT 20.0,
    ds_descricao          TEXT,
    dt_cadastro           TIMESTAMPTZ DEFAULT NOW()
);

-- Carga inicial das hortaliças padrão calibradas agronomicamente
INSERT INTO t_hortalica (cd_hortalica, ds_nome, ds_icone, vl_umidade_solo_alvo, vl_n_alvo, vl_p_alvo, vl_k_alvo, vl_fotoperiodo_alvo, vl_temp_ambiente_alvo, vl_u_ambiente_alvo, vl_temp_solo_alvo, ds_descricao)
VALUES 
  ('ALFACE', 'Alface Crespa', '🥬', 70, 150, 40, 180, 14, 20.0, 65, 18.0, 'Folhosa de clima ameno (20°C). Exige solo bem úmido (70%), NPK foliar (150-40-180 mg/kg) e fotoperíodo de 14h.'),
  ('MANJERICAO', 'Manjericão', '🌿', 55, 120, 35, 160, 14, 24.0, 60, 22.0, 'Erva aromática termófila (24°C). Solo drenado (55%), NPK para óleos essenciais (120-35-160 mg/kg) e fotoperíodo de 14h.'),
  ('TOMATE_CEREJA', 'Tomate Cereja', '🍅', 65, 180, 60, 250, 16, 25.0, 60, 21.0, 'Frutífera de alto DLI (16h) e temperatura (25°C). Elevado consumo de Potássio e Nitrogênio (180-60-250 mg/kg).')
ON CONFLICT (cd_hortalica) DO UPDATE SET
  ds_nome = EXCLUDED.ds_nome,
  ds_icone = EXCLUDED.ds_icone,
  vl_umidade_solo_alvo = EXCLUDED.vl_umidade_solo_alvo,
  vl_n_alvo = EXCLUDED.vl_n_alvo,
  vl_p_alvo = EXCLUDED.vl_p_alvo,
  vl_k_alvo = EXCLUDED.vl_k_alvo,
  vl_fotoperiodo_alvo = EXCLUDED.vl_fotoperiodo_alvo,
  vl_temp_ambiente_alvo = EXCLUDED.vl_temp_ambiente_alvo,
  vl_u_ambiente_alvo = EXCLUDED.vl_u_ambiente_alvo,
  vl_temp_solo_alvo = EXCLUDED.vl_temp_solo_alvo,
  ds_descricao = EXCLUDED.ds_descricao;


-- 2. TABELA DE CADASTRO DO DISPOSITIVO (VASO BIOCORE AI)
CREATE TABLE IF NOT EXISTS t_dispositivo (
    id_device             VARCHAR(50) PRIMARY KEY,
    ds_nome_dispositivo   VARCHAR(100) NOT NULL DEFAULT 'Vaso BioCore AI',
    st_status             VARCHAR(20) DEFAULT 'OFFLINE', -- 'ONLINE', 'OFFLINE', 'SETUP'
    ds_ip_local           VARCHAR(45),
    ds_firmware_versao    VARCHAR(20) DEFAULT 'v1.0.0',
    dt_ultimo_ping        TIMESTAMPTZ,
    dt_cadastro           TIMESTAMPTZ DEFAULT NOW()
);

-- Carga inicial do dispositivo padrão
INSERT INTO t_dispositivo (id_device, ds_nome_dispositivo)
VALUES ('biocore_01', 'BioCore AI Vaso Principal')
ON CONFLICT (id_device) DO NOTHING;


-- 3. TABELA DE SESSÃO E ESTADO DO CULTIVO ATIVO
CREATE TABLE IF NOT EXISTS t_cultivo_sessao (
    id_cultivo            BIGSERIAL PRIMARY KEY,
    id_device             VARCHAR(50) NOT NULL REFERENCES t_dispositivo(id_device) ON DELETE CASCADE,
    cd_hortalica          VARCHAR(50) NOT NULL REFERENCES t_hortalica(cd_hortalica),
    st_modo_inteligente   BOOLEAN DEFAULT TRUE,
    dt_inicio_cultivo     TIMESTAMPTZ DEFAULT NOW(),
    dt_fim_cultivo        TIMESTAMPTZ,
    st_ativo              BOOLEAN DEFAULT TRUE
);

-- Garante apenas 1 cultivo ativo por dispositivo por vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_cultivo_ativo ON t_cultivo_sessao (id_device) WHERE (st_ativo = TRUE);

INSERT INTO t_cultivo_sessao (id_device, cd_hortalica, st_modo_inteligente)
VALUES ('biocore_01', 'MANJERICAO', TRUE)
ON CONFLICT DO NOTHING;


-- 4. TABELA DE CONTROLE DIÁRIO DE LUZ (FOTOPERÍODO & DLI PERSISTENTE)
-- Garante persistência se o vaso for desligado da tomada!
CREATE TABLE IF NOT EXISTS t_controle_luz_diaria (
    id_luz_diaria               BIGSERIAL PRIMARY KEY,
    id_device                   VARCHAR(50) NOT NULL REFERENCES t_dispositivo(id_device) ON DELETE CASCADE,
    dt_referencia               DATE NOT NULL DEFAULT CURRENT_DATE,
    vl_estagio_luz_atual        INT NOT NULL DEFAULT 0, -- 0=OFF, 1=25%, 2=50%, 3=100%
    vl_tempo_sol_acumulado_ms   BIGINT NOT NULL DEFAULT 0,
    vl_tempo_led_acumulado_ms   BIGINT NOT NULL DEFAULT 0,
    vl_fotoperiodo_meta_hs      INT NOT NULL DEFAULT 12,
    st_compensacao_concluida    BOOLEAN DEFAULT FALSE,
    dt_ultima_atualizacao       TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unq_luz_dispositivo_dia UNIQUE (id_device, dt_referencia)
);

INSERT INTO t_controle_luz_diaria (id_device, dt_referencia, vl_estagio_luz_atual, vl_fotoperiodo_meta_hs)
VALUES ('biocore_01', CURRENT_DATE, 0, 12)
ON CONFLICT (id_device, dt_referencia) DO NOTHING;


-- 5. TABELA DE TELEMETRIA HISTÓRICA DOS SENSORES (LEITURAS)
CREATE TABLE IF NOT EXISTS t_telemetria_leitura (
    id_telemetria             BIGSERIAL PRIMARY KEY,
    id_device                 VARCHAR(50) NOT NULL REFERENCES t_dispositivo(id_device) ON DELETE CASCADE,
    vl_umidade_solo           NUMERIC(5,2),
    vl_temperatura_solo       NUMERIC(5,2),
    vl_temperatura_ambiente   NUMERIC(5,2),
    vl_umidade_ambiente       NUMERIC(5,2),
    vl_sensor_npk_n           INT,
    vl_sensor_npk_p           INT,
    vl_sensor_npk_k           INT,
    st_sensor_ldr_sol         BOOLEAN DEFAULT FALSE, -- TRUE = Sol detectado
    dt_leitura                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetria_dispositivo_data ON t_telemetria_leitura (id_device, dt_leitura DESC);


-- 6. TABELA DE HISTÓRICO DE ATUAÇÕES (BOMBAS E EVENTOS)
CREATE TABLE IF NOT EXISTS t_historico_atuacao (
    id_atuacao                BIGSERIAL PRIMARY KEY,
    id_device                 VARCHAR(50) NOT NULL REFERENCES t_dispositivo(id_device) ON DELETE CASCADE,
    tp_atuador                VARCHAR(30) NOT NULL, -- 'BOMBA_N', 'BOMBA_P', 'BOMBA_K', 'BOMBA_H2O', 'LED_PWM', 'BIOCORE_AI'
    vl_duracao_ms             INT,
    ds_motivo                 TEXT,
    dt_inicio                 TIMESTAMPTZ DEFAULT NOW(),
    dt_fim                    TIMESTAMPTZ,
    dt_atuacao                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atuacao_dispositivo_data ON t_historico_atuacao (id_device, dt_atuacao DESC);
