const http = require("http");
const { Pool } = require("pg");

const PORTA = process.env.PORTA || 4000;

// pg lê PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT automaticamente do
// ambiente — nenhuma credencial fica hard-coded aqui.
const pool = new Pool();

function enviarJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

async function tratarRequisicao(req, res) {
  if (req.url === "/status" && req.method === "GET") {
    return enviarJson(res, 200, { servico: "backend-lab14", status: "ok" });
  }

  if (req.url === "/alunos" && req.method === "GET") {
    const resultado = await pool.query("SELECT id, nome, ra, periodo FROM alunos ORDER BY id");
    return enviarJson(res, 200, resultado.rows);
  }

  if (req.url === "/alunos" && req.method === "POST") {
    let corpoBruto = "";
    req.on("data", (chunk) => (corpoBruto += chunk));
    req.on("end", async () => {
      try {
        const { nome, ra, periodo } = JSON.parse(corpoBruto || "{}");
        if (!nome || !ra) return enviarJson(res, 400, { erro: "nome e ra são obrigatórios" });
        const resultado = await pool.query(
          "INSERT INTO alunos (nome, ra, periodo) VALUES ($1, $2, COALESCE($3, 1)) RETURNING id, nome, ra, periodo",
          [nome, ra, periodo]
        );
        enviarJson(res, 201, resultado.rows[0]);
      } catch (erro) {
        enviarJson(res, 400, { erro: erro.message });
      }
    });
    return;
  }

  enviarJson(res, 404, { erro: "rota não encontrada" });
}

const servidor = http.createServer((req, res) => {
  tratarRequisicao(req, res).catch((erro) => {
    console.error(erro);
    enviarJson(res, 500, { erro: "erro interno" });
  });
});

servidor.listen(PORTA, () => console.log(`backend-lab14 ouvindo na porta ${PORTA}`));
