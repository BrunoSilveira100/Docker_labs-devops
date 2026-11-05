# Lab 11: multi-stage build e otimização de imagens

**Requisito (LAB-11):** comparar o tamanho final de uma imagem single-stage com o de uma multi-stage.

## A comparação

A mesma API em TypeScript (`app-node/src/index.ts`) é empacotada de duas formas:

| | `Dockerfile.single-stage` | `Dockerfile` (multi-stage) |
|---|---|---|
| Base final | `node:20` (Debian completo) | `node:20-alpine` |
| TypeScript e `@types` na imagem | **sim** | não (ficam no estágio `builder`) |
| Código-fonte `.ts` na imagem | **sim** | não, só o `dist/` |
| Usuário | **root** | `node` |
| Processo | `npm start` (npm → node) | `node dist/index.js` |
| Healthcheck | não | sim |

O `Dockerfile.single-stage` é **mantido ruim de propósito**: ele é o termo de
comparação. A única linha que acrescentei foi `ENV IMAGEM_VARIANTE=single-stage`,
para a API responder qual imagem a serviu.

## Comandos

### PowerShell

```powershell
cd labs\11-multistage-build\app-node
docker build -f Dockerfile.single-stage -t app-multistage:single .
docker build -f Dockerfile              -t app-multistage:multi  .
docker image ls app-multistage

docker run --rm -d --name app-single -p 5000:5000 app-multistage:single
docker run --rm -d --name app-multi  -p 5001:5000 app-multistage:multi
curl.exe http://localhost:5000          # "imagem":"single-stage", "usuarioLinux":"root"
curl.exe http://localhost:5001          # "imagem":"multi-stage",  "usuarioLinux":"node"

docker exec app-single ls node_modules/.bin/tsc    # existe
docker exec app-multi  ls node_modules/.bin/tsc    # não existe
docker image history app-multistage:multi
docker stop app-single app-multi
```

### bash

Os comandos são os mesmos, trocando `curl.exe` por `curl`.

## Resultado obtido

| Imagem | Tamanho | Usuário | Tem `tsc`? |
|---|---|---|---|
| `app-multistage:single` | **1,65 GB** | root | sim |
| `app-multistage:multi` | **193 MB** | node | não |

**Redução de cerca de 88%.** A resposta da API é idêntica nas duas, porque o
código não mudou, só a forma de construir a imagem.

## Por que a multi-stage é menor e mais segura

1. A imagem base alpine tem dezenas de MB, contra centenas da Debian completa.
2. O compilador e as devDependencies existem só no estágio `builder`, que é
   descartado.
3. Menos pacotes significa menos CVEs possíveis e menos ferramentas para um atacante usar.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `port is already allocated` na 5000 | O registry do Lab 13 está rodando | `docker compose down` no Lab 13 |
| `Cannot find module '/app/dist/index.js'` | O build TypeScript falhou ou o `dist` não foi copiado | Veja a saída do `RUN npm run build` |
| O tamanho no Docker Desktop difere do `docker image ls` | O containerd image store soma camadas compartilhadas | Compare sempre pelo mesmo comando |
