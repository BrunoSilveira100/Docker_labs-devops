// backend-lab08 — API mínima atrás do proxy reverso Nginx
// Autor: Bruno Silveira · Unifeg 2026B
//
// O Nginx recebe /api/<rota> e repassa para http://backend:4000/<rota>
// (o "/" final do proxy_pass remove o prefixo /api).
const http = require("http");
const os = require("os");

const PORTA = Number(process.env.PORTA) || 4000;
const INICIO = Date.now();
let totalRequisicoes = 0;

function json(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo, null, 2));
}

const rotas = {
  // usada pelo HEALTHCHECK do Dockerfile e por depends_on: service_healthy
  "/status": () => ({
    servico: "backend-lab08",
    status: "ok",
    autor: "Bruno Silveira",
  }),

  // mostra QUAL container respondeu e há quanto tempo está no ar
  "/info": (req) => ({
    servico: "backend-lab08",
    container: os.hostname(),
    usuarioLinux: os.userInfo().username,
    node: process.version,
    noArHaSegundos: Math.round((Date.now() - INICIO) / 1000),
    requisicoesAtendidas: totalRequisicoes,
    memoriaRssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    // cabeçalhos que o Nginx adiciona: prova de que a chamada passou pelo proxy
    viaProxy: {
      host: req.headers["host"] || null,
      xRealIp: req.headers["x-real-ip"] || null,
      xForwardedFor: req.headers["x-forwarded-for"] || null,
    },
  }),
};

const servidor = http.createServer((req, res) => {
  totalRequisicoes += 1;
  const caminho = req.url.split("?")[0];
  const rota = rotas[caminho];

  if (req.method !== "GET") {
    return json(res, 405, { erro: "método não permitido", metodo: req.method });
  }
  if (!rota) {
    return json(res, 404, { erro: "rota não encontrada", caminhoRecebido: caminho, rotas: Object.keys(rotas) });
  }
  return json(res, 200, rota(req));
});

servidor.listen(PORTA, () => console.log(`backend-lab08 ouvindo na porta ${PORTA}`));

// docker stop envia SIGTERM ao PID 1: encerra sem esperar os 10 s do SIGKILL
process.on("SIGTERM", () => servidor.close(() => process.exit(0)));
