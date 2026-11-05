# Lab 06: servidor web Apache HTTPD

**Requisito (LAB-06):** mapear o diretório do site e um `httpd.conf` estático.

## Arquitetura

```
host:8080 ──► container httpd:2.4 :80
               ├─ /usr/local/apache2/htdocs           ◄── bind mount de site/ (somente leitura)
               └─ /usr/local/apache2/conf/httpd.conf  ◄── bind mount de conf/httpd.conf (somente leitura)
```

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `site/index.html`, `site/estilo.css` | Minha página: explica o fluxo do bind mount e como provar que a configuração em uso é a minha |
| `conf/httpd.conf` | Config mínima: só os módulos necessários, log no formato `unifeg` com tempo de resposta em µs, e os cabeçalhos `X-Servido-Por` e `X-Autor` |

Os dois mounts usam `:ro`, porque o container não tem motivo para escrever no
site nem na config.

## Comandos

### PowerShell

```powershell
cd labs\06-apache
docker run -d --name lab-apache -p 8080:80 `
  -v "${PWD}\site:/usr/local/apache2/htdocs:ro" `
  -v "${PWD}\conf\httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" `
  httpd:2.4
curl.exe -i http://localhost:8080
docker exec lab-apache httpd -t          # valida a sintaxe da config montada
docker logs lab-apache                   # linhas com "tempo=...-us"
```

### bash

```bash
cd labs/06-apache
docker run -d --name lab-apache -p 8080:80 \
  -v "$(pwd)/site:/usr/local/apache2/htdocs:ro" \
  -v "$(pwd)/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" \
  httpd:2.4
curl -i http://localhost:8080
docker exec lab-apache httpd -t
```

## Resultado obtido

```
HTTP/1.1 200 OK
X-Servido-Por: Apache-Unifeg-Lab06
X-Autor: Bruno Silveira
```

- `httpd -t` → `Syntax OK`
- Log: `"GET / HTTP/1.1" 200 ... tempo=10365-us`

A imagem oficial não traz esses cabeçalhos nem esse formato de log. A presença
deles prova que o `httpd.conf` montado é o que está em uso.

**Teste de bind mount:** com o container rodando, edite `site/index.html` e
recarregue `http://localhost:8080`. A mudança aparece sem reiniciar nada.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| Container sai logo após subir | Erro de sintaxe no `httpd.conf` | `docker logs lab-apache` e conserte; valide com `httpd -t` |
| `AH00558: Could not reliably determine...` | Falta o `ServerName` | Já está definido como `lab-apache-unifeg:80` |
| O mount do arquivo vira uma **pasta** vazia | O caminho do arquivo no host estava errado | Rode a partir de `labs/06-apache` |

## Limpeza

```bash
docker rm -f lab-apache
```
