# Prática 03 — primeira imagem própria
FROM node:20-alpine

WORKDIR /app

# Copiado antes do restante do código para aproveitar o cache de camadas:
# só reinstala dependências quando package.json mudar.
COPY app/package.json ./
RUN npm install --omit=dev

COPY app/server.js ./

ENV PORTA=3000
EXPOSE 3000

CMD ["node", "server.js"]
