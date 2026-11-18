import { z } from "zod";

// Ausencia de un psicólogo o bloqueo de todo el centro. Si `psicologoId` llega vacío = todo el centro;
// en las operaciones del psicólogo el servidor lo ignora y usa el de la sesión.
export const bloqueoSchema = z
  .object({
    desde: z.iso.datetime({ offset: true }),
    hasta: z.iso.datetime({ offset: true }),
    motivo: z.string().trim().max(200).optional(),
    psicologoId: z.string().optional(), // vacío = todo el centro
  })
  .refine((b) => Date.parse(b.hasta) > Date.parse(b.desde), {
    path: ["hasta"],
    message: "hasta debe ser posterior a desde",
  });
export type Bloqueo = z.infer<typeof bloqueoSchema>;

export const bloqueoGuardadoSchema = z.object({
  id: z.string(),
  desde: z.string(),
  hasta: z.string(),
  motivo: z.string().nullable(),
  psicologoId: z.string().nullable(),
});
export type BloqueoGuardado = z.infer<typeof bloqueoGuardadoSchema>;

export const festivoSchema = z.object({
  fecha: z.string(), // "2026-11-16", fecha de Bogotá
  nombre: z.string(),
});
export type Festivo = z.infer<typeof festivoSchema>;
