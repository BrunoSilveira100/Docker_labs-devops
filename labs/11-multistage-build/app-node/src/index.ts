// app-multistage — API mínima em TypeScript usada na Prática 11
// Autor: Bruno Silveira · Unifeg 2026B
//
// O código é o mesmo nas duas imagens (:single e :multi). Só muda COMO a
// imagem é construída, e é isso que a prática compara.
import http from "http";
import os from "os";

interface RespostaInfo {
  servico: string;
  autor: string;
  compilado: boolean;
  imagem: string;
  container: string;
  usuarioLinux: string;
  node: string;
}

const PORTA: number = Number(process.env.PORTA) || 5000;

// Cada Dockerfile define IMAGEM_VARIANTE; sem ela, cai em "desconhecida".
const VARIANTE: string = process.env.IMAGEM_VARIANTE ?? "desconhecida";

function responder(res: http.ServerResponse, status: number, corpo: object): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

const servidor = http.createServer((req, res) => {
  if (req.url === "/saude") {
    return responder(res, 200, { status: "ok" });
  }
  const info: RespostaInfo = {
    servico: "app-multistage",
    autor: "Bruno Silveira",
    compilado: true,
    imagem: VARIANTE,
    container: os.hostname(),
    usuarioLinux: os.userInfo().username,
    node: process.version,
  };
  responder(res, 200, info);
});

servidor.listen(PORTA, () => console.log(`API (TypeScript compilado, imagem ${VARIANTE}) na porta ${PORTA}`));
process.on("SIGTERM", () => servidor.close(() => process.exit(0)));
