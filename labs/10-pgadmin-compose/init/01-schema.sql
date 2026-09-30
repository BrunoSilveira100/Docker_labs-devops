-- Executado automaticamente pelo Postgres na primeira inicialização
-- (arquivos em /docker-entrypoint-initdb.d/ rodam em ordem alfabética).

CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    ra VARCHAR(20) UNIQUE NOT NULL,
    periodo SMALLINT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP NOT NULL DEFAULT now()
);
