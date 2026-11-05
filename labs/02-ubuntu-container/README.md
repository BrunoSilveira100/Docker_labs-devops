# Lab 02: Ubuntu dentro de um container

**Requisito (LAB-02):** executar o `explorar.sh` dentro do container e validar os estados.

## Ideia central

Tudo o que se instala num container (aqui, `curl` e `procps`) vai para a **camada
gravável daquele container**:

- sobrevive a `stop` e `start` do mesmo container;
- **some** num `docker run` novo, que parte da imagem limpa;
- some de vez com `docker rm`.

Para tornar uma alteração permanente, ela precisa ir para um Dockerfile (Lab 03).

## Arquivos

| Arquivo | Papel |
|---|---|
| `scripts/explorar.sh` | Meu script de inspeção em 6 seções: identidade, distro/kernel, pacotes, processos, rede e montagens. Ele marca `[x]`/`[ ]` para curl e procps, e mostra que o kernel é o do host. |

O container roda como **root de propósito**: o `apt install` exige isso, e o lab
é sobre explorar o sistema, não sobre hardening.

## Comandos

### PowerShell

```powershell
cd labs\02-ubuntu-container
docker run -it --name lab-ubuntu -v "${PWD}\scripts:/scripts" ubuntu:24.04 bash
```

### bash

```bash
cd labs/02-ubuntu-container
docker run -it --name lab-ubuntu -v "$(pwd)/scripts:/scripts" ubuntu:24.04 bash
```

### Dentro do container

```bash
sh /scripts/explorar.sh            # 1ª vez: curl [ ] ausente (procps já vem na imagem)
apt update && apt install -y curl procps
sh /scripts/explorar.sh            # agora curl aparece como [x] presente
exit
```

### Prova de estado

```bash
docker start -ai lab-ubuntu        # MESMO container: curl continua lá
command -v curl                    # /usr/bin/curl
exit

docker run --rm ubuntu:24.04 sh -c "command -v curl || echo 'curl NAO existe'"   # container NOVO
docker rm lab-ubuntu
```

## Resultado obtido

- `explorar.sh` mostrou Ubuntu 24.04.5 LTS, PID 1 = `sleep`/`bash` (não há systemd) e o bind mount `/scripts`.
- Depois de `stop` e `start`: `/usr/bin/curl` continuava instalado.
- Num `docker run` novo: `curl NAO existe`.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `/scripts/explorar.sh: not found` | Caminho do bind mount errado (é relativo à pasta atual) | Rode a partir de `labs/02-ubuntu-container` |
| `$'\r': command not found` | Script salvo com CRLF no Windows | O `.gitattributes` força LF; se editar, salve em LF |
| `ps: not found` | procps não vem na imagem mínima | `apt install -y procps` (o script tem fallback em `/proc`) |
| No Git Bash o caminho vira `C:/Program Files/Git/scripts` | O MSYS converte caminhos POSIX | Use `MSYS_NO_PATHCONV=1 docker run ...` ou o PowerShell |
