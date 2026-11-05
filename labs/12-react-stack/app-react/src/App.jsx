import { useState } from "react";

export default function App() {
  const [contador, setContador] = useState(0);

  return (
    <main className="container">
      <h1>Unifeg — React dentro de um container</h1>
      <p className="autor">Lab 12 · Bruno Silveira</p>
      <p>
        Edite este arquivo (<code>src/App.jsx</code>) com o container rodando
        e observe o hot reload acontecer sem rebuild da imagem.
      </p>
      <button onClick={() => setContador((c) => c + 1)}>
        Cliques: {contador}
      </button>
    </main>
  );
}
