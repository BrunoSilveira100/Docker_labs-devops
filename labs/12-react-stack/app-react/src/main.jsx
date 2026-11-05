// Ponto de entrada do app React do Lab 12 (Bruno Silveira).
// StrictMode roda efeitos duas vezes em DEV para expor bugs; no build de produção, não.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
