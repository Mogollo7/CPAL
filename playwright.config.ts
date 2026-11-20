import { defineConfig } from "@playwright/test";

// Pruebas de extremo a extremo contra un sitio ya levantado (por defecto el de este equipo en :3000).
// Uso: `npm run pruebas:e2e` · otro destino: `E2E_URL=http://localhost:3100 npm run pruebas:e2e`.
// Usa el Chrome instalado (sin descargar navegadores); en CI: `E2E_CANAL=chromium` tras `npx playwright install chromium`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_URL ?? "http://localhost:3000",
    channel: process.env.E2E_CANAL ?? "chrome",
    trace: "retain-on-failure",
  },
});
