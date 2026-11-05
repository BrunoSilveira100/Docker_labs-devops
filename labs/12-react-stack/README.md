# Lab 12: React em containers (dev × produção)

**Requisito (LAB-12):** isolar o fluxo de hot reloading (dev) do build estático de produção.

## Dois ambientes, dois Dockerfiles

| | Desenvolvimento | Produção |
|---|---|---|
| Arquivo | `Dockerfile.dev` + `compose.yaml` | `Dockerfile` (multi-stage) |
| Servidor | Vite dev server (`:5173`) | Nginx (`:80`, publicado em `8090`) |
| Código | **bind mount** `./app-react:/app` | copiado e compilado no build |
| `node_modules` | volume nomeado `node_modules_dev` | não existe na imagem final |
| Node/npm na imagem | sim | **não** |
| Modo exibido na página | `development` | `production` |

O `App.jsx` lê `import.meta.env.MODE` e mostra em qual dos dois ambientes está rodando.

### O volume `node_modules_dev`

O bind mount `./app-react:/app` cobriria a pasta `/app/node_modules` instalada na
imagem com o conteúdo do host, onde ela não existe. Montar um volume nomeado em
`/app/node_modules` evita isso: esse subdiretório continua vindo do volume.

### Nginx de produção (`nginx/nginx.conf`)

- `try_files ... /index.html`: rotas da SPA não dão 404.
- `assets/*` com `Cache-Control: immutable` por 1 ano, porque os nomes já trazem hash.
- `index.html` com `no-cache`, para um deploy novo aparecer na hora.
- `gzip` e cabeçalhos `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `X-Autor`.

## Comandos

### Desenvolvimento (PowerShell e bash)

```bash
cd labs/12-react-stack
docker compose up -d --build --wait
# abra http://localhost:5173 e edite app-react/src/App.jsx no host
docker compose logs -f react-dev        # mostra "[vite] hmr update /src/App.jsx"
docker compose down
```

### Produção

```bash
docker build -t app-react-lab12:prod .
docker run --rm -d --name react-prod -p 8090:80 app-react-lab12:prod
curl -I http://localhost:8090                        # PowerShell: curl.exe -I
curl -I http://localhost:8090/rota/que/nao/existe    # 200 (fallback da SPA)
docker exec react-prod sh -c "command -v node || echo 'sem node'"
docker stop react-prod
```

## Resultado obtido

- **Dev:** editei o `App.jsx` no Windows e o log mostrou `[vite] hmr update /src/App.jsx`. A página atualizou sem rebuild.
- **Prod:** a imagem tem **93,8 MB**, não tem `node` e ficou `healthy`; uma rota inexistente retornou HTTP 200 (SPA).

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| O hot reload não dispara no Windows | Eventos inotify não atravessam o bind mount do WSL2 | `usePolling: true` (já no `vite.config.js`) |
| `Cannot find module 'vite'` | O bind mount escondeu o `node_modules` | Confira o volume `node_modules_dev` no compose |
| Mudei o `package.json` e a dependência não apareceu | O `node_modules_dev` guarda a instalação antiga | `docker compose down -v` e `up --build` |
| Página em branco em produção | O build falhou ou o caminho dos assets está errado | `docker build` sem `-q` e confira o `dist/` |

## Limpeza

```bash
docker compose down -v        # remove também o volume node_modules_dev
```
