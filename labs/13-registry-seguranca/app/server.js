// app-lab13 — demonstra segredo via arquivo, usuário não-root e healthcheck
// Autor: Bruno Silveira · Unifeg 2026B
const http = require("http");
const fs = require("fs");
const os = require("os");

const PORTA = Number(process.env.PORTA) || 6000;

// Convenção "_FILE": a variável traz o CAMINHO do segredo, nunca o valor.
// O Compose monta o secret em /run/secrets/<nome> (tmpfs, fora da imagem).
const ARQUIVO_SENHA = process.env.DB_PASSWORD_FILE;

function lerSegredo() {
  if (!ARQUIVO_SENHA) return null;
  try {
    return fs.readFileSync(ARQUIVO_SENHA, "utf8").trim();
  } catch {
    return null;
  }
}

function json(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

const servidor = http.createServer((req, res) => {
  const caminho = req.url.split("?")[0];

  if (caminho === "/saude") {
    return json(res, 200, { status: "ok" });
  }

  if (caminho === "/") {
    const segredo = lerSegredo();
    return json(res, 200, {
      servico: "app-lab13",
      autor: "Bruno Silveira",
      container: os.hostname(),
      usuarioLinux: os.userInfo().username,
      uid: process.getuid ? process.getuid() : "indisponivel",
      rodandoComoRoot: process.getuid ? process.getuid() === 0 : null,
      segredoCarregadoViaSecretFile: segredo ? "sim" : "nao",
      caminhoDoSegredo: ARQUIVO_SENHA || null,
      // O valor do segredo NUNCA vai para a resposta nem para o log.
      // Só o tamanho aparece, para provar que o arquivo foi lido.
      segredoTamanho: segredo ? segredo.length : 0,
      limiteMemoriaMB: lerLimiteMemoria(),
    });
  }

  return json(res, 404, { erro: "rota não encontrada", rotas: ["/", "/saude"] });
});

// cgroup v2: o "deploy.resources.limits.memory" do compose aparece aqui
function lerLimiteMemoria() {
  try {
    const bruto = fs.readFileSync("/sys/fs/cgroup/memory.max", "utf8").trim();
    return bruto === "max" ? "sem limite" : Math.round(Number(bruto) / 1024 / 1024);
  } catch {
    return "indisponivel";
  }
}

servidor.listen(PORTA, () => console.log(`app-lab13 ouvindo na porta ${PORTA}`));
process.on("SIGTERM", () => servidor.close(() => process.exit(0)));
