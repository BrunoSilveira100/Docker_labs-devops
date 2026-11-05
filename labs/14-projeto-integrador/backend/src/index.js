const http = require("http");
const { Pool } = require("pg");

const PORTA = process.env.PORTA || 4000;

// Credenciais vêm do ambiente (env_file: .env no compose) — nada hard-coded.
// Aceita as variáveis do próprio Postgres (POSTGRES_*), assim o compose.yaml
// não precisa repetir/interpolar a senha; PG* continua funcionando como fallback.
const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.POSTGRES_USER || process.env.PGUSER,
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
  database: process.env.POSTGRES_DB || process.env.PGDATABASE,
});

function enviarJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

async function tratarRequisicao(req, res) {
  if (req.url === "/status" && req.method === "GET") {
    return enviarJson(res, 200, { servico: "backend-lab14", status: "ok", autor: "Bruno Silveira" });
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
        // Remove BOM UTF-8: o PowerShell 5.1 o insere ao enviar corpo via pipe
        const { nome, ra, periodo } = JSON.parse(corpoBruto.replace(/^﻿/, "") || "{}");
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

// Encerramento limpo: "docker compose down" envia SIGTERM ao PID 1 (node).
// Fecha o servidor HTTP e o pool do Postgres antes de sair.
for (const sinal of ["SIGTERM", "SIGINT"]) {
  process.on(sinal, () => {
    console.log(`${sinal} recebido, encerrando backend-lab14...`);
    servidor.close(() => pool.end().then(() => process.exit(0)));
  });
}
