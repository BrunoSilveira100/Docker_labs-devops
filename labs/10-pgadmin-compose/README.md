# Prática 10 — pgAdmin + PostgreSQL via Compose

```bash
cp .env.example .env    # edite as senhas antes de continuar

docker compose config
docker compose up -d
docker compose ps        # "db" deve aparecer como healthy antes do pgadmin subir
docker compose logs -f pgadmin   # aguarde a linha "Listening at: http://[::]:80"
```

O pgAdmin leva de 20 a 40 segundos para inicializar (cria seu banco SQLite
interno e só então sobe o servidor web) — acessar a porta antes disso dá
conexão recusada; isso é esperado, não é falha da configuração.

Acesse `http://localhost:8082`, entre com `PGADMIN_DEFAULT_EMAIL` /
`PGADMIN_DEFAULT_PASSWORD` do `.env`. O servidor **Lab 10 - Postgres via
Compose** já aparece pré-cadastrado (via `pgadmin/servers.json`) apontando
para o host `db` — na primeira conexão o pgAdmin pede a senha do Postgres
(`POSTGRES_PASSWORD`), pois o `servers.json` não armazena senhas por
segurança.

```bash
docker compose logs db | grep "ready to accept"
docker compose down          # mantém os volumes (dados persistem)
docker compose down -v       # remove tudo, inclusive os dados
```
