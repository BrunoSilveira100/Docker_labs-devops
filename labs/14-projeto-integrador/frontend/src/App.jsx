import { useEffect, useState } from "react";

export default function App() {
  const [alunos, setAlunos] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch("/api/alunos")
      .then((r) => r.json())
      .then(setAlunos)
      .catch((e) => setErro(String(e)));
  }, []);

  return (
    <main className="container">
      <h1>Projeto Integrador — Unifeg</h1>
      <p>React (Nginx) → API (Node/Express-like) → PostgreSQL, tudo em containers.</p>

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
