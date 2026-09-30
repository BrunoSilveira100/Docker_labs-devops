# Prática 07 — Servidor web Nginx e proxy reverso

```bash
docker network create rede-lab07

docker build -t backend-lab07:1.0 ./backend
docker run -d --name backend --network rede-lab07 backend-lab07:1.0

docker run -d --name lab-nginx \
  --network rede-lab07 \
  -p 8081:80 \
  -v "$(pwd)/site:/usr/share/nginx/html:ro" \
  -v "$(pwd)/conf/nginx.conf:/etc/nginx/nginx.conf:ro" \
  nginx:alpine

curl -i http://localhost:8081
curl http://localhost:8081/api/status
docker exec lab-nginx nginx -t   # valida a sintaxe do nginx.conf montado
```

O Nginx (`lab-nginx`) resolve o nome `backend` pela rede `rede-lab07` — é a
mesma técnica de DNS por nome de container vista na Prática 05.
