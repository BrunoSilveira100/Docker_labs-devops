# Prática 03 — Imagens e Dockerfile

```bash
docker build -t app-fundamentos:1.0 .
docker run --rm -p 3000:3000 app-fundamentos:1.0
# em outro terminal:
curl http://localhost:3000

docker image history app-fundamentos:1.0
docker image ls app-fundamentos
```
