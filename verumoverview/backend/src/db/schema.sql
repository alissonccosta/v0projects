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
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  cargo VARCHAR(255)
);

CREATE TABLE times (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
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
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  projeto_id UUID REFERENCES projetos(id_projeto),
  responsavel_id INTEGER REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  acao VARCHAR(255) NOT NULL,
  detalhes JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);
