// Utilidades compartidas por las operaciones de psicólogos, centro y eventos.
import type { z } from "zod";
import { fallo, ok, type Resultado } from "../../contratos/resultado";

/** Valida la entrada con su esquema de `contratos/`; el error trae el mensaje de cada campo. */
export function validar<S extends z.ZodType>(
  esquema: S,
  entrada: unknown,
): Resultado<z.output<S>> {
  const r = esquema.safeParse(entrada);
  if (r.success) return ok(r.data);
  const campos: Record<string, string> = {};
  for (const i of r.error.issues) campos[i.path.join(".") || "_"] ??= i.message;
  return fallo("VALIDACION", "Revisa los datos marcados.", campos);
}

/** Texto → slug de URL: "Taller de estrés" → "taller-de-estres". */
export const slugificar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "sin-titulo";

/** ¿Es el error de restricción única de Prisma (P2002)? */
export const esDuplicado = (e: unknown) =>
  typeof e === "object" &&
  e !== null &&
  (e as { code?: string }).code === "P2002";
