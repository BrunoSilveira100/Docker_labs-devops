FROM node:20-alpine

LABEL org.opencontainers.image.title="backend-lab07" \
      org.opencontainers.image.description="API Node.js atras do proxy reverso Nginx (Lab 07)" \
      org.opencontainers.image.authors="Bruno Silveira"

ENV NODE_ENV=production \
    PORTA=4000

WORKDIR /app
COPY --chown=node:node server.js ./

# Nunca rodar como root: usuário "node" já vem na imagem oficial
USER node

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/status >/dev/null || exit 1

CMD ["node", "server.js"]
