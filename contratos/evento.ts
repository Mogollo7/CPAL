import { z } from "zod";

// Cartelera informativa: SIN inscripciones ni cupos (RF-EVE-03/04/05 descartados). `cupo` y `soloComunidad`
// siguen en el esquema de base de datos pero no entran en este contrato.
export const eventoSchema = z
  .object({
    titulo: z.string().trim().min(3).max(120),
    descripcion: z.string().trim().min(1).max(2000),
    inicio: z.iso.datetime({ offset: true }),
    fin: z.iso.datetime({ offset: true }).optional(),
    lugar: z.string().trim().min(1).max(160), // dirección o "Virtual"
    enlace: z
      .url({ protocol: /^https?$/ })
      .max(300)
      .optional(),
    publicado: z.boolean(),
  })
  .refine((e) => !e.fin || Date.parse(e.fin) > Date.parse(e.inicio), {
    path: ["fin"],
    message: "El fin debe ser posterior al inicio",
  });
export type EventoEntrada = z.infer<typeof eventoSchema>;

export type EventoDetalle = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  inicio: string;
  fin: string | null;
  lugar: string;
  enlace: string | null;
  imagenUrl: string | null;
  publicado: boolean;
};
