#!/bin/sh
# Incrementa um contador persistido em /dados/contador.txt e registra
# cada execução em /dados/log.txt — usado para comparar named volume,
# bind mount e tmpfs (veja o roteiro).

ARQUIVO=/dados/contador.txt
LOG=/dados/log.txt

valor_anterior=$(cat "$ARQUIVO" 2>/dev/null || echo 0)
novo_valor=$((valor_anterior + 1))
echo "$novo_valor" > "$ARQUIVO"

echo "$(date '+%Y-%m-%d %H:%M:%S') - execucao numero $novo_valor" >> "$LOG"

echo "Contador atual: $novo_valor"
echo "--- historico (log.txt) ---"
cat "$LOG"
