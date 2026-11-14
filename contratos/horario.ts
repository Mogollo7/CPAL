import { z } from "zod";

export const bloqueHorarioSchema = z
  .object({
    diaSemana: z.number().int().min(1).max(7), // 1 = lunes … 7 = domingo
    inicioMin: z.number().int().min(0).max(1440), // minutos desde medianoche, hora de Bogotá
    finMin: z.number().int().min(0).max(1440),
  })
  .refine((b) => b.finMin > b.inicioMin, {
    path: ["finMin"],
    message: "El fin debe ser posterior al inicio",
  });

// Reemplaza el horario completo. Sin cruces dentro del mismo día.
export const horarioSchema = z
  .object({ bloques: z.array(bloqueHorarioSchema) })
  .superRefine(({ bloques }, ctx) => {
    const orden = [...bloques].sort(
      (a, b) => a.diaSemana - b.diaSemana || a.inicioMin - b.inicioMin,
    );
    orden.forEach((b, i) => {
      const ant = orden[i - 1];
      if (ant && ant.diaSemana === b.diaSemana && b.inicioMin < ant.finMin)
        ctx.addIssue({
          code: "custom",
          path: ["bloques"],
          message: "Hay bloques cruzados el mismo día",
        });
    });
  });
export type Horario = z.infer<typeof horarioSchema>;

export const bloqueoSchema = z
  .object({
    desde: z.iso.datetime({ offset: true }),
    hasta: z.iso.datetime({ offset: true }),
    motivo: z.string().max(200).optional(),
    psicologoId: z.string().optional(), // vacío = todo el centro
  })
  .refine((b) => Date.parse(b.hasta) > Date.parse(b.desde), {
    path: ["hasta"],
    message: "hasta debe ser posterior a desde",
  });
export type Bloqueo = z.infer<typeof bloqueoSchema>;
