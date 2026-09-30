# Prática 06 — Servidor web Apache

```bash
docker run -d --name lab-apache \
  -p 8080:80 \
  -v "$(pwd)/site:/usr/local/apache2/htdocs" \
  -v "$(pwd)/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" \
  httpd:2.4

curl -i http://localhost:8080
docker logs lab-apache
docker exec lab-apache httpd -t   # valida a sintaxe do httpd.conf montado
```

O cabeçalho `X-Servido-Por: Apache-Unifeg-Lab06` na resposta comprova que o
`httpd.conf` customizado (não o da imagem) está em uso.
