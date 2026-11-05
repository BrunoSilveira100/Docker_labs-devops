# Evidências de Execução — Avaliação P2 (Docker / Docker Compose)

**Aluno:** Bruno Silveira · **Data da execução:** 05/11/2026
**Ambiente:** Windows 11 · Docker Desktop (WSL2) · Docker Engine 29.7.2 · Compose v5.3.1 · PowerShell 5.1

Todos os 14 labs foram executados e validados nesta máquina. Abaixo, o resultado
observado de cada um e as alterações autorais feitas sobre o repositório base.

---

## Alterações transversais

| Arquivo | Mudança | Motivo |
|---|---|---|
| `.gitignore` | Ignora `.env` (mantém `.env.example`), `dados/*` do Lab 04, `backup.sql`, `dist/` | O original ignorava só a pasta `.env/`, então um `.env` com senha real seria commitado (regra de compliance 3) |
| `.gitattributes` | Força `eol=lf` em `.sh`, `.sql`, `.conf`, `Dockerfile*`, `.env*` etc. | Num clone Windows com `core.autocrlf=true`, o CRLF quebra scripts e SQL dentro dos containers Linux |
| Dockerfiles (03, 07, 08, 11, 12, 14) | `LABEL org.opencontainers.image.*`, `USER node`, `HEALTHCHECK` com `wget` em `127.0.0.1`, `COPY --chown`, `NODE_ENV=production`, `.dockerignore` completo | Boas práticas OCI e de segurança (sem root, sem vazamento de contexto) |
| Configs Apache/Nginx (06, 07, 08) | Cabeçalho `X-Autor: Bruno Silveira` | Personalização verificável via `curl -i` |

O que **não** foi alterado, de propósito (objetivo didático): `Dockerfile.single-stage` (Lab 11),
root no Ubuntu (Lab 02) e `secrets/db_password.txt` de exemplo (Lab 13).

---

## Resultados por lab

| Lab | Resultado observado | Status |
|---|---|---|
| **01** Fundamentos | `hello-world` OK; ciclo run → pause (`Up (Paused)`) → unpause → logs → inspect → rm | ✅ |
| **02** Ubuntu | `curl`/`procps` instalados; `explorar.sh` rodou via bind mount; estado **preservado** após stop/start; container novo **não** tem curl | ✅ |
| **03** Dockerfile | `app-fundamentos:1.0` = **193 MB**, status `healthy`, `usuarioLinux: "node"`, labels OCI presentes | ✅ |
| **04** Volumes | Bind mount: 1→2→3 (arquivo visível no host); named volume: 1→2; tmpfs: 1→1 (não persiste) | ✅ |
| **05** Redes | DNS por nome na `rede-lab05` OK; `localhost:8080` HTTP 200; bridge padrão: `bad address` (falha **esperada**) | ✅ |
| **06** Apache | HTTP 200 + `X-Servido-Por: Apache-Unifeg-Lab06` + `X-Autor`; `httpd -t` → `Syntax OK` | ✅ |
| **07** Nginx proxy | `/api/status` → backend via `rede-lab07`; `nginx -t` OK; backend `healthy` como `node` | ✅ |
| **08** Compose | 3 serviços `healthy`; Nginx só sobe após backend `service_healthy` | ✅ |
| **09** PostgreSQL | Seed carregado (3 alunos); registro inserido **sobreviveu** a `rm -f` + recriação com o mesmo volume | ✅ |
| **10** pgAdmin | `db` e `pgadmin` `healthy`; `servers.json` importado ("Added 1 Server") com `Host: db`; pgAdmin alcança `db:5432`. Login na UI e abertura do servidor: **verificar manualmente** em `localhost:8082` | ✅ (UI: manual) |
| **11** Multi-stage | **single = 1,65 GB (root, com tsc)** vs **multi = 193 MB (node, sem tsc)**, redução de **~88%** | ✅ |
| **12** React | Dev: hot reload confirmado (`[vite] hmr update /src/App.jsx`); Prod: **93,8 MB**, sem Node, rota SPA → 200 | ✅ |
| **13** Registry/Secrets | Secret via arquivo (não aparece no `env`); limites 0.5 CPU / 128 MiB aplicados; `whoami` = `appuser`; push/pull em `localhost:5000` | ✅ |
| **14** Integrador | Ver seção abaixo | ✅ |

---

## Lab 14 — Projeto Integrador (detalhes)

**Arquitetura de rede implementada:**

