#!/bin/sh
# Script de exploração executado DENTRO do container ubuntu.
# Uso: cole o conteúdo em um arquivo montado por bind mount, ou
# copie/cole os comandos diretamente no shell interativo do container.

echo "== Distribuição =="
cat /etc/os-release

echo "== Pacotes instalados manualmente nesta sessão =="
apt list --installed 2>/dev/null | grep -v "^Listing" | wc -l

echo "== Processos =="
ps aux

echo "== Uso de disco do container =="
df -h /
