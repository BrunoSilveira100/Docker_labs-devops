import http from "http";

const PORTA = Number(process.env.PORTA) || 5000;

const servidor = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ servico: "app-multistage", compilado: true }));
});

servidor.listen(PORTA, () => console.log(`API (TypeScript compilado) na porta ${PORTA}`));
