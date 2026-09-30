# Multi-stage build: o estágio "builder" tem tudo que é preciso para
# COMPILAR (TypeScript, devDependencies); o estágio final (base alpine)
# recebe só o resultado — dist/ e as dependências de produção.

# ---- estágio 1: build ----
FROM node:20 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- estágio 2: produção ----
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]
