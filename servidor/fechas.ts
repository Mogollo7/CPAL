// Fechas del CAPL: se guardan en UTC y se muestran/interpretan en America/Bogota (UTC−5, sin horario de verano).
export const ZONA = "America/Bogota";
const OFFSET_H = 5; // Colombia no cambia de hora; por eso construir Bogotá → UTC es sumar 5 h.

const partes = (d: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );

/** Día de la semana en Bogotá: 1 = lunes … 7 = domingo (igual que `Disponibilidad.diaSemana`). */
export function diaSemana(d: Date): number {
  return (
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
      partes(d).weekday,
    ) + 1
  );
}

/** Minutos desde la medianoche de Bogotá (480 = 8:00 a. m.), igual que `Disponibilidad.inicioMin`. */
export function minutosDelDia(d: Date): number {
  const p = partes(d);
  return Number(p.hour) * 60 + Number(p.minute);
}

/** Fecha de Bogotá como "2026-11-24". */
export function fechaBogota(d: Date): string {
  const p = partes(d);
  return `${p.year}-${p.month}-${p.day}`;
}

/** "2026-11-24" + minutos del día de Bogotá → instante UTC. Ej.: ("2026-11-24", 870) = 2:30 p. m. */
export function desdeBogota(fecha: string, minutos = 0): Date {
  return new Date(
    Date.parse(`${fecha}T00:00:00Z`) + (minutos / 60 + OFFSET_H) * 3_600_000,
  );
}

/** Medianoche de Bogotá del día en que cae `d`, como instante UTC. */
export const inicioDelDia = (d: Date): Date => desdeBogota(fechaBogota(d));

/** Formato de N08: "martes 24 de noviembre, 2:30 p. m." */
export function formatoFechaHora(d: Date): string {
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, ...o })
      .format(d)
      .replace(/[  ]/g, " ");
  const dia = f({ weekday: "long" });
  const resto = f({ day: "numeric", month: "long" });
  const hora = f({
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
  return `${dia} ${resto}, ${hora}`;
}
