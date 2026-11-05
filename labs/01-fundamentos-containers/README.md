# Lab 01: fundamentos e ciclo de vida de containers

**Requisito (LAB-01):** executar, pausar, inspecionar logs e remover containers pela CLI.

## O que um container é, na prática

Um container é um processo comum do Linux, isolado por *namespaces* (PID, rede,
mount, hostname) e limitado por *cgroups*. A imagem é o molde, somente leitura.
O container é a instância desse molde em execução, com uma camada gravável própria.

## Roteiro executado

Nenhum arquivo próprio é necessário. Uso só as imagens públicas `hello-world` e `alpine`.

### PowerShell

```powershell
docker run --rm hello-world                                # baixa a imagem, roda e se remove
docker run --rm alpine echo "Ola, Unifeg - Bruno Silveira"

# container de longa duração para observar o ciclo de vida
docker run -d --name meu-alpine alpine sh -c "echo iniciado; sleep 300"
docker ps                                                  # STATUS: Up
docker pause meu-alpine;  docker ps                        # STATUS: Up (Paused)
docker unpause meu-alpine
docker logs meu-alpine                                     # imprime "iniciado"
docker inspect -f "Imagem={{.Config.Image}} Estado={{.State.Status}}" meu-alpine
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" meu-alpine
docker stop meu-alpine;   docker ps -a                     # STATUS: Exited
docker rm meu-alpine

# modo interativo (precisa de terminal real)
docker run -it --name meu-alpine alpine sh
```

### bash

São os mesmos comandos. Muda só o `;`, que no bash pode virar `&&`.

## Resultado obtido

| Comando | Saída observada |
|---|---|
| `docker run --rm hello-world` | `Hello from Docker!` |
| `docker pause` | `meu-alpine Up 1 second (Paused)` |
| `docker logs` | `iniciado` |
| `docker inspect` (IP) | `172.17.0.2`, na bridge padrão |

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `map has no entry for key "IPAddress"` | O Docker 29 removeu o campo `.NetworkSettings.IPAddress` | Use `{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}` |
| `the input device is not a TTY` | `-it` rodando fora de um terminal interativo (script ou CI) | Tire o `-t` ou rode num terminal de verdade |
| `Conflict. The container name "/meu-alpine" is already in use` | Sobrou um container com esse nome | `docker rm -f meu-alpine` |

## Limpeza

```bash
docker rm -f meu-alpine 2>/dev/null; docker container prune -f
```
