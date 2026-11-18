import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(); // Node 24: lee .env si existe (en CI/producción las variables ya vienen del entorno)
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/semilla.ts" },
  // Migraciones con capl_migrador (DATABASE_URL_MIGRADOR); la aplicación usa DATABASE_URL (capl_app). S03.
  datasource: {
    url: process.env.DATABASE_URL_MIGRADOR ?? process.env.DATABASE_URL ?? "",
  },
});
