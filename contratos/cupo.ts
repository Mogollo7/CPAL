import { z } from "zod";

const DIA_MS = 86_400_000;

export const consultaCupoSchema = z
  .object({
    servicioId: z.string().min(1),
    psicologoId: z.string().optional(),
    desde: z.iso.datetime({ offset: true }),
    hasta: z.iso.datetime({ offset: true }),
  })
  .refine((c) => Date.parse(c.hasta) > Date.parse(c.desde), {
    path: ["hasta"],
    message: "hasta debe ser posterior a desde",
  })
  .refine((c) => Date.parse(c.hasta) - Date.parse(c.desde) <= 14 * DIA_MS, {
    path: ["hasta"],
    message: "Máximo 14 días",
  });
export type ConsultaCupo = z.infer<typeof consultaCupoSchema>;

export const cupoSchema = z.object({
  inicio: z.string(),
  fin: z.string(),
  psicologoIds: z.array(z.string()),
});
export type Cupo = z.infer<typeof cupoSchema>;

// Respuesta de `listarPsicologosDeServicio` (solo activos y con horario).
export const psicologoDeServicioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  fotoUrl: z.string().nullable(),
  presentacion: z.string(),
});
export type PsicologoDeServicio = z.infer<typeof psicologoDeServicioSchema>;
