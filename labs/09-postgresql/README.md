# Lab 09: PostgreSQL em container

**Requisito (LAB-09):** carregar automaticamente o esquema (`01-schema.sql`) e os dados de teste (`02-seed.sql`).

## Como a inicialização funciona

Na **primeira** subida, com o volume de dados vazio, o entrypoint da imagem
`postgres` executa, em ordem alfabética, tudo o que está em `/docker-entrypoint-initdb.d/`.
Com o volume já preenchido, esses scripts são **ignorados**. Isso protege os dados,
mas também significa que alterar o SQL exige recriar o volume.

## Meu modelo de dados

| Arquivo | Conteúdo |
|---|---|
| `init/01-schema.sql` | Tabela `alunos` com a coluna `curso` e a `CHECK` de período (1 a 10), comentários de tabela e coluna, o índice `idx_alunos_curso_periodo` e a view `vw_resumo_turmas` |
| `init/02-seed.sql` | 5 alunos **fictícios** em 3 cursos, com RAs no padrão `BS2026-NNN`; `ON CONFLICT` torna o script idempotente |
| `.env.example` | Modelo das variáveis. O `.env` real fica fora do git |

O mesmo modelo é usado nos labs 10 e 14.

## Comandos

### PowerShell

```powershell
cd labs\09-postgresql
if (-not (Test-Path .env)) { Copy-Item .env.example .env }   # depois TROQUE a senha
docker volume create pgdata-lab09
docker run -d --name lab-postgres --env-file .env `
  -v pgdata-lab09:/var/lib/postgresql/data `
  -v "${PWD}\init:/docker-entrypoint-initdb.d:ro" `
  -p 5432:5432 postgres:16-alpine
docker logs -f lab-postgres      # espere "database system is ready to accept connections"

docker exec -it lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "SELECT * FROM alunos;"
docker exec -it lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "SELECT * FROM vw_resumo_turmas;"
```

### bash

```bash
cd labs/09-postgresql
[ -f .env ] || cp .env.example .env
docker volume create pgdata-lab09
docker run -d --name lab-postgres --env-file .env \
  -v pgdata-lab09:/var/lib/postgresql/data \
  -v "$(pwd)/init:/docker-entrypoint-initdb.d:ro" \
  -p 5432:5432 postgres:16-alpine
docker exec -it lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "SELECT * FROM alunos;"
```

## Backup e restauração

O PowerShell 5.1 grava `>` em UTF-16 e não tem `<`. Por isso, a forma segura é gerar
o dump **dentro** do container e copiá-lo para fora:

```powershell
docker exec lab-postgres pg_dump -U unifeg -f /tmp/backup.sql lab_sistemas_distribuidos
docker cp lab-postgres:/tmp/backup.sql .\backup.sql
# restaurar:
docker cp .\backup.sql lab-postgres:/tmp/backup.sql
docker exec lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -f /tmp/backup.sql
```

No bash vale o atalho: `docker exec lab-postgres pg_dump ... > backup.sql` e
`docker exec -i lab-postgres psql ... < backup.sql`. O `backup.sql` está no `.gitignore`.

## Prova de persistência

```powershell
docker exec lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "INSERT INTO alunos (nome, ra) VALUES ('Teste Persistencia', 'BS2026-999');"
docker rm -f lab-postgres
# recrie com o MESMO -v pgdata-lab09 (comando docker run acima) e consulte:
docker exec lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "SELECT count(*) FROM alunos;"   # 6
```

Para comparar, rode `docker rm -f lab-postgres; docker volume rm pgdata-lab09` e suba
de novo: o banco volta com só os 5 alunos do seed.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `relation "alunos" does not exist` | O volume já existia antes do SQL | `docker volume rm pgdata-lab09` e suba de novo |
| `password authentication failed` | A senha do `.env` mudou depois da 1ª inicialização | Volte a senha antiga ou recrie o volume |
| `port 5432 already allocated` | Há um Postgres instalado no Windows | `-p 5433:5432` |
| `the input device is not a TTY` | `-it` usado fora de um terminal | Use `docker exec` sem `-it` |

## Limpeza

```bash
docker rm -f lab-postgres && docker volume rm pgdata-lab09
```
