# Lab 13 — imagem endurecida: usuário dedicado, healthcheck e metadados OCI
# Bruno Silveira · Unifeg 2026B
FROM node:20-alpine

LABEL org.opencontainers.image.title="app-lab13" \
      org.opencontainers.image.description="Lab 13 - secret via arquivo, usuario nao-root, limites de recurso" \
      org.opencontainers.image.authors="Bruno Silveira" \
      org.opencontainers.image.version="1.0"

ENV NODE_ENV=production \
    PORTA=6000

WORKDIR /app

# Usuário e grupo de sistema dedicados (-S), sem senha e sem shell de login
RUN addgroup -S appgroup && adduser -S -G appgroup -H -s /sbin/nologin appuser

COPY --chown=appuser:appgroup server.js ./

USER appuser

EXPOSE 6000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:6000/saude >/dev/null || exit 1

CMD ["node", "server.js"]
