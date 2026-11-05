# Lab 07: Nginx como proxy reverso

**Requisito (LAB-07):** configurar o Nginx como reverse proxy para uma API Node.js interna.

## Arquitetura

```
navegador ──► host:8081 ──► lab-nginx :80
                              ├─ "/"      → arquivos estáticos (site/)
                              └─ "/api/"  → proxy_pass http://backend:4000/
                                                  │   (rede-lab07, DNS por nome)
                                                  ▼
                                           backend :4000   ← sem porta publicada no host
```

O `/` no final de `proxy_pass http://backend:4000/` remove o prefixo, então
`/api/status` chega ao backend como `/status`.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `backend/server.js` | Minha API com as rotas `/status` (healthcheck), `/info` (container, uptime, memória e os cabeçalhos que o proxy adiciona) e 404/405 em JSON |
| `backend/Dockerfile` | `node:20-alpine`, `USER node`, `HEALTHCHECK`, labels OCI |
| `conf/nginx.conf` | Log `unifeg` com tempo de resposta, `X-Real-IP`, `X-Forwarded-For` e os cabeçalhos `X-Servido-Por` e `X-Autor` |
| `site/index.html` | Página com botões que chamam a API **através** do proxy |

## Comandos

### PowerShell

```powershell
cd labs\07-nginx
docker network create rede-lab07
docker build -t backend-lab07:1.0 .\backend
docker run -d --name backend --network rede-lab07 backend-lab07:1.0
docker run -d --name lab-nginx --network rede-lab07 -p 8081:80 `
  -v "${PWD}\site:/usr/share/nginx/html:ro" `
  -v "${PWD}\conf\nginx.conf:/etc/nginx/nginx.conf:ro" `
  nginx:1.31-alpine
curl.exe -i http://localhost:8081
curl.exe http://localhost:8081/api/status
curl.exe http://localhost:8081/api/info
docker exec lab-nginx nginx -t
```

### bash

```bash
cd labs/07-nginx
docker network create rede-lab07
docker build -t backend-lab07:1.0 ./backend
docker run -d --name backend --network rede-lab07 backend-lab07:1.0
docker run -d --name lab-nginx --network rede-lab07 -p 8081:80 \
  -v "$(pwd)/site:/usr/share/nginx/html:ro" \
  -v "$(pwd)/conf/nginx.conf:/etc/nginx/nginx.conf:ro" \
  nginx:1.31-alpine
curl http://localhost:8081/api/info
```

## Resultado esperado

- `/` → HTTP 200 com `X-Servido-Por: Nginx-Unifeg-Lab07` e `X-Autor: Bruno Silveira`
- `/api/status` → `{"servico":"backend-lab07","status":"ok","autor":"Bruno Silveira"}`
- `/api/info` → `viaProxy.xRealIp` preenchido, o que prova que a chamada passou pelo Nginx
- `backend` com status `(healthy)` e `whoami` = `node`

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `502 Bad Gateway` | O backend caiu ou está fora da `rede-lab07` | `docker ps`, `docker network inspect rede-lab07` |
| `host not found in upstream "backend"` | O Nginx subiu antes do container `backend` existir | Suba o backend primeiro (no Lab 08, o `depends_on` resolve) |
| `/api/status` retorna 404 | Faltou a `/` no final do `proxy_pass` | `proxy_pass http://backend:4000/;` |
| `nginx -t` aparece em vermelho no PowerShell | O nginx escreve no stderr | Procure por `test is successful` |

## Limpeza

```bash
docker rm -f lab-nginx backend
docker network rm rede-lab07
```
