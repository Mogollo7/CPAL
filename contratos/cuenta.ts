import { z } from "zod";

export const ingresoSchema = z.object({
  correo: z.string().trim().toLowerCase().max(120).pipe(z.email()),
  clave: z.string().min(1).max(200),
});
export type Ingreso = z.infer<typeof ingresoSchema>;

// Contraseña: mínimo 10 caracteres, sin reglas de composición (S01). Distinta del correo y lista de comunes: T-203.
export const crearClaveSchema = z
  .object({
    token: z.string().min(1),
    clave: z.string().min(10, "Mínimo 10 caracteres").max(200),
    confirmacion: z.string(),
  })
  .refine((c) => c.clave === c.confirmacion, {
    path: ["confirmacion"],
    message: "Las contraseñas no coinciden",
  });
export type CrearClave = z.infer<typeof crearClaveSchema>;

export const solicitarEnlaceSchema = z.object({
  correo: z.string().trim().toLowerCase().max(120).pipe(z.email()),
});

export const cambiarClaveSchema = z.object({
  claveActual: z.string().min(1).max(200),
  claveNueva: z.string().min(10, "Mínimo 10 caracteres").max(200),
});

export const codigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código tiene 6 dígitos"),
  recordarDispositivo: z.boolean().default(false),
});

export const confirmarClaveSchema = z.object({
  clave: z.string().min(1).max(200),
});
