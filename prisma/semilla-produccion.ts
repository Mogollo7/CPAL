// Semilla de PRODUCCIÓN (T-602): solo configuración inicial y servicios. NO crea usuarios (el primer admin va por otro comando).
// Idempotente: `update: {}` en todo, así que repetirla no duplica ni pisa lo que el CAPL edite desde el panel.
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import servicios from "../contenido/servicios-produccion.json";
import { PrismaClient } from "../servidor/generado/client";

const servicioSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string().min(3),
  descripcion: z.string().min(1),
  area: z.enum(["PSICOLOGIA", "NEUROPSICOLOGIA"]),
  duracionMin: z.number().int().positive(),
  agendableEnLinea: z.boolean(),
  porConfirmar: z.boolean().optional(), // solo informativo; no se guarda
});

export type BdSemilla = Pick<PrismaClient, "configuracion" | "servicio">;

export async function sembrarProduccion(
  bd: BdSemilla,
  env: Record<string, string | undefined> = process.env,
) {
  const lista = z.array(servicioSchema).parse(servicios.servicios);
  // SUPUESTO(P-17): el buzón de avisos es el correo propio del CAPL (E03 §1 no da valor por defecto).
  const correoAdministracion = (
    env.CORREO_ADMINISTRACION || "capl@unilasallista.edu.co"
  )
    .trim()
    .toLowerCase();
  // SUPUESTO(P-02): dominio institucional de los psicólogos; vacío significaría "cualquiera", que en producción no se permite.
  const dominiosPermitidos = (env.DOMINIOS_PERMITIDOS || "unilasallista.edu.co")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  // Los demás valores son los por defecto del esquema = E03 §1.
  await bd.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, correoAdministracion, dominiosPermitidos },
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `porConfirmar` no se guarda
  for (const [orden, { porConfirmar: _, ...s }] of lista.entries())
    await bd.servicio.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, orden },
    });
  return { servicios: lista.length };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
  const bd = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const r = await sembrarProduccion(bd);
    console.log(`Configuración y ${r.servicios} servicios listos.`);
  } finally {
    await bd.$disconnect();
  }
}

if (process.argv[1]?.endsWith("semilla-produccion.ts")) {
  try {
    process.loadEnvFile();
  } catch {}
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
