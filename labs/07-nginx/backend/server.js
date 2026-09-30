const http = require("http");
const os = require("os");

const PORTA = process.env.PORTA || 4000;

const servidor = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(
    JSON.stringify({
      servico: "backend-lab07",
      status: "ok",
      hostname: os.hostname(),
      caminhoRecebido: req.url,
    })
  );
});

servidor.listen(PORTA, () => console.log(`Backend ouvindo na porta ${PORTA}`));
