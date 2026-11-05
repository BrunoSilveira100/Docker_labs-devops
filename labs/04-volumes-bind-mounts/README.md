# Lab 04: volumes, bind mounts e tmpfs

**Requisito (LAB-04):** garantir que os dados gravados em `dados/` sobrevivam à destruição do container.

## Os três tipos de armazenamento

| Tipo | Onde os dados ficam | Sobrevive ao `--rm`? | Uso ideal |
|---|---|---|---|
| **Bind mount** (`-v ${PWD}\dados:/dados`) | Numa pasta do **host** | Sim | Código e configs em desenvolvimento |
| **Named volume** (`-v dados-contador:/dados`) | Numa área gerenciada pelo Docker | Sim | Dados de aplicação (Postgres, uploads) |
| **tmpfs** (`--tmpfs /dados`) | Só na **RAM** | Não | Arquivos temporários ou sensíveis |

## Arquivo

`scripts/contador.sh` é meu script de prova. Cada execução:

- incrementa `/dados/contador.txt`;
- registra no `log.txt` o hostname do container que rodou e o tipo de armazenamento (variável `TIPO`);
- falha com uma mensagem clara se `/dados` não estiver montado.

Como cada `docker run --rm` cria um container novo, o hostname muda a cada linha
do log. Isso prova que quem guarda os dados é o volume, não o container.

## Comandos

### PowerShell

```powershell
cd labs\04-volumes-bind-mounts

# 1) Bind mount: rode 3 vezes e abra dados\contador.txt no Explorer
docker run --rm -e TIPO=bind -v "${PWD}\scripts:/scripts:ro" -v "${PWD}\dados:/dados" alpine sh /scripts/contador.sh

# 2) Named volume
docker volume create dados-contador
docker run --rm -e TIPO=volume -v "${PWD}\scripts:/scripts:ro" -v dados-contador:/dados alpine sh /scripts/contador.sh
docker volume inspect dados-contador

# 3) tmpfs: rode 2 vezes, o contador sempre volta para 1
docker run --rm -e TIPO=tmpfs -v "${PWD}\scripts:/scripts:ro" --tmpfs /dados alpine sh /scripts/contador.sh
```

### bash

```bash
cd labs/04-volumes-bind-mounts
docker run --rm -e TIPO=bind   -v "$(pwd)/scripts:/scripts:ro" -v "$(pwd)/dados:/dados" alpine sh /scripts/contador.sh
docker volume create dados-contador
docker run --rm -e TIPO=volume -v "$(pwd)/scripts:/scripts:ro" -v dados-contador:/dados alpine sh /scripts/contador.sh
docker run --rm -e TIPO=tmpfs  -v "$(pwd)/scripts:/scripts:ro" --tmpfs /dados alpine sh /scripts/contador.sh
```

## Resultado obtido

| Tipo | Execuções | Contador |
|---|---|---|
| Bind mount | 3 | 1 → 2 → 3 (o arquivo apareceu no host) |
| Named volume | 2 | 1 → 2 (`Mountpoint: /var/lib/docker/volumes/dados-contador/_data`) |
| tmpfs | 2 | 1 → 1 |

Os arquivos gerados em `dados/` estão no `.gitignore`; só o `.gitkeep` é versionado.

## Troubleshooting

| Erro | Causa | Correção |
|---|---|---|
| `ERRO: /dados não existe ou não tem permissão` | O volume não foi montado | Confira o `-v ...:/dados` |
| `arithmetic syntax error` | `contador.txt` gravado com CRLF | Apague `dados/contador.txt` e rode de novo |
| No Git Bash o caminho vira `C:/Program Files/Git/...` | Conversão de caminhos do MSYS | `MSYS_NO_PATHCONV=1` ou PowerShell |

## Limpeza

```powershell
docker volume rm dados-contador
Remove-Item dados\contador.txt, dados\log.txt
```
