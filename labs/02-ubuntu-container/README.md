# Prática 02 — Ubuntu dentro de um container

`scripts/explorar.sh` é montado por bind mount dentro do container para ser
executado sem precisar digitar tudo manualmente.

```bash
docker run -it --name lab-ubuntu -v "$(pwd)/scripts:/scripts" ubuntu:24.04 bash
# dentro do container:
apt update && apt install -y curl procps
sh /scripts/explorar.sh
exit

docker start -ai lab-ubuntu   # retomar o MESMO container
docker rm lab-ubuntu          # descartar de vez
```
