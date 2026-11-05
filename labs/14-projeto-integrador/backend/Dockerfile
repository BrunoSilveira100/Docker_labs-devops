FROM node:20-alpine

LABEL org.opencontainers.image.title="backend-lab14" \
      org.opencontainers.image.description="Lab 14 - API Node.js (CRUD de alunos) sobre PostgreSQL" \
      org.opencontainers.image.authors="Bruno Silveira"

ENV NODE_ENV=production \
    PORTA=4000

WORKDIR /app

# Dependências primeiro (cache de camadas); só as de produção.
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

# Usuário sem privilégios da imagem oficial
USER node

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/status >/dev/null || exit 1

CMD ["node", "src/index.js"]
