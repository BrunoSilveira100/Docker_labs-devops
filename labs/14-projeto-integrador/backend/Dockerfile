FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV PORTA=4000
EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost:4000/status || exit 1

CMD ["node", "src/index.js"]
