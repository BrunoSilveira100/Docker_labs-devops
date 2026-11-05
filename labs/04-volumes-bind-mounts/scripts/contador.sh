#!/bin/sh
# contador.sh — prova de persistência para a Prática 04
# Autor: Bruno Silveira · Unifeg 2026B
#
# Cada execução incrementa /dados/contador.txt e acrescenta uma linha em
# /dados/log.txt com o container que executou. Rodando várias vezes com
# --rm (container novo a cada vez) dá para comparar:
#   bind mount   -> o contador cresce e os arquivos aparecem no HOST
#   named volume -> o contador cresce, mas os arquivos ficam no Docker
#   tmpfs        -> o contador sempre volta para 1 (só memória)
#
# Variável opcional: TIPO=bind|volume|tmpfs (apenas rotula o log)

set -e

DIR=/dados
ARQUIVO="$DIR/contador.txt"
LOG="$DIR/log.txt"
TIPO="${TIPO:-nao-informado}"

if [ ! -w "$DIR" ]; then
  echo "ERRO: $DIR não existe ou não tem permissão de escrita." >&2
  echo "Monte um volume: -v <origem>:/dados" >&2
  exit 1
fi

valor_anterior=$(cat "$ARQUIVO" 2>/dev/null || echo 0)
novo_valor=$((valor_anterior + 1))
echo "$novo_valor" > "$ARQUIVO"

printf '%s | execucao #%s | container=%s | tipo=%s\n' \
  "$(date '+%Y-%m-%d %H:%M:%S')" "$novo_valor" "$(hostname)" "$TIPO" >> "$LOG"

echo "Contador atual: $novo_valor  (tipo de armazenamento: $TIPO)"
echo "--- histórico (log.txt) ---"
cat "$LOG"
