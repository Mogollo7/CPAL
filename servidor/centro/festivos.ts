// Festivos de Colombia calculados (RF-ADM-13): sin tabla que mantener ni librería. Reglas de la Ley Emiliani (51/1983):
// seis fechas fijas; siete que pasan al lunes siguiente; y los de Semana Santa, que dependen de la Pascua.
import type { Festivo } from "../../contratos/bloqueo";

const DIA_MS = 86_400_000;
const utc = (a: number, m: number, d: number) => Date.UTC(a, m - 1, d);
const mas = (t: number, dias: number) => t + dias * DIA_MS;
/** Si no cae lunes, pasa al lunes siguiente. */
const aLunes = (t: number) => mas(t, (8 - (new Date(t).getUTCDay() || 7)) % 7);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher). */
function pascua(y: number): number {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100;
  const d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  return utc(y, mes, ((h + l - 7 * m + 114) % 31) + 1);
}

/** Los 18 festivos del año, ordenados por fecha. */
export function festivosColombia(anio: number): Festivo[] {
  const p = pascua(anio);
  const lista: [number, string][] = [
    [utc(anio, 1, 1), "Año Nuevo"],
    [aLunes(utc(anio, 1, 6)), "Reyes Magos"],
    [aLunes(utc(anio, 3, 19)), "San José"],
    [mas(p, -3), "Jueves Santo"],
    [mas(p, -2), "Viernes Santo"],
    [utc(anio, 5, 1), "Día del Trabajo"],
    [aLunes(mas(p, 39)), "Ascensión del Señor"],
    [aLunes(mas(p, 60)), "Corpus Christi"],
    [aLunes(mas(p, 68)), "Sagrado Corazón"],
    [aLunes(utc(anio, 6, 29)), "San Pedro y San Pablo"],
    [utc(anio, 7, 20), "Independencia de Colombia"],
    [utc(anio, 8, 7), "Batalla de Boyacá"],
    [aLunes(utc(anio, 8, 15)), "Asunción de la Virgen"],
    [aLunes(utc(anio, 10, 12)), "Día de la Raza"],
    [aLunes(utc(anio, 11, 1)), "Todos los Santos"],
    [aLunes(utc(anio, 11, 11)), "Independencia de Cartagena"],
    [utc(anio, 12, 8), "Inmaculada Concepción"],
    [utc(anio, 12, 25), "Navidad"],
  ];
  return lista
    .sort((x, y) => x[0] - y[0])
    .map(([t, nombre]) => ({ fecha: iso(t), nombre }));
}

/** ¿"2026-11-16" (fecha de Bogotá) es festivo? Pensada para `calcularCupos`. */
export const esFestivo = (fecha: string) =>
  festivosColombia(Number(fecha.slice(0, 4))).some((f) => f.fecha === fecha);
