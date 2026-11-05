// Configuração do Vite para rodar DENTRO de um container (Lab 12, Bruno Silveira)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // escuta em 0.0.0.0: sem isso a porta publicada não responde
    port: 5173,
    strictPort: true,    // falha em vez de trocar de porta silenciosamente
    watch: {
      usePolling: true,  // bind mount no Windows/WSL2 não propaga eventos inotify
      interval: 300,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,    // não publica o código-fonte original em produção
  },
});
