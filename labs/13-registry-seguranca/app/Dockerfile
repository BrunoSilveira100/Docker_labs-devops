FROM node:20-alpine

WORKDIR /app
COPY server.js ./

# UNIFEG: nunca rode como root em produção — cria um usuário dedicado
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV PORTA=6000
EXPOSE 6000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:6000/saude || exit 1

CMD ["node", "server.js"]
