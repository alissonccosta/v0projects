-- PostgreSQL schema for VerumOverview
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE perfis_acesso (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  permissoes JSONB NOT NULL
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil_id INTEGER REFERENCES perfis_acesso(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pessoas (
  id_pessoa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cargo_funcao VARCHAR(255),
  time VARCHAR(255),
  status VARCHAR(50),
  perfil_comportamental JSONB,
  engajamento INTEGER,
  projetos_vinculados JSONB,
  anexos JSONB,
  historico_movimentacoes JSONB,
  comentarios JSONB
);

CREATE TABLE times (
  id_time UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  lider INTEGER REFERENCES usuarios(id),
  capacidade_total INTEGER,
  membros JSONB,
  anexos JSONB,
  historico_alteracoes JSONB,
  comentarios JSONB
);

CREATE TABLE projetos (
  id_projeto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  codigo_projeto VARCHAR(50) UNIQUE,
  objetivo TEXT,
  justificativa TEXT,
  stakeholders JSONB,
  status VARCHAR(50),
  data_inicio_prevista DATE,
  data_fim_prevista DATE,
  data_inicio_real DATE,
  data_fim_real DATE,
  prioridade VARCHAR(10),
  criticidade VARCHAR(10),
  orcamento_planejado NUMERIC,
  orcamento_realizado NUMERIC,
  kpis JSONB,
  time_responsavel JSONB,
  anexos JSONB,
  links JSONB,
  historico_atualizacoes JSONB,
  comentarios JSONB,
  percentual_concluido INTEGER DEFAULT 0
);

CREATE TABLE atividades (
  id_atividade UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_projeto UUID REFERENCES projetos(id_projeto),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  responsavel INTEGER REFERENCES usuarios(id),
  time UUID REFERENCES times(id_time),
  status VARCHAR(50),
  data_meta DATE,
  data_limite DATE,
  horas_estimadas NUMERIC,
  horas_gastas NUMERIC,
  prioridade VARCHAR(10),
  dependencias JSONB,
  anexos JSONB,
  historico_atualizacoes JSONB,
  comentarios JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  acao VARCHAR(255) NOT NULL,
  detalhes JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE solicitacoes_acesso (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  status VARCHAR(50) DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Perfil administrador padrao
INSERT INTO perfis_acesso (nome, permissoes)
VALUES ('Administrador', '["admin"]');

-- Usuario administrador padrao
INSERT INTO usuarios (nome, email, senha_hash, perfil_id)
VALUES ('Admin', 'admin@example.com',
  '$2b$10$hzfKMSkIf.j4fyR29zi25uMWUGJqLPLGhwVMSENOSIvuPJBgSpun6', 1);
