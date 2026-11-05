# ---- estágio 1: build dos estáticos (Node + Vite só existem aqui) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build

# ---- estágio 2: Nginx servindo o dist/ e fazendo proxy de /api ----
FROM nginx:1.31-alpine
LABEL org.opencontainers.image.title="frontend-lab14" \
      org.opencontainers.image.description="Lab 14 - React (build de producao) servido por Nginx com proxy /api" \
      org.opencontainers.image.authors="Bruno Silveira"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
