# Prática 03 — primeira imagem própria
# Base alpine com tag fixada (major 20): imagem pequena e build reprodutível.
FROM node:20-alpine

# Metadados no padrão OCI (consultáveis com: docker inspect app-fundamentos:1.0)
LABEL org.opencontainers.image.title="app-fundamentos" \
      org.opencontainers.image.description="Lab 03 - primeira imagem propria (Node.js HTTP)" \
      org.opencontainers.image.authors="Bruno Silveira" \
      org.opencontainers.image.version="1.0"

ENV NODE_ENV=production \
    PORTA=3000

WORKDIR /app

# Copiado antes do restante do código para aproveitar o cache de camadas:
# só reinstala dependências quando package.json mudar.
COPY app/package.json ./
RUN npm install --omit=dev && npm cache clean --force

# --chown evita que os arquivos da app pertençam ao root
COPY --chown=node:node app/server.js ./

# Usuário sem privilégios que já existe na imagem oficial do Node
USER node

EXPOSE 3000

# wget existe no alpine (busybox); curl não.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

# Forma exec: o node vira PID 1 e recebe o SIGTERM do "docker stop".
CMD ["node", "server.js"]
