import { z } from "zod";

// Línea telefónica de ayuda (misma forma y validaciones que contratos/emergencias.ts)
export const lineaOrientadorSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().regex(/^[\d+ ]+$/), // para enlace tel:
  horario: z.string().min(1),
  porConfirmar: z.boolean().optional(),
});
export type LineaOrientador = z.infer<typeof lineaOrientadorSchema>;

// Opción dentro de una pregunta del orientador
export const opcionOrientadorSchema = z
  .object({
    id: z.string().min(1),
    texto: z.string().min(1),
    descripcion: z.string().optional(),
    siguientePreguntaId: z.string().optional(),
    recomendacionId: z.string().optional(),
  })
  .refine(
    (op) =>
      (op.siguientePreguntaId !== undefined &&
        op.recomendacionId === undefined) ||
      (op.siguientePreguntaId === undefined &&
        op.recomendacionId !== undefined),
    {
      message:
        "Una opción debe apuntar exactamente a una siguiente pregunta o a una recomendación (mutuamente excluyentes)",
    },
  );
export type OpcionOrientador = z.infer<typeof opcionOrientadorSchema>;

// Pregunta del orientador
export const preguntaOrientadorSchema = z.object({
  id: z.string().min(1),
  enunciado: z.string().min(1),
  ayuda: z.string().optional(),
  opciones: z.array(opcionOrientadorSchema).min(2),
});
export type PreguntaOrientador = z.infer<typeof preguntaOrientadorSchema>;

// Recomendación final a la que llega cualquier camino
export const recomendacionOrientadorSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  situacion: z.string().min(1),
  queHacer: z.array(z.string().min(1)).min(1),
  queNoHacer: z.array(z.string().min(1)).optional(),
  codigoId: z.string().optional(), // Referencia a código en emergencias.json: "dorado", "fucsia", "blanco", "rosa"
  lineaPrincipal: lineaOrientadorSchema, // Línea 123 obligatoria en toda recomendación
  lineasSecundarias: z.array(lineaOrientadorSchema).default([]),
  sugiereAnclaje: z.boolean().optional(), // Si sugiere realizar el ejercicio 5-4-3-2-1
  enlaceAccion: z
    .object({
      texto: z.string().min(1),
      url: z.string().min(1),
    })
    .optional(),
  porConfirmar: z.boolean().optional(),
});
export type RecomendacionOrientador = z.infer<
  typeof recomendacionOrientadorSchema
>;

// Archivo completo contenido/orientador.json
export const orientadorSchema = z.object({
  ultimaRevision: z.iso.date(),
  aprobadoPor: z.string().min(1),
  porConfirmar: z.boolean().optional(),
  preguntaInicialId: z.string().min(1),
  lineaGlobal: lineaOrientadorSchema, // Línea 123 visible permanentemente en la cabecera
  preguntas: z.array(preguntaOrientadorSchema).min(1),
  recomendaciones: z.array(recomendacionOrientadorSchema).min(1),
});
export type OrientadorContenido = z.infer<typeof orientadorSchema>;

// Esquema para el ejercicio de anclaje 5-4-3-2-1 (contenido/anclaje.json)
export const pasoAnclajeSchema = z.object({
  numero: z.number().int().min(1).max(5),
  sentido: z.string().min(1),
  titulo: z.string().min(1),
  instruccion: z.string().min(1),
});
export type PasoAnclaje = z.infer<typeof pasoAnclajeSchema>;

export const anclajeSchema = z.object({
  ultimaRevision: z.iso.date(),
  aprobadoPor: z.string().min(1),
  porConfirmar: z.boolean().optional(),
  titulo: z.string().min(1),
  subtitulo: z.string().min(1),
  introduccion: z.string().min(1),
  respiracionInicial: z.object({
    titulo: z.string().min(1),
    instruccion: z.string().min(1),
  }),
  pasos: z.array(pasoAnclajeSchema).length(5),
  cierre: z.object({
    titulo: z.string().min(1),
    mensaje: z.string().min(1),
    lineaEmergencia: lineaOrientadorSchema,
    lineaSaludMental: lineaOrientadorSchema.optional(),
  }),
  guiaAcompanante: z
    .object({
      titulo: z.string().min(1),
      pautas: z.array(z.string().min(1)).min(2),
    })
    .optional(),
});
export type AnclajeContenido = z.infer<typeof anclajeSchema>;

// Tipos auxiliares para la navegación del orientador
export type PasoCamino = {
  preguntaId: string;
  preguntaTexto: string;
  opcionId: string;
  opcionTexto: string;
};

export type ResultadoOrientacion =
  | {
      estado: "EN_CURSO";
      preguntaActual: PreguntaOrientador;
      pasoActual: number;
      camino: PasoCamino[];
    }
  | {
      estado: "COMPLETADO";
      recomendacion: RecomendacionOrientador;
      linea123: LineaOrientador;
      camino: PasoCamino[];
    }
  | {
      estado: "ERROR";
      mensaje: string;
    };

export type CaminoCompleto = {
  pasos: { preguntaId: string; opcionId: string }[];
  recomendacionId: string;
  recomendacion: RecomendacionOrientador;
};
