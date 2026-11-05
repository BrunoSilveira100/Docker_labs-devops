# Multi-stage build: o estágio "builder" tem tudo que é preciso para
# COMPILAR (TypeScript, devDependencies); o estágio final (base alpine)
# recebe só o resultado — dist/ e as dependências de produção.

# ---- estágio 1: build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- estágio 2: produção ----
FROM node:20-alpine
LABEL org.opencontainers.image.title="app-multistage" \
      org.opencontainers.image.description="Lab 11 - API TypeScript compilada (multi-stage)" \
      org.opencontainers.image.authors="Bruno Silveira"
ENV NODE_ENV=production \
    IMAGEM_VARIANTE=multi-stage \
    PORTA=5000
WORKDIR /app
COPY package.json ./
# sem devDependencies (TypeScript, @types) e sem cache do npm na camada final
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder --chown=node:node /app/dist ./dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/ >/dev/null || exit 1
# node direto (não "npm start"): menos processos e o sinal de parada chega ao app
CMD ["node", "dist/index.js"]
