import { z } from "zod";
import { areaSchema } from "./psicologo";

export const servicioSchema = z.object({
  id: z.string().min(1).optional(), // vacío = crear
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")
    .max(60)
    .optional(), // vacío al crear = se genera del nombre
  nombre: z.string().trim().min(3).max(80),
  descripcion: z.string().trim().min(1).max(600),
  duracionMin: z.number().int().min(15).max(240), // P-09: 60 por defecto
  area: areaSchema,
  agendableEnLinea: z.boolean(),
  activo: z.boolean(),
  orden: z.number().int().min(0).max(999).default(0),
});
export type ServicioEntrada = z.infer<typeof servicioSchema>;

export type ServicioGuardado = Omit<ServicioEntrada, "id" | "slug"> & {
  id: string;
  slug: string;
};
