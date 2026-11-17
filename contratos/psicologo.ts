import { z } from "zod";
import { bloqueoGuardadoSchema } from "./bloqueo";
import { horarioSchema } from "./horario";

export const areaSchema = z.enum(["PSICOLOGIA", "NEUROPSICOLOGIA"]);
export type Area = z.infer<typeof areaSchema>;

const nombre = z.string().trim().min(3).max(80);
const correo = z.string().trim().toLowerCase().max(120).pipe(z.email());

// Crear psicólogo (RF-ADM-01). El dominio del correo se comprueba en el servidor contra `dominiosPermitidos`.
export const crearPsicologoSchema = z.object({
  nombre,
  correo,
  area: areaSchema,
});
export type CrearPsicologo = z.infer<typeof crearPsicologoSchema>;

export const crearAdministradorSchema = z.object({ nombre, correo });
export type CrearAdministrador = z.infer<typeof crearAdministradorSchema>;

export const actualizarPsicologoSchema = z.object({
  id: z.string().min(1),
  nombre,
  area: areaSchema,
});
export type ActualizarPsicologo = z.infer<typeof actualizarPsicologoSchema>;

export const cambiarActivoSchema = z.object({
  id: z.string().min(1),
  activo: z.boolean(),
});
export type CambiarActivo = z.infer<typeof cambiarActivoSchema>;

// Perfil que edita el propio psicólogo (RF-PSI-01, RF-PSI-07).
export const perfilSchema = z.object({
  presentacion: z.string().trim().max(600),
  servicioIds: z.array(z.string().min(1)).max(50),
  visible: z.boolean(),
});
export type PerfilEntrada = z.infer<typeof perfilSchema>;

// "invitado" = aún no crea su contraseña (E03).
export const ESTADOS_PSICOLOGO = ["INVITADO", "ACTIVO", "INACTIVO"] as const;
export type EstadoPsicologo = (typeof ESTADOS_PSICOLOGO)[number];

export type UsuarioResumen = {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "PSICOLOGO";
  area: Area | null; // solo psicólogos
  estado: EstadoPsicologo;
  ultimoIngreso: string | null;
};

export type PsicologoDetalle = UsuarioResumen & {
  presentacion: string;
  visible: boolean;
  fotoUrl: string | null;
  servicioIds: string[];
};

export const perfilPropioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  area: areaSchema,
  presentacion: z.string(),
  visible: z.boolean(),
  fotoUrl: z.string().nullable(),
  servicioIds: z.array(z.string()),
  horario: horarioSchema,
  bloqueos: z.array(bloqueoGuardadoSchema),
});
export type PerfilPropio = z.infer<typeof perfilPropioSchema>;

/** Resultado de guardar el horario: `citasFueraDeHorario` son códigos de citas futuras que ya no caen en un bloque. */
export type HorarioGuardado = {
  horario: z.infer<typeof horarioSchema>;
  citasFueraDeHorario: string[];
};

// Foto (E03 §11): JPG, PNG o WebP, máx. 6 MB; sale siempre 400 × 400 WebP.
export const FOTO_MAX_BYTES = 6 * 1024 * 1024;
export const FOTO_LADO_PX = 400;
