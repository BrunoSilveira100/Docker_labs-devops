# Prática 08 — Docker Compose: fundamentos

Migra as práticas 06 (Apache) e 07 (Nginx + backend) para um único
`compose.yaml`.

```bash
docker compose config          # valida e mostra o compose "resolvido"
docker compose up -d
docker compose ps
docker compose logs -f nginx
curl http://localhost:8080     # Apache
curl http://localhost:8081     # Nginx
curl http://localhost:8081/api/status   # Nginx -> proxy -> backend
docker compose exec nginx nginx -t
docker compose down
```
