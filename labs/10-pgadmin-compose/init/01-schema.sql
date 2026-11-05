-- 01-schema.sql — estrutura do banco das Práticas 09, 10 e 14
-- Autor: Bruno Silveira · Unifeg 2026B
--
-- O entrypoint da imagem postgres executa os arquivos de
-- /docker-entrypoint-initdb.d/ em ordem alfabética, e SÓ quando o volume de
-- dados está vazio. Alterou este arquivo? Rode "down -v" (ou remova o volume)
-- para ele ser aplicado de novo.

CREATE TABLE IF NOT EXISTS alunos (
    id         SERIAL       PRIMARY KEY,
    nome       VARCHAR(120) NOT NULL,
    ra         VARCHAR(20)  NOT NULL UNIQUE,
    curso      VARCHAR(60)  NOT NULL DEFAULT 'Ciência da Computação',
    periodo    SMALLINT     NOT NULL DEFAULT 1
               CONSTRAINT periodo_valido CHECK (periodo BETWEEN 1 AND 10),
    criado_em  TIMESTAMP    NOT NULL DEFAULT now()
);

COMMENT ON TABLE  alunos         IS 'Cadastro de alunos usado nos labs de banco (09, 10, 14)';
COMMENT ON COLUMN alunos.periodo IS 'Período atual do aluno (1 a 10)';

-- Consultas por curso/período são as mais comuns na API do Lab 14
CREATE INDEX IF NOT EXISTS idx_alunos_curso_periodo ON alunos (curso, periodo);

-- Visão de resumo: quantos alunos há em cada curso e período
CREATE OR REPLACE VIEW vw_resumo_turmas AS
SELECT curso,
       periodo,
       count(*)       AS total_alunos,
       max(criado_em) AS ultimo_cadastro
  FROM alunos
 GROUP BY curso, periodo
 ORDER BY curso, periodo;
