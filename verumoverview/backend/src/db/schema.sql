-- PostgreSQL schema for VerumOverview

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
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  gerente_id INTEGER REFERENCES usuarios(id)
);

CREATE TABLE atividades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  projeto_id INTEGER REFERENCES projetos(id),
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
