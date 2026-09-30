const http = require("http");
const fs = require("fs");

const PORTA = process.env.PORTA || 6000;
const ARQUIVO_SENHA = process.env.DB_PASSWORD_FILE;

function lerSegredo() {
  if (!ARQUIVO_SENHA) return null;
  try {
    return fs.readFileSync(ARQUIVO_SENHA, "utf8").trim();
  } catch {
    return null;
  }
}

const servidor = http.createServer((req, res) => {
  if (req.url === "/saude") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const segredo = lerSegredo();
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(
    JSON.stringify({
      servico: "app-lab13",
      usuarioLinux: process.getuid ? process.getuid() : "indisponivel",
      segredoCarregadoViaSecretFile: segredo ? "sim" : "nao",
      // NUNCA imprima o segredo em produção — aqui é só para fins didáticos
      // e o valor completo não é exposto na resposta.
      segredoTamanho: segredo ? segredo.length : 0,
    })
  );
});

servidor.listen(PORTA, () => console.log(`app-lab13 ouvindo na porta ${PORTA}`));
