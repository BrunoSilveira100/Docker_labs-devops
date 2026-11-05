// Vite do frontend do Lab 14 (Bruno Silveira).
// Em produção o build vai para dist/ e é servido pelo Nginx (veja o Dockerfile).
// O proxy abaixo só vale para "npm run dev" fora do Compose e imita o
// location /api/ do nginx.conf.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        rewrite: (caminho) => caminho.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
