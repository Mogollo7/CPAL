import { z } from "zod";

// Forma de contenido/emergencias.json (lo mantiene César, lo valida este esquema).
// No asume una lista fija de colores: cada entrada trae el suyo (cerebro/12). El texto final lo aprueba el CAPL.
const linea = z.object({
  nombre: z.string(),
  telefono: z.string().regex(/^[\d+ ]+$/), // se usa en tel:
  horario: z.string(),
  porConfirmar: z.boolean().optional(), // true = número u horario sin verificar llamando (cerebro/12)
});

export const codigoEmergenciaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color: z.string(), // confirmado por el CAPL; se muestra en una etiqueta pequeña
  situacion: z.string(), // 1–2 frases en lenguaje sencillo
  senales: z.array(z.string()).min(3).max(5),
  queHacer: z.array(z.string()).length(3),
  queNoHacer: z.array(z.string()).min(2).max(3),
  lineas: z.array(linea),
  porConfirmar: z.boolean().optional(), // true = texto o color sin aprobar por el CAPL
  nota: z.string().optional(), // solo para el equipo; no se muestra
});

export const emergenciasSchema = z.object({
  ultimaRevision: z.iso.date(),
  aprobadoPor: z.string(),
  porConfirmar: z.boolean().optional(), // true mientras el CAPL no apruebe el contenido (P-03, P-04)
  codigos: z.array(codigoEmergenciaSchema),
  directorio: z.array(linea),
});
export type Emergencias = z.infer<typeof emergenciasSchema>;
