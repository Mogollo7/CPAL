import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(); // Node 24: lee .env si existe (en CI/producción las variables ya vienen del entorno)
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/semilla.ts" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
