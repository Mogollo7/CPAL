import { z } from "zod";

export const ESTADOS_CITA = [
  "PENDIENTE",
  "AUTORIZADA",
  "RECHAZADA",
  "VENCIDA",
  "CANCELADA",
  "ATENDIDA",
  "NO_ASISTIO",
] as const;
export const PARA_QUIEN = ["PROPIA", "OTRA_PERSONA", "MENOR"] as const;
export type EstadoCita = (typeof ESTADOS_CITA)[number];

const texto = (min: number, max: number) => z.string().trim().min(min).max(max);
const documento = z.string().regex(/^[A-Za-z0-9]{5,15}$/);

// Los obligatorios definitivos dependen de la pregunta 8 del cuestionario: cambiar uno = editar aquí.
export const citaSchema = z
  .object({
    servicioId: z.string().min(1),
    psicologoId: z.string().optional(), // vacío = cualquiera disponible
    inicio: z.iso.datetime({ offset: true }),
    paraQuien: z.enum(PARA_QUIEN),
    solicitanteNombre: texto(3, 80),
    solicitanteCorreo: z.email().transform((c) => c.trim().toLowerCase()),
    // 7–15 dígitos; admite "+" y espacios
    solicitanteTelefono: z
      .string()
      .regex(/^\+?[\d ]+$/)
      .refine((t) => {
        const n = t.replace(/\D/g, "").length;
        return n >= 7 && n <= 15;
      }, "7–15 dígitos"),
    pacienteNombre: texto(1, 80).optional(),
    pacienteDocumento: documento.optional(),
    pacienteEdad: z.number().int().min(0).max(120).optional(),
    acudienteNombre: texto(1, 80).optional(),
    acudienteDocumento: documento.optional(),
    motivo: z.string().max(300).optional(),
    aceptaTratamiento: z.literal(true),
    sitioWeb: z.string().max(0), // campo trampa: debe llegar vacío
  })
  .superRefine((c, ctx) => {
    const falta = (campo: string, msg: string) =>
      ctx.addIssue({ code: "custom", path: [campo], message: msg });
    if (c.paraQuien !== "PROPIA" && !c.pacienteNombre)
      falta("pacienteNombre", "Obligatorio");
    if (c.paraQuien === "MENOR") {
      if (!c.acudienteNombre) falta("acudienteNombre", "Obligatorio");
      if (!c.acudienteDocumento) falta("acudienteDocumento", "Obligatorio");
    }
    if (
      c.pacienteEdad !== undefined &&
      c.pacienteEdad < 18 &&
      c.paraQuien !== "MENOR"
    )
      falta("paraQuien", "Si es menor de 18 debe ser MENOR");
  });

export type CitaEntrada = z.infer<typeof citaSchema>;

export const citaCreadaSchema = z.object({
  codigo: z.string(),
  estado: z.enum(ESTADOS_CITA),
  inicio: z.string(),
  enlaceGestion: z.string(),
});
export type CitaCreada = z.infer<typeof citaCreadaSchema>;

// Lo que ve quien abre el enlace: nunca documento, teléfono ni motivo.
export const citaPublicaSchema = z.object({
  codigo: z.string(),
  estado: z.enum(ESTADOS_CITA),
  servicio: z.string(),
  servicioId: z.string(), // para pedir cupos al reprogramar
  psicologoNombre: z.string(),
  inicio: z.string(),
  fin: z.string(),
  lugar: z.string(),
  puedeCancelar: z.boolean(),
  puedeReprogramar: z.boolean(),
});
export type CitaPublica = z.infer<typeof citaPublicaSchema>;

export const ESTADOS_ACTIVOS = ["PENDIENTE", "AUTORIZADA"] as const; // los que ocupan cupo
export const ESTADOS_FINALES = [
  "RECHAZADA",
  "VENCIDA",
  "CANCELADA",
  "ATENDIDA",
  "NO_ASISTIO",
] as const;

// Operaciones de administración (E05): motivo obligatorio al rechazar y al cancelar.
export const motivoAdminSchema = z.object({
  id: z.string().min(1),
  motivo: texto(3, 300),
});
export const reasignarSchema = z.object({
  id: z.string().min(1),
  psicologoId: z.string().min(1),
  inicio: z.iso.datetime({ offset: true }),
});
export const asistenciaSchema = z.object({
  id: z.string().min(1),
  resultado: z.enum(["ATENDIDA", "NO_ASISTIO"]),
});
export const reprogramarSchema = z.object({
  token: z.string().min(1),
  inicio: z.iso.datetime({ offset: true }),
  psicologoId: z.string().optional(), // vacío = cualquiera disponible
});

// Fila de la bandeja. Incluye contacto (la ve administración y el psicólogo dueño) pero NUNCA el motivo de consulta.
export type CitaLista = {
  id: string;
  codigo: string;
  estado: EstadoCita;
  inicio: string;
  fin: string;
  servicio: string;
  psicologoId: string;
  psicologoNombre: string;
  paraQuien: (typeof PARA_QUIEN)[number];
  solicitanteNombre: string | null;
  solicitanteCorreo: string | null;
  solicitanteTelefono: string | null;
  pacienteNombre: string | null;
  pacienteDocumento: string | null;
  venceEn: string | null;
  creadaEn: string;
};
export type PaginaCitas = {
  citas: CitaLista[];
  total: number;
  pagina: number;
  porPagina: number;
};
// Detalle de administración: todo lo de la fila + motivo ya descifrado + historial y correos de la cita.
export type CitaDetalle = CitaLista & {
  pacienteEdad: number | null;
  acudienteNombre: string | null;
  acudienteDocumento: string | null;
  motivo: string | null;
  motivoRechazo: string | null;
  reprogramaciones: number;
  reprogramadaDeId: string | null;
  consentimientoEn: string;
  consentimientoVersion: string;
  historial: { accion: string; usuarioId: string | null; creadaEn: string }[];
  correos: { llave: string; estado: string; entregado: boolean | null }[];
};
