import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generado/client";

// Una sola instancia por proceso (en desarrollo, Next recarga módulos: se guarda en globalThis).
const g = globalThis as unknown as { __bd?: PrismaClient };

export const bd =
  g.__bd ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") g.__bd = bd;
