# Ambiente de PRODUÇÃO: multi-stage — builda os estáticos e serve com Nginx.
# A imagem final não tem Node, npm, Vite nem código-fonte: só HTML/JS/CSS.

# ---- estágio 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY app-react/package.json ./
RUN npm install
COPY app-react/ ./
RUN npm run build

# ---- estágio 2: servidor estático ----
FROM nginx:1.31-alpine
LABEL org.opencontainers.image.title="app-react-lab12" \
      org.opencontainers.image.description="Lab 12 - build de producao React servido por Nginx" \
      org.opencontainers.image.authors="Bruno Silveira"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
