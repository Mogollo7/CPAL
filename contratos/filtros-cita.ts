import { z } from "zod";
import { ESTADOS_CITA } from "./cita";

export const POR_PAGINA = 25;

// Filtros de la bandeja de citas (administración y "mis citas" del psicólogo). `desde`/`hasta` filtran por `inicio`.
export const filtrosCitaSchema = z.object({
  estado: z.enum(ESTADOS_CITA).optional(),
  desde: z.iso.datetime({ offset: true }).optional(),
  hasta: z.iso.datetime({ offset: true }).optional(),
  psicologoId: z.string().optional(),
  servicioId: z.string().optional(),
  busqueda: z.string().trim().max(80).optional(), // código, nombre, correo o documento
  pagina: z.number().int().min(1).default(1),
});
export type FiltrosCita = z.infer<typeof filtrosCitaSchema>;
