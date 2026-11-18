import { z } from "zod";

// Valores de E03 §1, cada uno con mínimo y máximo. Cambiar uno cambia el comportamiento sin desplegar.
const dominio = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/,
    "Dominio no válido, ej.: unilasallista.edu.co",
  );

export const configuracionSchema = z.object({
  autoAutorizar: z.boolean(),
  anticipacionMinHoras: z.number().int().min(0).max(168),
  anticipacionMaxDias: z.number().int().min(1).max(180),
  cancelacionMinHoras: z.number().int().min(0).max(168),
  maxCitasActivas: z.number().int().min(1).max(10),
  maxReprogramaciones: z.number().int().min(0).max(10),
  vencimientoPendienteHoras: z.number().int().min(1).max(336),
  duracionEnlaceHoras: z.number().int().min(24).max(48), // P-06: 24–48 h
  conservacionMeses: z.number().int().min(1).max(60),
  dominiosPermitidos: z.array(dominio).max(20), // vacío = cualquiera (solo en pruebas)
  correoAdministracion: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .pipe(z.email()),
});
export type Configuracion = z.infer<typeof configuracionSchema>;

// Se envía solo lo que cambia; no admite claves desconocidas.
export const cambioConfiguracionSchema = configuracionSchema
  .partial()
  .strict()
  .refine((c) => Object.keys(c).length > 0, "No hay nada que cambiar");
export type CambioConfiguracion = z.infer<typeof cambioConfiguracionSchema>;
