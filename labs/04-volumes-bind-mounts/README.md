# Prática 04 — Volumes e bind mounts

## Bind mount (pasta local `dados/` mapeada para dentro do container)

PowerShell:
```powershell
docker run --rm `
  -v "${PWD}\scripts:/scripts:ro" `
  -v "${PWD}\dados:/dados" `
  alpine sh /scripts/contador.sh
```

bash:
```bash
docker run --rm \
  -v "$(pwd)/scripts:/scripts:ro" \
  -v "$(pwd)/dados:/dados" \
  alpine sh /scripts/contador.sh
```

Rode duas ou três vezes e observe `dados/contador.txt` e `dados/log.txt`
crescendo na sua máquina — o volume é a pasta local.

## Named volume (gerenciado pelo Docker)

```bash
docker volume create dados-contador
docker run --rm \
  -v "$(pwd)/scripts:/scripts:ro" \
  -v dados-contador:/dados \
  alpine sh /scripts/contador.sh

docker volume inspect dados-contador
```

## tmpfs (só em memória, some ao remover o container)

```bash
docker run --rm \
  -v "$(pwd)/scripts:/scripts:ro" \
  --tmpfs /dados \
  alpine sh /scripts/contador.sh
```

Rode duas vezes seguidas com `--tmpfs` e compare: o contador nunca passa de 1.
