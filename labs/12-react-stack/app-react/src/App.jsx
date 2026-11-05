import { useState } from "react";

// import.meta.env.MODE vem do Vite: "development" no container de dev
// (npm run dev) e "production" no build servido pelo Nginx.
const MODO = import.meta.env.MODE;
const EM_DEV = import.meta.env.DEV;

export default function App() {
  const [contador, setContador] = useState(0);

  return (
    <main className="container">
      <p className="selo">Prática 12 · Unifeg 2026B</p>
      <h1>React dentro de um container</h1>
      <p className="autor">Bruno Silveira</p>

      <p className={`modo ${EM_DEV ? "dev" : "prod"}`}>
        Modo atual: <strong>{MODO}</strong>
        {EM_DEV ? " · Vite com hot reload (porta 5173)" : " · build estático servido pelo Nginx (porta 8090)"}
      </p>

      {EM_DEV ? (
        <p>
          Edite <code>app-react/src/App.jsx</code> no host com o container rodando. O bind mount leva a
          mudança para dentro do container, o Vite recompila e a página atualiza sozinha, sem rebuild de imagem.
          O contador abaixo <em>mantém o valor</em> durante o hot reload.
        </p>
      ) : (
        <p>
          Esta é a versão de produção: só HTML, JS e CSS minificados. A imagem final não tem Node, npm, Vite nem
          código-fonte.
        </p>
      )}

      <button type="button" onClick={() => setContador((c) => c + 1)}>
        Cliques: {contador}
      </button>
    </main>
  );
}
