# Prática 13 — Registry local, segurança e troubleshooting

```bash
docker compose up -d
docker compose ps                 # observe HEALTH em "app"

curl http://localhost:6000
curl http://localhost:6000/saude

docker stats --no-stream          # confere o limite de 0.5 CPU / 128M aplicado
docker inspect app-lab13 2>/dev/null || docker inspect $(docker compose ps -q app)
docker exec -it $(docker compose ps -q app) whoami   # não deve ser "root"
```

## Registry local: tag, push, pull

```bash
docker build -t app-lab13:1.0 ./app
docker tag app-lab13:1.0 localhost:5000/app-lab13:1.0
docker push localhost:5000/app-lab13:1.0

docker rmi app-lab13:1.0 localhost:5000/app-lab13:1.0
docker pull localhost:5000/app-lab13:1.0
curl http://localhost:5000/v2/_catalog
```

## Segredo via secret file (não via variável de ambiente em texto puro)

`secrets/db_password.txt` é montado em `/run/secrets/db_password` dentro do
container — **nunca** comite um arquivo de segredo real; aqui é só um
exemplo didático.

## Troubleshooting — diagnóstico de falhas comuns

```bash
docker compose logs app
docker compose exec app sh -c "node -e \"console.log(process.env)\""
docker compose events --since 5m
docker inspect --format '{{json .State.Health}}' $(docker compose ps -q app)
```

Depois:
```bash
docker compose down -v
```
