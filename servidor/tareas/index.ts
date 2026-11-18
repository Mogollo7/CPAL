// La tarea programada (S05, T-321). `POST /api/tareas` la llama cada minuto. Una sola vuelta a la vez (candado en la BD),
// cada paso aislado y con límite de 30 s: si uno falla, los demás corren.
import { bd } from "../bd";
import { procesarCola, type Resumen } from "../cola";
import { registrar } from "../registro";
import {
  anonimizarCitas,
  enviarRecordatorios,
  limpiar,
  vencerSolicitudes,
} from "./pasos";

const LIMITE_PASO_MS = 30_000;

async function paso<T>(nombre: string, f: () => Promise<T>): Promise<T | null> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      f(),
      new Promise<never>((_, no) => {
        reloj = setTimeout(
          () => no(Object.assign(new Error(), { name: "TIEMPO_AGOTADO" })),
          LIMITE_PASO_MS,
        );
      }),
    ]);
  } catch (e) {
    registrar("tarea.paso_fallido", {
      nivel: "error",
      operacion: nombre,
      resultado: e instanceof Error ? e.name : "ERROR", // nunca el mensaje: puede traer datos
    });
    return null;
  } finally {
    clearTimeout(reloj);
  }
}

export type ResumenTareas = {
  cola: Resumen | null;
  vencidas: number | null;
  recordatorios: number | null;
  anonimizadas: number | null;
  limpieza: Awaited<ReturnType<typeof limpiar>> | null;
  pendientes: number;
  fallidos: number;
};

/** Una vuelta completa. Devuelve null si otra vuelta sigue en curso (no se pisan). */
export async function ejecutarTareas({
  ahora = new Date(),
}: { ahora?: Date } = {}): Promise<ResumenTareas | null> {
  // El candado vive mientras dura esta transacción (se suelta al terminar, incluso si el proceso muere).
  // Los pasos usan `bd` por su cuenta: la transacción solo sostiene el candado.
  return bd.$transaction(
    async (tx) => {
      const [{ ok }] = await tx.$queryRaw<
        { ok: boolean }[]
      >`SELECT pg_try_advisory_xact_lock(727401) AS ok`;
      if (!ok) return null;

      // Pasos 1 y 2: procesar la cola; `procesarCola` rescata antes los colgados (más de 5 min en curso).
      const cola = await paso("cola", () => procesarCola({ ahora }));
      const vencidas = await paso("vencer", () => vencerSolicitudes(ahora));
      // Idempotentes: correr cada minuto basta (la spec dice cada 15 min / diario, pero repetir no cuesta ni duplica).
      const recordatorios = await paso("recordatorios", () =>
        enviarRecordatorios(ahora),
      );
      const anonimizadas = await paso("anonimizar", () =>
        anonimizarCitas(ahora),
      );
      const limpieza = await paso("limpiar", () => limpiar(ahora));

      const [pendientes, fallidos] = await Promise.all([
        bd.trabajo.count({ where: { estado: "PENDIENTE" } }),
        bd.trabajo.count({ where: { estado: "FALLIDO" } }),
      ]);
      // Latido: si falta 5 minutos, S06 alerta de que la cola está parada.
      registrar("tarea.latido", {
        resultado: `pendientes=${pendientes} fallidos=${fallidos}`,
      });
      registrar("tarea.resumen", {
        resultado: `hechos=${cola?.hechos ?? "-"} vencidas=${vencidas ?? "-"} recordatorios=${recordatorios ?? "-"} anonimizadas=${anonimizadas ?? "-"}`,
      });
      return {
        cola,
        vencidas,
        recordatorios,
        anonimizadas,
        limpieza,
        pendientes,
        fallidos,
      };
    },
    { timeout: 3 * 60_000, maxWait: 5_000 },
  );
}
