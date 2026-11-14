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
  psicologoNombre: z.string(),
  inicio: z.string(),
  fin: z.string(),
  lugar: z.string(),
  puedeCancelar: z.boolean(),
  puedeReprogramar: z.boolean(),
});
export type CitaPublica = z.infer<typeof citaPublicaSchema>;

export const filtrosCitaSchema = z.object({
  estado: z.enum(ESTADOS_CITA).optional(),
  desde: z.iso.datetime({ offset: true }).optional(),
  hasta: z.iso.datetime({ offset: true }).optional(),
  psicologoId: z.string().optional(),
  servicioId: z.string().optional(),
  busqueda: z.string().max(80).optional(),
  pagina: z.number().int().min(1).default(1),
});
export type FiltrosCita = z.infer<typeof filtrosCitaSchema>;
