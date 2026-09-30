# Prática 11 — Multi-stage build e otimização de imagens

```bash
cd app-node

docker build -f Dockerfile.single-stage -t app-multistage:single .
docker build -f Dockerfile             -t app-multistage:multi  .

docker image ls app-multistage
docker image history app-multistage:single
docker image history app-multistage:multi

docker run --rm -d --name app-single -p 5000:5000 app-multistage:single
docker run --rm -d --name app-multi  -p 5001:5000 app-multistage:multi
curl http://localhost:5000
curl http://localhost:5001
docker stop app-single app-multi
```

Compare o tamanho das duas imagens em `docker image ls` — a `:single`
carrega o `node:20` completo, o TypeScript e o código-fonte; a `:multi`
só tem `node:20-alpine`, o `dist/` compilado e as dependências de produção.
