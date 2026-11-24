// Operaciones de servidor para el panel (T-335). Quien las llama ya comprobó el rol con `exigir(sesion, "ADMIN")`.
import { bd } from "../bd";
import { auditar } from "../auditoria";

export const AVISO_NO_ENTREGADO =
  "No pudimos entregar el correo a esta persona";

export type EstadoCorreo = "ENVIADO" | "PENDIENTE" | "NO_ENTREGADO" | "FALLIDO";

/** `correo:{plantilla}:{entidad}:{versión}` → plantilla. */
const plantillaDe = (llave: string) => llave.split(":")[1] ?? "";

export function estadoCorreo(t: {
  estado: string;
  entregado: boolean | null;
}): EstadoCorreo {
  if (t.entregado === false) return "NO_ENTREGADO"; // lo marcó el aviso de Resend (rebote o no deseado)
  if (t.estado === "FALLIDO") return "FALLIDO";
  return t.estado === "HECHO" ? "ENVIADO" : "PENDIENTE";
}

/** Correos de una cita con su estado; `hayRebote` = mostrar AVISO_NO_ENTREGADO para que administración llame. */
export async function correosDeCita(citaId: string) {
  const filas = await bd.trabajo.findMany({
    where: { citaId, tipo: "CORREO" },
    orderBy: { creadoEn: "asc" },
    select: {
      id: true,
      llave: true,
      estado: true,
      entregado: true,
      creadoEn: true,
      hechoEn: true,
    },
  });
  const correos = filas.map((t) => ({
    trabajoId: t.id,
    plantilla: plantillaDe(t.llave),
    estado: estadoCorreo(t),
    creadoEn: t.creadoEn,
    enviadoEn: t.hechoEn,
  }));
  return {
    correos,
    hayRebote: correos.some((c) => c.estado === "NO_ENTREGADO"),
  };
}

export async function trabajosFallidos() {
  const filas = await bd.trabajo.findMany({
    where: { tipo: "CORREO", estado: "FALLIDO" },
    orderBy: { creadoEn: "desc" },
    take: 100,
    select: {
      id: true,
      llave: true,
      intentos: true,
      creadoEn: true,
    },
  });
  return {
    cantidad: filas.length,
    trabajos: filas.map(({ llave, ...fila }) => ({
      ...fila,
      plantilla: plantillaDe(llave),
    })),
  };
}

/** Devuelve un trabajo FALLIDO a la cola para que la próxima vuelta lo intente de nuevo. */
export async function reintentarTrabajo(
  trabajoId: string,
  usuarioId: string,
): Promise<{ ok: boolean }> {
  return bd.$transaction(async (tx) => {
    const r = await tx.trabajo.updateMany({
      where: { id: trabajoId, tipo: "CORREO", estado: "FALLIDO" },
      data: {
        estado: "PENDIENTE",
        intentos: 0,
        ultimoError: null,
        tomadoEn: null,
        ejecutarDespuesDe: new Date(),
      },
    });
    if (!r.count) return { ok: false };
    await auditar(
      {
        usuarioId,
        accion: "TRABAJO_REINTENTADO",
        entidad: "trabajo",
        entidadId: trabajoId,
      },
      tx,
    );
    return { ok: true };
  });
}
