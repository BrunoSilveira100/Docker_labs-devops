# Prática 12 — Ambiente de desenvolvimento React em containers

## Desenvolvimento (hot reload)

```bash
docker compose up -d
# abra http://localhost:5173
```

Edite `app-react/src/App.jsx` com o container rodando (`docker compose logs -f react-dev`
para ver o Vite recompilar) e veja a página atualizar sozinha no navegador.

O volume anônimo `node_modules_dev` existe porque o bind mount de
`./app-react:/app` sobrescreveria `/app/node_modules` com a pasta (vazia)
do host — o volume nomeado "tampa" só aquele subdiretório.

```bash
docker compose down
```

## Produção (build otimizado servido por Nginx)

```bash
docker build -t app-react-lab12:prod .
docker run --rm -d --name react-prod -p 8090:80 app-react-lab12:prod
curl -I http://localhost:8090
docker stop react-prod
```