```
 Host :8084 ──► frontend (Nginx + React) ──rede-frontend──► backend (Node)
                                                              │
 Host :8083 ──► pgadmin ──────rede-backend (internal)─────────┴──► db (Postgres, sem porta no host)
```

**Validações realizadas:**

| Teste | Resultado |
|---|---|
| `docker compose up -d --build --wait` em ambiente limpo | 4/4 serviços `healthy`, na ordem db → backend/pgadmin → frontend |
| `GET /api/status` | `{"servico":"backend-lab14","status":"ok","autor":"Bruno Silveira"}` |
| `GET /api/alunos` | 3 alunos do seed |
| `POST /api/alunos` | 201, aluno criado |
| `POST` com RA duplicado / sem RA | 400 (validação) |
| Cadastro pela interface web | Aluno gravado e tabela atualizada |
| frontend → `db:5432` | **bloqueado** (o frontend nem resolve o nome `db`) |
| backend → `db:5432` | alcança |
| pgadmin → db autenticado (psql do próprio pgAdmin, senha do `.env`) | `unifeg\|6` (conectou e leu a tabela); senha errada → `password authentication failed` |
| Login na UI do pgAdmin (`localhost:8083`) e abertura do servidor pré-cadastrado | **verificar manualmente** (pede `POSTGRES_PASSWORD` na 1ª conexão) |
| db → internet | **sem saída** (`rede-backend` é `internal: true`) |
| `docker compose down` + `up` (sem `-v`) | Todos os alunos persistiram |
| `docker compose stop backend` | Log: `SIGTERM recebido, encerrando backend-lab14...` |
| Senha no `compose.yaml` | Nenhuma (tudo via `.env`) |
| Imagens | `frontend-lab14` = 93,8 MB · `backend-lab14` = 194 MB |

**Melhorias autorais no Lab 14:** redes separadas por camada; `depends_on: service_healthy`
também no frontend; backend lê `POSTGRES_*` direto do `.env` (sem interpolar senha no compose);
encerramento limpo (SIGTERM); tolerância a BOM UTF-8 do PowerShell; formulário de cadastro no React.

---

## Troubleshooting encontrado na prática (Windows)

| Sintoma | Causa | Solução |
|---|---|---|
| `map has no entry for key "IPAddress"` | Docker 29 removeu `.NetworkSettings.IPAddress` | `docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" <ctr>` |
| `NativeCommandError` em vermelho no `nginx -t` | O PowerShell 5.1 trata o stderr como erro | Não é falha: confira a linha `test is successful` |
| POST com JSON retorna `Unexpected token` | O pipe do PowerShell 5.1 insere um BOM / remove aspas | Use `Invoke-RestMethod -Method Post -Body '{...}' -ContentType 'application/json'` |
| `< backup.sql` dá erro de parse | O PowerShell não tem redirecionamento de entrada `<` | `Get-Content backup.sql \| docker exec -i lab-postgres psql ...` ou `pg_dump -f` + `docker cp` |
| `> backup.sql` gera arquivo ilegível | O PowerShell 5.1 grava em UTF-16 | `docker exec lab-postgres pg_dump -U unifeg -f /tmp/backup.sql <db>` + `docker cp lab-postgres:/tmp/backup.sql .` |
| `password authentication failed` após editar o `.env` | O Postgres só aplica `POSTGRES_PASSWORD` com o volume vazio; o volume guarda a senha antiga | `docker compose down -v` (apaga os dados) e depois `up`, ou volte a senha antiga no `.env` |
| `sh -c '... "$VAR" ...'` falha só no PowerShell | O PowerShell 5.1 remove as aspas duplas internas ao chamar executáveis nativos | Rode o comando no Git Bash/WSL, ou escape as aspas como `\"` |
| Seed/servers.json alterado e nada muda | Scripts de init só rodam com o volume vazio | `docker compose down -v` e depois `up` |
| `localhost:6000` não abre no navegador | 6000 é uma porta bloqueada pelos navegadores (X11) | Use `curl.exe http://localhost:6000` |
| Healthcheck do Nginx `unhealthy` | `localhost` resolve para `::1` e o config só escuta IPv4 | Use `http://127.0.0.1/` no healthcheck |

---

## Como reproduzir (no máximo dois comandos por lab)

```powershell
cd labs\14-projeto-integrador
if (-not (Test-Path .env)) { Copy-Item .env.example .env }   # só cria se não existir; edite as senhas
docker compose up -d --build --wait
```

Limpeza: `docker compose down` (mantém os dados) · `docker compose down -v` (remove os volumes).
