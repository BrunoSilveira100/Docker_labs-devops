import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // aceita conexões de fora do container
    port: 5173,
    watch: {
      usePolling: true, // necessário em bind mounts no Windows/WSL2
    },
  },
});
