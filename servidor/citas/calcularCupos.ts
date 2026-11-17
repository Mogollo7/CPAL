// Cálculo de cupos (E03 §2). Función PURA: recibe todo y no consulta nada. La lectura de la BD está en `datos.ts`.
import type { Cupo } from "../../contratos/cupo";
import { desdeBogota, diaSemana, fechaBogota, inicioDelDia } from "../fechas";

const MIN_MS = 60_000;
const HORA_MS = 3_600_000;
const DIA_MS = 86_400_000;

export type PsicologoCupos = {
  id: string;
  activo: boolean;
  servicioIds: string[]; // servicios que atiende
  disponibilidad: { diaSemana: number; inicioMin: number; finMin: number }[];
};
export type DatosCupos = {
  bloqueos: { psicologoId: string | null; desde: Date; hasta: Date }[]; // null = todo el centro
  citas: {
    id?: string;
    psicologoId: string;
    inicio: Date;
    fin: Date;
    estado: string;
  }[];
  esFestivo: (fecha: string) => boolean; // "2026-11-24" (fecha de Bogotá)
  anticipacionMinHoras: number;
  anticipacionMaxDias: number;
  psicologoId?: string; // pedir uno concreto; vacío = "cualquiera"
  excluirCitaId?: string; // al reprogramar, la cita que se reemplaza no ocupa cupo
};

/** [a, b) y [c, d) se cruzan si se solapan; tocarse en el borde no es cruce. */
const cruza = (a: Date, b: Date, c: Date, d: Date) => a < d && c < b;

export function calcularCupos(
  servicio: { id: string; duracionMin: number },
  psicologos: PsicologoCupos[],
  desde: Date,
  hasta: Date,
  ahora: Date,
  datos: DatosCupos,
): Cupo[] {
  const minimo = ahora.getTime() + datos.anticipacionMinHoras * HORA_MS;
  const maximo = ahora.getTime() + datos.anticipacionMaxDias * DIA_MS;
  const duracionMs = servicio.duracionMin * MIN_MS;
  const activas = datos.citas.filter(
    (c) =>
      (c.estado === "PENDIENTE" || c.estado === "AUTORIZADA") &&
      !(datos.excluirCitaId && c.id === datos.excluirCitaId),
  );
  const elegibles = psicologos.filter(
    (p) =>
      p.activo &&
      p.servicioIds.includes(servicio.id) &&
      (!datos.psicologoId || p.id === datos.psicologoId),
  );

  const porInicio = new Map<number, Cupo>();
  // Días de Bogotá desde el de `desde` hasta el de `hasta`.
  let dia = inicioDelDia(desde);
  for (; dia < hasta; dia = new Date(dia.getTime() + DIA_MS)) {
    const fecha = fechaBogota(dia);
    if (datos.esFestivo(fecha)) continue;
    const dow = diaSemana(dia);
    for (const p of elegibles) {
      for (const b of p.disponibilidad.filter((x) => x.diaSemana === dow)) {
        // Tramos de duracionMin desde inicioMin; el que no cabe completo antes de finMin se descarta.
        for (
          let m = b.inicioMin;
          m + servicio.duracionMin <= b.finMin;
          m += servicio.duracionMin
        ) {
          const ini = desdeBogota(fecha, m);
          const fin = new Date(ini.getTime() + duracionMs);
          if (ini < desde || ini >= hasta) continue;
          if (ini.getTime() < minimo || ini.getTime() > maximo) continue;
          const bloqueado = datos.bloqueos.some(
            (x) =>
              (x.psicologoId === null || x.psicologoId === p.id) &&
              cruza(ini, fin, x.desde, x.hasta),
          );
          if (bloqueado) continue;
          const ocupado = activas.some(
            (c) => c.psicologoId === p.id && cruza(ini, fin, c.inicio, c.fin),
          );
          if (ocupado) continue;
          const k = ini.getTime();
          const cupo = porInicio.get(k) ?? {
            inicio: ini.toISOString(),
            fin: fin.toISOString(),
            psicologoIds: [],
          };
          cupo.psicologoIds.push(p.id);
          porInicio.set(k, cupo);
        }
      }
    }
  }
  return [...porInicio.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c);
}
