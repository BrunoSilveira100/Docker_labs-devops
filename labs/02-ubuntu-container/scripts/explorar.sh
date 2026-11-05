#!/bin/sh
# explorar.sh — inspeção do ambiente interno de um container Ubuntu
# Autor: Bruno Silveira · Unifeg 2026B · Prática 02
#
# Objetivo: mostrar que um container é um processo isolado com sistema de
# arquivos, árvore de processos, hostname e rede próprios — e que o estado
# alterado (pacotes instalados) vive na camada gravável DESTE container.
#
# Uso (dentro do container): sh /scripts/explorar.sh

secao() {
  printf '\n==================== %s ====================\n' "$1"
}

secao "1. Identidade do container"
echo "Hostname (= ID curto do container): $(hostname)"
echo "Usuário atual: $(id -un) (uid=$(id -u))"
echo "Data/hora no container: $(date '+%d/%m/%Y %H:%M:%S %Z')"

secao "2. Distribuição e kernel"
. /etc/os-release && echo "Distribuição: $PRETTY_NAME"
echo "Kernel: $(uname -r)  <- é o kernel do HOST (WSL2/Linux), não do Ubuntu"
echo "Arquitetura: $(uname -m)"

secao "3. Pacotes"
total=$(dpkg-query -f '.\n' -W 2>/dev/null | wc -l)
echo "Pacotes instalados (dpkg): $total"
# curl NÃO vem na imagem ubuntu:24.04; procps já vem. Se curl aparecer como
# presente, ele foi instalado neste container (camada gravável).
for pkg in curl procps; do
  if dpkg -s "$pkg" >/dev/null 2>&1; then
    echo "  [x] $pkg presente"
  else
    echo "  [ ] $pkg ausente — rode: apt update && apt install -y $pkg"
  fi
done

secao "4. Processos (isolamento por PID namespace)"
if command -v ps >/dev/null 2>&1; then
  ps -eo pid,user,comm
  echo "Observe: o PID 1 é o processo principal do container, não o systemd."
else
  echo "ps não disponível (instale procps). PIDs em /proc:"
  ls /proc | grep -E '^[0-9]+$' | tr '\n' ' '; echo
fi

secao "5. Rede"
echo "Interfaces/IPs:"
cat /proc/net/fib_trie 2>/dev/null | awk '/32 host/ {print "  " ip} {ip=$2}' | sort -u
echo "DNS (resolv.conf):"
grep nameserver /etc/resolv.conf | sed 's/^/  /'

secao "6. Disco e montagens"
df -h / | sed 's/^/  /'
echo "Bind mount desta prática:"
grep ' /scripts ' /proc/mounts | sed 's/^/  /' || echo "  /scripts não está montado"

secao "Fim"
echo "Saia com 'exit' e volte com 'docker start -ai lab-ubuntu':"
echo "os pacotes instalados continuam lá. Um 'docker run' novo começa do zero."
