# Prática 09 — PostgreSQL em container

```bash
cp .env.example .env    # edite a senha antes de continuar

docker volume create pgdata-lab09

docker run -d --name lab-postgres \
  --env-file .env \
  -v pgdata-lab09:/var/lib/postgresql/data \
  -v "$(pwd)/init:/docker-entrypoint-initdb.d:ro" \
  -p 5432:5432 \
  postgres:16-alpine

docker logs -f lab-postgres        # aguarde "database system is ready to accept connections"

docker exec -it lab-postgres psql -U unifeg -d lab_sistemas_distribuidos -c "SELECT * FROM alunos;"

# backup e restauração
docker exec lab-postgres pg_dump -U unifeg lab_sistemas_distribuidos > backup.sql
docker exec -i lab-postgres psql -U unifeg -d lab_sistemas_distribuidos < backup.sql
```

Remova o container (`docker rm -f lab-postgres`) e recrie-o com o mesmo
`-v pgdata-lab09:...` para comprovar que os dados sobrevivem — depois remova
o volume (`docker volume rm pgdata-lab09`) e recrie do zero para comparar.
