# Ambiente de PRODUÇÃO: multi-stage — builda os estáticos e serve com Nginx.

FROM node:20-alpine AS build
WORKDIR /app
COPY app-react/package.json ./
RUN npm install
COPY app-react/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
