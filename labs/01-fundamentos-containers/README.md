# Prática 01 — Fundamentos e primeiros containers

Nenhum arquivo próprio é necessário — esta prática usa apenas imagens públicas
do Docker Hub (`hello-world`, `alpine`).

Comandos de referência (ver roteiro para o passo a passo comentado):

```bash
docker run hello-world
docker run --rm alpine echo "Ola, Unifeg"
docker run -it --name meu-alpine alpine sh
docker ps
docker ps -a
docker logs meu-alpine
docker rm meu-alpine
```
