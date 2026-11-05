# Lab 13: registry local, segurança e troubleshooting

**Requisito (LAB-13):** subir um registry privado e injetar senhas de forma segura via `secrets/`.

## Camadas de segurança aplicadas no serviço `app`

| Controle | Onde | Efeito |
|---|---|---|
| Usuário dedicado `appuser` (sem shell e sem home) | `app/Dockerfile` | O processo não é root |
| Secret via arquivo (`DB_PASSWORD_FILE`) | `compose.yaml` | A senha não aparece em `docker inspect` nem em `env` |
| `read_only: true` + `tmpfs: /tmp` | `compose.yaml` | O sistema de arquivos da imagem não pode ser alterado |
| `cap_drop: [ALL]` | `compose.yaml` | Nenhuma capability do kernel |
| `no-new-privileges:true` | `compose.yaml` | Bloqueia escalada via setuid |
| Limites de 0.5 CPU e 128 MB | `deploy.resources` | Contém um processo descontrolado |
| `HEALTHCHECK` | `app/Dockerfile` | O Compose sabe se o app está realmente respondendo |

A resposta de `/` mostra tudo isso: `rodandoComoRoot: false`,
`segredoCarregadoViaSecretFile: "sim"`, o tamanho do segredo (nunca o valor) e o
`limiteMemoriaMB`, lido do cgroup.

`secrets/db_password.txt` é **um exemplo didático versionado de propósito**. Um
segredo real nunca deve ir para o git.

## Comandos (PowerShell e bash)

```bash
cd labs/13-registry-seguranca
docker compose up -d --build --wait
docker compose ps
curl http://localhost:6000              # PowerShell: curl.exe (6000 é bloqueada pelos navegadores)
curl http://localhost:6000/saude
docker stats --no-stream
docker compose exec app whoami                              # appuser
docker compose exec app sh -c "env | grep -i senha || echo 'segredo fora do env'"
docker compose exec app sh -c "touch /app/x || echo 'FS somente leitura'"
```

### Registry local: tag, push e pull

```bash
docker build -t app-lab13:1.0 ./app
docker tag  app-lab13:1.0 localhost:5000/app-lab13:1.0
docker push localhost:5000/app-lab13:1.0
docker rmi  localhost:5000/app-lab13:1.0
docker pull localhost:5000/app-lab13:1.0
curl http://localhost:5000/v2/_catalog
curl http://localhost:5000/v2/app-lab13/tags/list
```

## Resultado obtido

- `app` e `registry` → `(healthy)`
- `whoami` → `appuser`; o segredo não aparece no `env`
- `docker inspect` → `NanoCpus=500000000`, `Memory=134217728`
- `_catalog` → `{"repositories":["app-lab13"]}`; tags → `["1.0"]`

## Roteiro de troubleshooting

```bash
docker compose logs app                                         # o que o processo escreveu
docker inspect --format "{{json .State.Health}}" $(docker compose ps -q app)
docker compose events --since 5m                                # start, die, health_status...
docker compose exec app cat /sys/fs/cgroup/memory.max           # limite efetivo
```

| Sintoma | Causa | Correção |
|---|---|---|
| `EROFS: read-only file system` | A app tentou gravar com `read_only: true` | Grave em `/tmp` (tmpfs) ou monte um volume |
| `segredoCarregadoViaSecretFile: "nao"` | O arquivo em `secrets/` não existe | Crie `secrets/db_password.txt` |
| `push` falha com `http: server gave HTTP response to HTTPS client` | Registry que não é `localhost` | Use `localhost:5000` ou configure `insecure-registries` |
| `OOMKilled` no `docker inspect` | Passou dos 128 MB | Aumente o limite ou investigue um vazamento de memória |

## Limpeza

```bash
docker compose down -v
docker rmi localhost:5000/app-lab13:1.0 app-lab13:1.0
```
