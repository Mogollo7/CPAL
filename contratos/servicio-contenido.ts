import { z } from "zod";

// Forma de contenido/servicios.json (T-104). Es el texto público de /servicios; la tabla `Servicio` de la BD
// (duración, activo, psicólogos) la gestiona el panel y se enlaza por `slug`.
export const servicioContenidoSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string(),
  descripcion: z.string(), // viñeta de 1–2 frases
  paraQuien: z.string(),
  area: z.enum(["PSICOLOGIA", "NEUROPSICOLOGIA"]),
  agendableEnLinea: z.boolean(), // false → el botón lleva a contacto
  orden: z.number().int(),
  porConfirmar: z.boolean().optional(), // true = texto o dato sin validar por el CAPL (P-05)
});

export const serviciosSchema = z.object({
  ultimaRevision: z.iso.date(),
  aprobadoPor: z.string(),
  porConfirmar: z.boolean().optional(),
  servicios: z
    .array(servicioContenidoSchema)
    .refine((s) => new Set(s.map((x) => x.slug)).size === s.length, {
      message: "slug repetido",
    }),
});
export type Servicios = z.infer<typeof serviciosSchema>;
