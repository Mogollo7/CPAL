// Cola de trabajos en PostgreSQL (S05). Todo lo que habla con el exterior (correo, calendario) sale de aquí,
// nunca dentro de la petición de la persona ni de una transacción de base de datos.
import { bd } from "./bd";
import { enviarCorreo, type Correo } from "./externos/resend";
import { registrar } from "./registro";
import type { TipoTrabajo } from "./generado/enums";

type Json = Record<string, unknown>;
export type Ejecutor = (t: {
  id: string;
  tipo: string;
  llave: string;
  datos: Json;
}) => Promise<{ ok: true } | { ok: false; permanente: boolean; error: string }>;

// Espera tras cada fallo temporal: 1 min, 5 min, 30 min, 2 h, 12 h (E03 §9). Agotadas las cinco → FALLIDO.
// ponytail: el intento inmediato cuenta como el primero; son 1 + 5 reintentos. Si S05 quiere solo 5 intentos en total, quitar el último valor.
const MIN = 60_000;
export const ESPERAS_MS = [1 * MIN, 5 * MIN, 30 * MIN, 120 * MIN, 720 * MIN];
const RESCATE_MS = 5 * MIN;

export type DatosCorreo = Omit<Correo, "llave">;

/** Encola un trabajo. Si ya existe uno con la misma `llave`, NO crea otro (idempotencia). `cliente`: la transacción
 *  del hecho que lo origina, para que se guarden juntos o ninguno. */
export async function encolar(
  e: {
    tipo: TipoTrabajo;
    llave: string;
    datos: Json;
    citaId?: string;
    ejecutarDespuesDe?: Date;
  },
  cliente: Pick<typeof bd, "trabajo"> = bd,
): Promise<{ creado: boolean }> {
  const r = await cliente.trabajo.createMany({
    data: [
      {
        tipo: e.tipo,
        llave: e.llave,
        datos: e.datos as object,
        citaId: e.citaId,
        ejecutarDespuesDe: e.ejecutarDespuesDe,
      },
    ],
    skipDuplicates: true,
  });
  if (r.count)
    registrar("cola.encolado", {
      entidad: e.citaId ? `cita:${e.citaId}` : undefined,
      operacion: e.tipo,
    });
  return { creado: r.count === 1 };
}

/** Llave de correo según S05: `correo:{plantilla}:{entidad}:{versión}`. */
export const llaveCorreo = (
  plantilla: string,
  entidad: string,
  version: string | number = 1,
) => `correo:${plantilla}:${entidad}:${version}`;

export const encolarCorreo = (
  e: {
    plantilla: string;
    entidad: string;
    version?: string | number;
    correo: DatosCorreo;
    citaId?: string;
  },
  cliente?: Pick<typeof bd, "trabajo">,
) =>
  encolar(
    {
      tipo: "CORREO",
      llave: llaveCorreo(e.plantilla, e.entidad, e.version),
      datos: e.correo,
      citaId: e.citaId,
    },
    cliente,
  );

const ejecutorCorreo: Ejecutor = async (t) => {
  const r = await enviarCorreo({ ...(t.datos as DatosCorreo), llave: t.llave });
  return r.ok ? { ok: true } : r;
};

// Solo los tipos con ejecutor se toman. Calendario y avisos de Resend llegan con T-334 / T-332.
export const EJECUTORES: Partial<Record<TipoTrabajo, Ejecutor>> = {
  CORREO: ejecutorCorreo,
};

export type Resumen = {
  rescatados: number;
  hechos: number;
  reintentos: number;
  fallidos: number;
};

type Fila = {
  id: string;
  tipo: TipoTrabajo;
  llave: string;
  datos: Json;
  intentos: number;
};

/** Una vuelta: rescata colgados y ejecuta hasta `lote` trabajos vencidos. Seguro con varios procesos a la vez
 *  (cada trabajo lo toma uno solo) e idempotente. `POST /api/tareas` la llama cada minuto (T-321). */
export async function procesarCola({
  lote = 20,
  ahora = new Date(),
  ejecutores = EJECUTORES,
}: {
  lote?: number;
  ahora?: Date;
  ejecutores?: typeof EJECUTORES;
} = {}): Promise<Resumen> {
  const resumen: Resumen = {
    rescatados: 0,
    hechos: 0,
    reintentos: 0,
    fallidos: 0,
  };

  // Rescate: EN_CURSO hace más de 5 min = el proceso murió a mitad.
  const colgados = await bd.trabajo.updateMany({
    where: {
      estado: "EN_CURSO",
      tomadoEn: { lt: new Date(ahora.getTime() - RESCATE_MS) },
    },
    data: { estado: "PENDIENTE", tomadoEn: null },
  });
  resumen.rescatados = colgados.count;
  if (colgados.count)
    registrar("cola.rescatado", { resultado: String(colgados.count) });

  // Tomar con bloqueo de fila que salta los ya tomados: dos procesos nunca ejecutan el mismo.
  const tipos = Object.keys(ejecutores);
  if (!tipos.length) return resumen;
  const filas = await bd.$queryRaw<Fila[]>`
    UPDATE "Trabajo" SET "estado" = 'EN_CURSO', "tomadoEn" = ${ahora}
    WHERE "id" IN (
      SELECT "id" FROM "Trabajo"
      WHERE "estado" = 'PENDIENTE' AND "ejecutarDespuesDe" <= ${ahora} AND "tipo"::text = ANY(${tipos})
      ORDER BY "ejecutarDespuesDe" LIMIT ${lote}
      FOR UPDATE SKIP LOCKED)
    RETURNING "id", "tipo", "llave", "datos", "intentos"`;

  for (const t of filas) {
    const r = await ejecutores[t.tipo]!(t).catch(
      (): { ok: false; permanente: boolean; error: string } => ({
        ok: false,
        permanente: false,
        error: "EXCEPCION",
      }),
    );
    if (r.ok) {
      await bd.trabajo.update({
        where: { id: t.id },
        data: {
          estado: "HECHO",
          datos: {},
          hechoEn: ahora,
          ultimoError: null,
          tomadoEn: null,
        },
      });
      resumen.hechos++;
      registrar("cola.hecho", { operacion: t.tipo });
      continue;
    }
    const intentos = t.intentos + 1;
    const definitivo = r.permanente || intentos > ESPERAS_MS.length;
    await bd.trabajo.update({
      where: { id: t.id },
      data: {
        estado: definitivo ? "FALLIDO" : "PENDIENTE",
        intentos,
        ultimoError: r.error, // código, sin datos personales
        tomadoEn: null,
        ejecutarDespuesDe: definitivo
          ? undefined
          : new Date(ahora.getTime() + ESPERAS_MS[intentos - 1]),
      },
    });
    if (definitivo) {
      resumen.fallidos++;
      registrar("cola.fallido", {
        nivel: "error",
        operacion: t.tipo,
        resultado: r.error,
      });
    } else {
      resumen.reintentos++;
      registrar("cola.reintento", {
        nivel: "aviso",
        operacion: t.tipo,
        resultado: r.error,
      });
    }
  }
  return resumen;
}
