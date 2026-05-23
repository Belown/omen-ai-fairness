import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/DIET/",
  server: {
    port: 5173,
    open: false,
  },
});
