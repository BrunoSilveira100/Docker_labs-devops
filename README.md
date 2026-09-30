# Roteiro de Laboratório — Docker e Docker Compose

Material de laboratório para a disciplina de Sistemas Distribuídos, Ciência
da Computação, 8º período — Centro Universitário Unifeg.

## O que tem aqui

```
docs/
  Roteiro_Docker_Aluno.docx       # roteiro completo para o aluno
labs/
  01-fundamentos-containers/ … 14-projeto-integrador/
                                   # arquivos reais de cada prática
                                   # (Dockerfiles, compose.yaml, código, configs)
```

O `.docx` em `docs/` já está pronto para uso — não é preciso rodar nada
para usá-lo.

## As 14 práticas

| # | Prática |
|---|---|
| 01 | Fundamentos e primeiros containers |
| 02 | Ubuntu dentro de um container |
| 03 | Imagens e Dockerfile |
| 04 | Volumes e bind mounts |
| 05 | Redes e mapeamento de portas |
| 06 | Servidor web Apache |
| 07 | Servidor web Nginx e proxy reverso |
| 08 | Docker Compose — fundamentos |
| 09 | PostgreSQL em container |
| 10 | pgAdmin + PostgreSQL via Compose |
| 11 | Multi-stage build e otimização de imagens |
| 12 | Ambiente de desenvolvimento React em containers |
| 13 | Registry local, segurança e troubleshooting |
| 14 | Projeto integrador (React + API + PostgreSQL + pgAdmin) |

Cada pasta em `labs/` tem um `README.md` próprio com os comandos daquela
prática (o mesmo conteúdo que aparece no roteiro, pronto para copiar e
colar) e todos os arquivos que ela usa.

## Pré-requisitos para rodar as práticas

- **Windows**: Docker Desktop + WSL2, PowerShell.
- **Ubuntu**: Docker Engine (repositório oficial da Docker, não o pacote
  `docker.io` do apt) + bash.
- Ver o checklist completo de verificação no início do roteiro do aluno.

## Limpando o ambiente

Depois de rodar qualquer prática baseada em Compose:

```bash
docker compose down       # mantém volumes nomeados (dados persistem)
docker compose down -v    # remove containers, rede e volumes
```

Para limpar imagens e containers de teste que sobraram soltos (fora de um
projeto Compose):

```bash
docker container prune
docker image prune
docker volume prune
```

## Validação

Todos os `compose.yaml` deste repositório foram validados com
`docker compose config`, e as práticas 03, 06, 07, 08, 10, 11, 12, 13 e 14
foram testadas de ponta a ponta com Docker real (builds, subida das
stacks, healthchecks, proxy reverso, hot reload, registry local, secrets e
limites de recursos). As práticas 01, 02, 04, 05 e 09 usam apenas comandos
simples de `docker run`/`docker network` já cobertos pelos exemplos acima e
não foram reexecutadas linha a linha neste repositório.
