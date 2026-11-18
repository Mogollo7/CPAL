import { z } from "zod";

// Enlace de apoyo opcional dentro de una respuesta de preguntas frecuentes
export const enlaceFaqSchema = z.object({
  texto: z.string().min(1),
  url: z.string().min(1),
});

// Pregunta frecuente individual (acordeón en /preguntas-frecuentes, RF-PUB-04)
export const preguntaFaqSchema = z.object({
  id: z.string().min(1),
  categoria: z.string().min(1),
  pregunta: z.string().min(3),
  respuesta: z.string().min(10),
  enlace: enlaceFaqSchema.optional(),
  porConfirmar: z.boolean().optional(),
});

// Archivo completo contenido/faq.json
export const faqSchema = z.object({
  ultimaRevision: z.iso.date(),
  aprobadoPor: z.string().min(1),
  porConfirmar: z.boolean().optional(),
  preguntas: z.array(preguntaFaqSchema).min(1),
});

export type EnlaceFaq = z.infer<typeof enlaceFaqSchema>;
export type PreguntaFaq = z.infer<typeof preguntaFaqSchema>;
export type Faq = z.infer<typeof faqSchema>;
