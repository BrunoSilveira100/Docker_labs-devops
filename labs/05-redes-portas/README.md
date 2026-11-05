# Lab 05: redes e mapeamento de portas

**Requisito (LAB-05):** criar redes `bridge` personalizadas e mapear portas do host.

## Dois conceitos que costumam ser confundidos

- **Rede (`--network`)** decide quais containers **conversam entre si**. Numa rede
  bridge **criada pelo usuário**, o Docker oferece DNS interno: um container encontra
  o outro pelo nome.
- **Publicação de porta (`-p host:container`)** decide o que o **host** (e quem está
  fora dele) consegue acessar. Sem `-p`, o serviço só é visível dentro da rede.

A bridge **padrão** (`bridge`, usada quando não se passa `--network`) **não** tem DNS
por nome. É por isso que o último teste falha, e essa falha é proposital.

## Comandos

### PowerShell / bash (idênticos)

```bash
docker network create rede-lab05

# 1) DNS por nome dentro da rede customizada
docker run -d --name servidor --network rede-lab05 nginx:alpine
docker run --rm --network rede-lab05 busybox wget -qO- http://servidor

# 2) publicando a porta para o host
docker run -d --name servidor-exposto --network rede-lab05 -p 8080:80 nginx:alpine
curl http://localhost:8080             # no PowerShell: curl.exe
docker port servidor-exposto
docker network inspect rede-lab05

# 3) contraprova: bridge padrão, sem DNS por nome
docker run -d --name servidor-default nginx:alpine
docker run --rm busybox wget -T 3 -qO- http://servidor-default
```

## Resultado obtido

| Teste | Resultado |
|---|---|
| `wget http://servidor` (rede-lab05) | `<title>Welcome to nginx!</title>` |
| `curl localhost:8080` | HTTP 200 |
| `docker port` | `80/tcp -> 0.0.0.0:8080` e `[::]:8080` |
| `network inspect` | `driver=bridge`, 2 containers |
| `wget http://servidor-default` | `wget: bad address 'servidor-default'` (**falha esperada**) |

## Por que isso importa nos próximos labs

É esse DNS que permite ao Nginx do Lab 07 fazer `proxy_pass http://backend:4000`
e ao backend do Lab 14 conectar em `db:5432`, sem nenhum IP fixo.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `bind: address already in use` na 8080 | Lab 06/08 ainda rodando | Derrube o outro lab ou use `-p 8085:80` |
| `bad address` dentro da rede customizada | O cliente não está na mesma rede | Inclua `--network rede-lab05` no cliente |
| `NativeCommandError` em vermelho no PowerShell | O PS 5.1 trata o stderr como erro | Leia a mensagem: no teste 3 é a falha esperada |

## Limpeza

```bash
docker rm -f servidor servidor-exposto servidor-default
docker network rm rede-lab05
```
