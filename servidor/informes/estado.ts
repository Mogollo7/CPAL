// Informe diario del estado del servidor: un sondeo por minuto + el resumen de las últimas 24 h (08:00 → 08:00, Bogotá).
import type { InformeEstado } from "../../contratos/informe-estado";
import { bd } from "../bd";
import { llaveCorreo } from "../cola";
import { encolarPlantilla } from "../correo/enviar";
import { desdeBogota, fechaBogota, minutosDelDia } from "../fechas";

const MIN = 60_000;
const HORA_DEL_INFORME = 8 * 60; // 08:00 de Bogotá
export const CONSERVACION_SONDEOS_DIAS = 35;

/** Un latido: anota que la aplicación y la base responden y cuánto tardó la base. Si la base no responde, no hay fila. */
export async function sondear(ahora = new Date()): Promise<number> {
  const t0 = performance.now();
  await bd.$queryRaw`SELECT 1`;
  const ms = Math.round(performance.now() - t0);
  await bd.sondeo.create({ data: { creadoEn: ahora, ok: true, ms } });
  await bd.sondeo.deleteMany({
    where: {
      creadoEn: {
        lt: new Date(
          ahora.getTime() - CONSERVACION_SONDEOS_DIAS * 24 * 60 * MIN,
        ),
      },
    },
  });
  return ms;
}

type Latido = { creadoEn: Date; ms: number; ok: boolean };

/** Disponibilidad, minutos sin servicio, latencia p95 y la interrupción más larga a partir de los latidos.
 *  Un minuto «sirve» si tiene al menos un latido ok. Pura: no toca la base (se prueba con datos inventados). */
export function resumirSondeos(latidos: Latido[], desde: Date, hasta: Date) {
  const minuto = (d: Date) => Math.floor(d.getTime() / MIN);
  const ini = minuto(desde);
  const fin = minuto(hasta); // exclusivo
  const total = Math.max(0, fin - ini);
  const buenos = latidos.filter(
    (l) => l.ok && minuto(l.creadoEn) >= ini && minuto(l.creadoEn) < fin,
  );
  const minutosOk = [...new Set(buenos.map((l) => minuto(l.creadoEn)))].sort(
    (a, b) => a - b,
  );

  // Interrupciones: huecos de minutos seguidos sin latido (incluye el inicio y el final de la ventana).
  const bordes = [ini - 1, ...minutosOk, fin];
  let peor: { desde: number; hasta: number } | null = null;
  for (let i = 1; i < bordes.length; i++) {
    const falta = bordes[i] - bordes[i - 1] - 1;
    if (falta >= 2 && (!peor || falta > peor.hasta - peor.desde))
      peor = { desde: bordes[i - 1] + 1, hasta: bordes[i] };
  }
  const ms = buenos.map((l) => l.ms).sort((a, b) => a - b);
  return {
    minutosSinServicio: total - minutosOk.length,
    disponibilidad: total
      ? Math.round((minutosOk.length / total) * 10_000) / 100
      : null,
    latenciaP95Ms: ms.length
      ? ms[Math.max(0, Math.ceil(0.95 * ms.length) - 1)]
      : null,
    incidente: peor
      ? {
          desde: new Date(peor.desde * MIN).toISOString(),
          hasta: new Date(peor.hasta * MIN).toISOString(),
        }
      : null,
  };
}

/** Todas las cifras del informe para [desde, hasta). Si el sondeo empezó después de `desde`, se mide desde el primer latido
 *  (no se culpa al servidor de los minutos anteriores a que existiera el sondeo). */
export async function calcularInforme(
  desde: Date,
  hasta: Date,
): Promise<InformeEstado> {
  const [primero, latidos] = await Promise.all([
    bd.sondeo.findFirst({
      orderBy: { creadoEn: "asc" },
      select: { creadoEn: true },
    }),
    bd.sondeo.findMany({
      where: { creadoEn: { gte: desde, lt: hasta } },
      select: { creadoEn: true, ms: true, ok: true },
      orderBy: { creadoEn: "asc" },
    }),
  ]);
  const medirDesde =
    primero && primero.creadoEn > desde ? primero.creadoEn : desde;
  const resumen = primero
    ? resumirSondeos(latidos, medirDesde, hasta)
    : resumirSondeos([], hasta, hasta);

  const enVentana = { gte: desde, lt: hasta };
  const [
    enviados,
    entregados,
    rebotados,
    pendientes,
    errores,
    ok,
    fallidos,
    bloqueadas,
    emergencia,
    admins,
  ] = await Promise.all([
    bd.trabajo.count({
      where: { tipo: "CORREO", estado: "HECHO", hechoEn: enVentana },
    }),
    bd.trabajo.count({
      where: { tipo: "CORREO", hechoEn: enVentana, entregado: true },
    }),
    bd.trabajo.count({
      where: { tipo: "CORREO", hechoEn: enVentana, entregado: false },
    }),
    bd.trabajo.count({
      where: { tipo: "CORREO", estado: { in: ["PENDIENTE", "EN_CURSO"] } },
    }),
    bd.trabajo.count({
      where: { tipo: "CORREO", estado: "FALLIDO", creadoEn: enVentana },
    }),
    bd.auditoria.count({
      where: { accion: "INGRESO_OK", creadaEn: enVentana },
    }),
    bd.auditoria.count({
      where: { accion: "INGRESO_FALLIDO", creadaEn: enVentana },
    }),
    bd.usuario.count({ where: { bloqueadaEn: enVentana } }),
    bd.auditoria.count({
      where: { accion: "ADMIN_ACCESO_EMERGENCIA", creadaEn: enVentana },
    }),
    bd.usuario.count({ where: { rol: "ADMIN", creadoEn: enVentana } }),
  ]);
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    ...resumen,
    ultimoSondeo: latidos.at(-1)?.creadoEn.toISOString() ?? null,
    correos: { enviados, entregados, rebotados, pendientes, errores },
    seguridad: {
      ingresosCorrectos: ok,
      intentosFallidos: fallidos,
      cuentasBloqueadas: bloqueadas,
      accesosEmergencia: emergencia,
      administradoresCreados: admins,
    },
  };
}

/** Ventana del informe que corresponde a `ahora`: 08:00 → 08:00 de Bogotá. null si hoy todavía no son las 08:00. */
export function ventanaDelInforme(
  ahora: Date,
): { desde: Date; hasta: Date; dia: string } | null {
  if (minutosDelDia(ahora) < HORA_DEL_INFORME) return null;
  const dia = fechaBogota(ahora);
  const hasta = desdeBogota(dia, HORA_DEL_INFORME);
  return { desde: new Date(hasta.getTime() - 24 * 60 * MIN), hasta, dia };
}

/** Paso de la tarea programada: a partir de las 08:00 (Bogotá) encola UN informe por día (la llave impide repetirlo). */
export async function encolarInformeDiario(ahora: Date): Promise<boolean> {
  const v = ventanaDelInforme(ahora);
  if (!v) return false;
  // Ya encolado hoy: no se vuelven a calcular las cifras en cada vuelta de la tarea (una por minuto).
  const llave = llaveCorreo("estado-servidor", `informe:${v.dia}`);
  if (await bd.trabajo.findUnique({ where: { llave }, select: { id: true } }))
    return false;
  const informe = await calcularInforme(v.desde, v.hasta);
  const { creado } = await encolarPlantilla(
    "estado-servidor",
    { informe },
    { entidad: `informe:${v.dia}` },
  );
  return creado;
}
