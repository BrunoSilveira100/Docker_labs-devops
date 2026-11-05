import { useEffect, useState } from "react";

// Todas as chamadas usam caminho relativo (/api/...): o browser fala só com o
// Nginx do frontend, que faz proxy para o backend pela rede interna do Compose.
const API = "/api";
const CURSOS = ["Ciência da Computação", "Sistemas de Informação", "Engenharia de Software"];
const FORM_VAZIO = { nome: "", ra: "", curso: CURSOS[0], periodo: 8 };

async function pedirJson(caminho, opcoes) {
  const resposta = await fetch(`${API}${caminho}`, opcoes);
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro || `HTTP ${resposta.status}`);
  return corpo;
}

export default function App() {
  const [alunos, setAlunos] = useState(null);
  const [resumo, setResumo] = useState([]);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);

  async function carregar() {
    try {
      const [lista, totais] = await Promise.all([pedirJson("/alunos"), pedirJson("/resumo")]);
      setAlunos(lista);
      setResumo(totais);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cadastrar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setAviso(null);
    try {
      const novo = await pedirJson("/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, periodo: Number(form.periodo) }),
      });
      setAviso(`${novo.nome} cadastrado(a) com o id ${novo.id}.`);
      setForm(FORM_VAZIO);
      await carregar();
    } catch (e) {
      setAviso(`Não foi possível cadastrar: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  }

  const atualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <main className="container">
      <header>
        <p className="selo">Prática 14 · Projeto Integrador · Unifeg 2026B</p>
        <h1>Cadastro de alunos</h1>
        <p className="autor">Bruno Silveira</p>
        <p className="pilha">
          <span>React + Nginx</span>→<span>API Node</span>→<span>PostgreSQL</span>
        </p>
      </header>

      <section>
        <h2>Novo aluno</h2>
        <form className="cadastro" onSubmit={cadastrar}>
          <label>
            Nome
            <input value={form.nome} onChange={atualizar("nome")} maxLength={120} required />
          </label>
          <label>
            RA
            <input value={form.ra} onChange={atualizar("ra")} maxLength={20} required />
          </label>
          <label>
            Curso
            <select value={form.curso} onChange={atualizar("curso")}>
              {CURSOS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Período
            <input type="number" min="1" max="10" value={form.periodo} onChange={atualizar("periodo")} />
          </label>
          <button type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
        {aviso && <p className="aviso" role="status">{aviso}</p>}
      </section>

      {erro && <p className="erro">Erro ao consultar a API: {erro}</p>}
      {!erro && !alunos && <p>Carregando alunos...</p>}

      {resumo.length > 0 && (
        <section>
          <h2>Resumo por turma</h2>
          <ul className="resumo">
            {resumo.map((r) => (
              <li key={`${r.curso}-${r.periodo}`}>
                <strong>{r.total}</strong> {r.curso} · {r.periodo}º período
              </li>
            ))}
          </ul>
        </section>
      )}

      {alunos && (
        <section>
          <h2>Alunos cadastrados ({alunos.length})</h2>
          <table>
            <thead>
              <tr><th>RA</th><th>Nome</th><th>Curso</th><th>Período</th></tr>
            </thead>
            <tbody>
              {alunos.map((a) => (
                <tr key={a.id}>
                  <td>{a.ra}</td>
                  <td>{a.nome}</td>
                  <td>{a.curso}</td>
                  <td>{a.periodo}º</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
