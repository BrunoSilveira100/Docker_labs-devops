# Lab 10: pgAdmin + PostgreSQL via Compose

**Requisito (LAB-10):** conectar o pgAdmin ao banco usando a configuração declarativa `servers.json`.

## Arquitetura

```
host:8082 ──► pgadmin :80 ──(rede-lab10, host "db")──► db :5432   ← sem porta publicada no host
                 │                                       │
           pgadmin_data                               pgdata        (volumes nomeados)
```

## Decisões

| Item | Escolha | Motivo |
|---|---|---|
| Healthcheck do `db` | `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB` | `$$` faz o container ler a variável na execução, em vez de o Compose interpolar na hora do parse |
| Healthcheck do `pgadmin` | `wget http://127.0.0.1/misc/ping` | Só fica `healthy` quando a interface web responde (leva de 20 a 40 s) |
| `depends_on` | `db: condition: service_healthy` | O pgAdmin não sobe antes de o banco aceitar conexões |
| Porta do `db` | não publicada | Só o pgAdmin, pela rede interna, precisa do banco |
| `servers.json` | Grupo "Unifeg 2026B — Bruno Silveira", com comentário e timeout | Servidor pré-cadastrado; **sem senha**, por segurança |
| Credenciais | Só no `.env` | O `compose.yaml` não tem nenhuma senha |

## Comandos (PowerShell e bash)

```bash
cd labs/10-pgadmin-compose
cp .env.example .env                      # PowerShell: Copy-Item .env.example .env  — TROQUE as senhas
docker compose config --quiet
docker compose up -d --wait               # espera db E pgadmin ficarem healthy
docker compose ps
docker compose logs pgadmin | grep -E "Added|Listening"
```

Depois:

1. Abra `http://localhost:8082` e entre com `PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD` do `.env`.
2. Expanda **Unifeg 2026B — Bruno Silveira → Lab 10 · Postgres (Bruno Silveira)**.
3. Na primeira conexão, informe o `POSTGRES_PASSWORD` do `.env`.
4. Abra `lab_sistemas_distribuidos → Schemas → public → Tables → alunos` (5 registros) e `Views → vw_resumo_turmas`.

## Resultado obtido

- `db` e `pgadmin` → `(healthy)`
- Log: `Added 1 Server Group(s) and 1 Server(s).`, o que prova que o `servers.json` foi importado
- De dentro do pgAdmin, `db:5432` está alcançável

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `ERR_CONNECTION_REFUSED` na 8082 | O pgAdmin ainda está inicializando | Espere o `healthy` (`--wait` faz isso) |
| `'...' does not appear to be a valid email` | Domínio rejeitado pela validação | `PGADMIN_CONFIG_CHECK_EMAIL_DELIVERABILITY: "False"` (já configurado) |
| O servidor não aparece no painel | O `pgadmin_data` já existia, e o `servers.json` só é importado na 1ª subida | `docker compose down -v` e suba de novo |
| `password authentication failed` | O `.env` mudou depois da criação do volume `pgdata` | `docker compose down -v` (apaga os dados) |

## Limpeza

```bash
docker compose down        # mantém os dados
docker compose down -v     # apaga pgdata e pgadmin_data
```
