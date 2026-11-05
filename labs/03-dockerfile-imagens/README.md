# Lab 03: imagens e Dockerfile

**Requisito (LAB-03):** criar um `Dockerfile` otimizado e respeitar o `.dockerignore`.

## O que mudei em relação ao Dockerfile básico

| Decisão | Por quê |
|---|---|
| `FROM node:20-alpine` (tag fixada) | Imagem pequena e build reprodutível; `latest` muda sem aviso |
| `LABEL org.opencontainers.image.*` | Metadados padrão OCI, consultáveis com `docker inspect` |
| `COPY package.json` antes do código | Cache de camadas: editar o `server.js` não reinstala dependências |
| `npm install --omit=dev && npm cache clean --force` | Sem devDependencies e sem cache do npm na camada |
| `COPY --chown=node:node` + `USER node` | O processo não roda como root |
| `HEALTHCHECK` com `wget` em `127.0.0.1` | O alpine não tem `curl`; `127.0.0.1` evita cair no IPv6 |
| `CMD ["node", "server.js"]` (forma exec) | O node vira PID 1 e recebe o SIGTERM do `docker stop` |
| `.dockerignore` | Barra `node_modules`, `.git`, `.env*` e logs do contexto de build |

O `server.js` responde com `autor` e `usuarioLinux`, o que prova que o processo
roda como `node`.

## Comandos

### PowerShell

```powershell
cd labs\03-dockerfile-imagens
docker build -t app-fundamentos:1.0 .
docker run -d --rm --name lab03 -p 3000:3000 app-fundamentos:1.0
curl.exe http://localhost:3000
docker ps --filter name=lab03                          # aguarde "(healthy)"
docker image history app-fundamentos:1.0
docker inspect -f "{{json .Config.Labels}}" app-fundamentos:1.0
docker stop lab03
```

### bash

```bash
cd labs/03-dockerfile-imagens
docker build -t app-fundamentos:1.0 .
docker run -d --rm --name lab03 -p 3000:3000 app-fundamentos:1.0
curl http://localhost:3000
docker ps --filter name=lab03
docker stop lab03
```

## Resultado obtido

```json
{ "mensagem": "Ola, Unifeg! ...", "autor": "Bruno Silveira", "usuarioLinux": "node", "plataforma": "linux" }
```

- Status: `Up 13 seconds (healthy)`
- Tamanho: **193 MB** (`app-fundamentos:1.0`)

## Teste de cache

Edite só o `app/server.js` e rode o `docker build` de novo. A etapa `RUN npm install`
aparece como `CACHED`; só as camadas a partir do `COPY server.js` são refeitas.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `curl: (52) Empty reply` logo após o `run` | O app ainda está subindo | Espere o `(healthy)` |
| `port is already allocated` | Outra coisa usa a porta 3000 | `-p 3001:3000` |
| Status `unhealthy` | O healthcheck chamou `localhost`, que resolveu para `::1` | Use `127.0.0.1` |
