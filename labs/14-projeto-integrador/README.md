# Lab 14: projeto integrador

**Requisito (LAB-14):** orquestrar a stack completa e garantir a comunicação entre todas as camadas.

## Arquitetura

```
                 ┌──────────────────────── rede-frontend ────────────────────────┐
host:8084 ──► frontend (Nginx + build React) ── /api/* ──► backend (Node :4000)
                                                               │
                 ┌──────────── rede-backend (internal: true) ──┴───────────────┐
host:8083 ──► pgadmin ──────────────────────────────────────► db (Postgres :5432)
              (também em rede-pgadmin, para publicar a porta)    volume: pgdata
```

| Serviço | Redes | Porta no host | Depende de |
|---|---|---|---|
| `db` | backend | — | — |
| `backend` | backend, frontend | — | `db` healthy |
| `frontend` | frontend | 8084 | `backend` healthy |
| `pgadmin` | backend, pgadmin | 8083 | `db` healthy |

**O isolamento é intencional:**

- o frontend **não resolve** o nome `db`;
- o banco não tem rota para a internet (`internal: true`);
- nenhuma porta do banco é publicada.

## API (`backend/src/index.js`)

| Rota (pelo proxy) | Descrição |
|---|---|
| `GET /api/status` | saúde do serviço, usada pelo healthcheck |
| `GET /api/alunos` | lista ordenada por curso, período e nome |
| `GET /api/resumo` | totais por curso e período (view `vw_resumo_turmas`) |
| `POST /api/alunos` | cadastro `{nome, ra, curso?, periodo?}` |

Validações do `POST`:

- `400` se faltar nome ou RA, se o período não for de 1 a 10, se um campo passar do tamanho máximo ou se o JSON for inválido;
- `409` se o RA já existir;
- `400` também se o corpo não estiver em UTF-8 válido;
- `413` se o corpo passar de 10 KB.

As credenciais vêm do `.env`, lidas como `POSTGRES_*`, e a API encerra de forma limpa
ao receber SIGTERM.

## Frontend (`frontend/src/App.jsx`)

O frontend tem um formulário de cadastro (com seleção de curso), um resumo por
turma e a tabela de alunos. Todas as chamadas usam caminho relativo (`/api/...`), então o
navegador nunca fala direto com o backend.

## Comandos

### PowerShell

```powershell
cd labs\14-projeto-integrador
if (-not (Test-Path .env)) { Copy-Item .env.example .env }   # TROQUE as senhas antes do 1º up
docker compose config --quiet
docker compose up -d --build --wait
docker compose ps

curl.exe http://localhost:8084/api/status
curl.exe http://localhost:8084/api/alunos
curl.exe http://localhost:8084/api/resumo
# No PowerShell 5.1, um -Body do tipo string sai em ISO-8859-1 e corrompe os acentos.
# Envie os bytes em UTF-8 e declare charset=utf-8:
$json = '{"nome":"Caio Mendes","ra":"BS2026-006","curso":"Sistemas de Informação","periodo":3}'
Invoke-RestMethod -Method Post -Uri http://localhost:8084/api/alunos `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes($json))
```

### bash

```bash
cd labs/14-projeto-integrador
[ -f .env ] || cp .env.example .env
docker compose up -d --build --wait
curl -X POST http://localhost:8084/api/alunos -H "Content-Type: application/json" \
  -d '{"nome":"Caio Mendes","ra":"BS2026-006","curso":"Sistemas de Informação","periodo":3}'
```

### Provas de isolamento e persistência

```bash
docker compose exec frontend sh -c "nc -z -w 2 db 5432 || echo 'frontend NAO alcanca o banco'"
docker compose exec backend  sh -c "nc -z -w 2 db 5432 && echo 'backend alcanca o banco'"
docker compose exec db sh -c "wget -T 3 -qO- http://example.com >/dev/null 2>&1 || echo 'db sem internet'"

docker compose down && docker compose up -d --wait      # sem -v: os dados continuam
curl http://localhost:8084/api/alunos
```

### Interface

- `http://localhost:8084`: cadastro e listagem.
- `http://localhost:8083`: pgAdmin. O login é o `PGADMIN_*` do `.env`. Depois abra o servidor
  **Lab 14 · Projeto Integrador (Bruno Silveira)** e informe o `POSTGRES_PASSWORD`.

## Resultado obtido

Os números medidos estão em [`EVIDENCIAS.md`](../../EVIDENCIAS.md):

- 4 serviços `healthy`, na ordem db → backend e pgadmin → frontend;
- isolamento confirmado e persistência após `down` seguido de `up`;
- SIGTERM tratado;
- imagens de 93,8 MB (frontend) e 194 MB (backend).

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `password authentication failed` | A senha do `.env` mudou depois da 1ª subida | `docker compose down -v` (apaga os dados) e `up` |
| `/api/*` responde 502 | Backend fora do ar ou fora da `rede-frontend` | `docker compose logs backend` |
| Os alunos não mudam depois de editar o seed | Os scripts de init só rodam com o volume vazio | `docker compose down -v` |
| `Unexpected token` no POST pelo PowerShell | Pipe com BOM ou aspas removidas pelo PS 5.1 | Use `Invoke-RestMethod` (a API também remove o BOM) |
| `400 corpo não está em UTF-8 válido` | `-Body` em string no PS 5.1 é enviado como ISO-8859-1 | `-ContentType "application/json; charset=utf-8" -Body ([Text.Encoding]::UTF8.GetBytes($json))` |
| O pgAdmin não abre na hora | A inicialização leva de 20 a 40 s | `--wait` espera o `healthy` |

## Limpeza

```bash
docker compose down        # mantém pgdata e pgadmin_data
docker compose down -v     # remove tudo, inclusive os dados
```
