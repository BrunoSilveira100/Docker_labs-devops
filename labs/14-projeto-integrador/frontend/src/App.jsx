import { useEffect, useState } from "react";

// Todas as chamadas usam caminho relativo (/api/...): o browser fala só com o
// Nginx do frontend, que faz proxy para o backend pela rede interna do Compose.
const API = "/api";

export default function App() {
  const [alunos, setAlunos] = useState(null);
  const [erro, setErro] = useState(null);
  const [form, setForm] = useState({ nome: "", ra: "", periodo: 8 });
  const [enviando, setEnviando] = useState(false);

  function carregarAlunos() {
    fetch(`${API}/alunos`)
      .then((r) => r.json())
      .then((dados) => {
        setAlunos(dados);
        setErro(null);
      })
      .catch((e) => setErro(String(e)));
  }

  useEffect(carregarAlunos, []);

  async function cadastrar(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      const resposta = await fetch(`${API}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, periodo: Number(form.periodo) }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro || `HTTP ${resposta.status}`);
      setForm({ nome: "", ra: "", periodo: 8 });
      carregarAlunos();
    } catch (e) {
      setErro(String(e.message || e));
    } finally {
      setEnviando(false);
    }
  }

  const atualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <main className="container">
      <h1>Projeto Integrador — Unifeg</h1>
      <p>React (Nginx) → API (Node) → PostgreSQL, tudo em containers.</p>
      <p className="autor">Desenvolvido por Bruno Silveira · Avaliação P2 · 2026B</p>

      <form className="cadastro" onSubmit={cadastrar}>
        <input placeholder="Nome" value={form.nome} onChange={atualizar("nome")} required />
        <input placeholder="RA" value={form.ra} onChange={atualizar("ra")} required />
        <input
          type="number"
          min="1"
          max="10"
          aria-label="Período"
          value={form.periodo}
          onChange={atualizar("periodo")}
        />
        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Cadastrar"}
        </button>
      </form>

      {erro && <p style={{ color: "salmon" }}>Erro ao consultar a API: {erro}</p>}
      {!erro && !alunos && <p>Carregando alunos...</p>}

      {alunos && (
        <table>
          <thead>
            <tr><th>RA</th><th>Nome</th><th>Período</th></tr>
          </thead>
          <tbody>
            {alunos.map((a) => (
              <tr key={a.id}>
                <td>{a.ra}</td>
                <td>{a.nome}</td>
                <td>{a.periodo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
