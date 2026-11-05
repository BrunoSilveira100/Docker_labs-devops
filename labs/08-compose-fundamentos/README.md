# Lab 08: Docker Compose, fundamentos

**Requisito (LAB-08):** declarar a arquitetura distribuída (Nginx + Apache + Node) num `compose.yaml`.

## Do `docker run` ao declarativo

Os labs 06 e 07 exigiam cerca de 6 comandos, executados na ordem certa. Aqui, um único
arquivo descreve **o estado desejado** e o Compose cria a rede, as imagens e os
containers na ordem correta.

| Lab 06/07 (imperativo) | Lab 08 (declarativo) |
|---|---|
| `docker network create` | `networks: rede-lab08` |
| `docker build` | `build: ./backend` |
| ordem manual de subida | `depends_on: { backend: { condition: service_healthy } }` |
| `-v`, `-p` em cada `run` | `volumes:`, `ports:` por serviço |

## Decisões do meu `compose.yaml`

- **Sem `version:`**, chave obsoleta no Compose v2.
- **Healthcheck nos três serviços**:
  - Nginx: `wget` em `127.0.0.1`;
  - backend: o `HEALTHCHECK` do Dockerfile;
  - Apache: `httpd -t && pidof httpd`, porque a imagem Debian do httpd não tem wget nem curl.
- **O Nginx só sobe com o backend `healthy`**: um `depends_on` simples esperaria apenas o container iniciar.
- **O backend não tem `ports:`**: só é acessível pelo proxy.
- **Bind mounts `:ro`**, `restart: unless-stopped` e tag `nginx:1.31-alpine` fixada.

## Comandos (PowerShell e bash)

```bash
cd labs/08-compose-fundamentos
docker compose config --quiet            # valida a sintaxe (sem saída = OK)
docker compose up -d --build --wait      # --wait espera todos ficarem healthy
docker compose ps
curl http://localhost:8080               # Apache   (PowerShell: curl.exe)
curl http://localhost:8081               # Nginx
curl http://localhost:8081/api/status    # Nginx -> backend
docker compose logs -f nginx
docker compose exec nginx nginx -t
```

## Resultado obtido

```
SERVICE   STATUS                    PORTS
apache    Up 17 seconds (healthy)   0.0.0.0:8080->80/tcp
backend   Up 17 seconds (healthy)   4000/tcp
nginx     Up 11 seconds (healthy)   0.0.0.0:8081->80/tcp
```

O Nginx iniciou cerca de 6 s depois dos outros, exatamente quando o backend ficou
`healthy`. É o `service_healthy` funcionando.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `dependency failed to start: container ... is unhealthy` | O healthcheck do backend falhou | `docker compose logs backend` |
| `port is already allocated` (8080/8081) | Os labs 05, 06 ou 07 ainda estão rodando | Remova os containers soltos daqueles labs |
| Mudei o `server.js` e nada mudou | A imagem é de build | `docker compose up -d --build` |

## Limpeza

```bash
docker compose down
```
