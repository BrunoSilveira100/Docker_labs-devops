# Prática 14 — Projeto integrador

Stack completa: **React (Nginx) → API (Node) → PostgreSQL**, com pgAdmin
para inspeção, volumes nomeados, rede dedicada e healthchecks.

```bash
cp .env.example .env   # edite as senhas antes de continuar

docker compose config
docker compose up -d --build
docker compose ps       # "db" precisa estar healthy antes de backend/pgadmin subirem
```

## Validação ponta a ponta

```bash
curl http://localhost:8084/api/status          # frontend -> proxy -> backend
curl http://localhost:8084/api/alunos          # backend -> postgres (via init/*.sql)

curl -X POST http://localhost:8084/api/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Diego Alves","ra":"2021004","periodo":8}'

curl http://localhost:8084/api/alunos          # o novo aluno deve aparecer
```

Abra `http://localhost:8084` no navegador — a tabela de alunos deve
carregar via `fetch("/api/alunos")`. Abra `http://localhost:8083` para o
pgAdmin (servidor **Lab 14 - Projeto Integrador** já pré-cadastrado; o
pgAdmin leva de 20 a 40s para inicializar — se a página não responder de
primeira, aguarde e recarregue).

```bash
docker compose logs backend
docker compose down          # mantém os dados
docker compose down -v       # remove tudo, inclusive volumes
```
