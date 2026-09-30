# Prática 05 — Redes e mapeamento de portas

```bash
docker network create rede-lab05

docker run -d --name servidor --network rede-lab05 nginx:alpine
docker run --rm --network rede-lab05 busybox wget -qO- http://servidor

# mapeando a porta do servidor para o host:
docker run -d --name servidor-exposto --network rede-lab05 -p 8080:80 nginx:alpine
curl http://localhost:8080

docker network inspect rede-lab05
docker port servidor-exposto

# comparando com a rede bridge padrão (sem DNS por nome):
docker run -d --name servidor-default nginx:alpine
docker run --rm busybox wget -qO- http://servidor-default   # falha: sem rede definida pelo usuário não há DNS por nome
```
