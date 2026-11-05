// backend-lab14 — API REST do Projeto Integrador (CRUD mínimo de alunos)
// Autor: Bruno Silveira · Unifeg 2026B
//
// Rotas (o Nginx do frontend publica todas sob o prefixo /api):
//   GET  /status  -> saúde do serviço (HEALTHCHECK e depends_on)
//   GET  /alunos  -> lista de alunos
//   GET  /resumo  -> total por curso/período (view vw_resumo_turmas)
//   POST /alunos  -> cadastra um aluno {nome, ra, curso?, periodo?}
const http = require("http");
const { Pool } = require("pg");

const PORTA = Number(process.env.PORTA) || 4000;
const CURSO_PADRAO = "Ciência da Computação";
const LIMITE_CORPO = 10 * 1024; // 10 KB é mais que suficiente para um aluno

// Credenciais vêm do ambiente (env_file: .env no compose), nada hard-coded.
// A API usa as variáveis do próprio Postgres (POSTGRES_*), então o compose.yaml
// não precisa repetir nem interpolar a senha. As PG* continuam como fallback.
const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.POSTGRES_USER || process.env.PGUSER,
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
  database: process.env.POSTGRES_DB || process.env.PGDATABASE,
  max: 5,
});

function enviarJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let corpo = "";
    let excedeu = false;
    req.on("data", (pedaco) => {
      if (excedeu) return; // continua drenando a conexão, mas descarta os dados
      corpo += pedaco;
      if (corpo.length > LIMITE_CORPO) {
        excedeu = true;
        corpo = "";
      }
    });
    // Só responde depois de ler tudo: destruir a conexão no meio faria o
    // Nginx devolver 502 em vez do 413.
    req.on("end", () =>
      excedeu
        ? reject(Object.assign(new Error(`corpo acima de ${LIMITE_CORPO / 1024} KB`), { status: 413 }))
        : resolve(corpo)
    );
    req.on("error", reject);
  });
}

// Valida e normaliza o JSON recebido. Retorna { erro } ou { aluno }.
function validarAluno(dados) {
  const nome = String(dados.nome ?? "").trim();
  const ra = String(dados.ra ?? "").trim();
  const curso = String(dados.curso ?? "").trim() || CURSO_PADRAO;
  const periodoBruto = dados.periodo ?? 1;
  const periodo = Number(periodoBruto);

  if (!nome || !ra) return { erro: "nome e ra são obrigatórios" };
  if (nome.length > 120 || ra.length > 20 || curso.length > 60) {
    return { erro: "nome (120), ra (20) ou curso (60) acima do tamanho máximo" };
  }
  if (!Number.isInteger(periodo) || periodo < 1 || periodo > 10) {
    return { erro: "periodo deve ser um inteiro de 1 a 10" };
  }
  return { aluno: { nome, ra, curso, periodo } };
}

async function cadastrarAluno(req, res) {
  let dados;
  try {
    // Remove o BOM UTF-8 que o PowerShell 5.1 insere ao enviar o corpo por pipe
    const corpo = (await lerCorpo(req)).replace(/^\uFEFF/, "");
    // Bytes que não são UTF-8 válido viram U+FFFD na decodificação. Rejeitar
    // aqui evita gravar "Informa??o" no banco (ex.: PowerShell 5.1 enviando Latin-1).
    if (corpo.includes("\uFFFD")) {
      return enviarJson(res, 400, { erro: "corpo não está em UTF-8 válido (envie com charset=utf-8)" });
    }
    dados = JSON.parse(corpo || "{}");
  } catch (erro) {
    return enviarJson(res, erro.status || 400, { erro: erro.status ? erro.message : "JSON inválido" });
  }

  const { erro, aluno } = validarAluno(dados);
  if (erro) return enviarJson(res, 400, { erro });

  try {
    const resultado = await pool.query(
      `INSERT INTO alunos (nome, ra, curso, periodo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, ra, curso, periodo`,
      [aluno.nome, aluno.ra, aluno.curso, aluno.periodo]
    );
    return enviarJson(res, 201, resultado.rows[0]);
  } catch (erroBanco) {
    // 23505 = unique_violation: o RA já existe
    if (erroBanco.code === "23505") return enviarJson(res, 409, { erro: `RA ${aluno.ra} já cadastrado` });
    throw erroBanco;
  }
}

async function tratarRequisicao(req, res) {
  const rota = `${req.method} ${req.url.split("?")[0]}`;

  switch (rota) {
    case "GET /status":
      return enviarJson(res, 200, { servico: "backend-lab14", status: "ok", autor: "Bruno Silveira" });

    case "GET /alunos": {
      const resultado = await pool.query(
        "SELECT id, nome, ra, curso, periodo FROM alunos ORDER BY curso, periodo DESC, nome"
      );
      return enviarJson(res, 200, resultado.rows);
    }

    case "GET /resumo": {
      const resultado = await pool.query(
        "SELECT curso, periodo, total_alunos::int AS total FROM vw_resumo_turmas"
      );
      return enviarJson(res, 200, resultado.rows);
    }

    case "POST /alunos":
      return cadastrarAluno(req, res);

    default:
      return enviarJson(res, 404, { erro: "rota não encontrada", rota });
  }
}

const servidor = http.createServer((req, res) => {
  tratarRequisicao(req, res).catch((erro) => {
    console.error(erro);
    if (!res.headersSent) enviarJson(res, 500, { erro: "erro interno" });
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
