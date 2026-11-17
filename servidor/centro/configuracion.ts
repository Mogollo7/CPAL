// Configuración del centro (RF-ADM-06, E03 §1). Una sola fila; se lee de la base en cada uso, así que cambiar un
// valor cambia el comportamiento sin desplegar.
import {
  cambioConfiguracionSchema,
  type Configuracion,
} from "../../contratos/configuracion";
import { ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { exigir, type Sesion } from "../permisos";
import { validar } from "./validar";

const CAMPOS = {
  autoAutorizar: true,
  anticipacionMinHoras: true,
  anticipacionMaxDias: true,
  cancelacionMinHoras: true,
  maxCitasActivas: true,
  maxReprogramaciones: true,
  vencimientoPendienteHoras: true,
  duracionEnlaceHoras: true,
  conservacionMeses: true,
  dominiosPermitidos: true,
  correoAdministracion: true,
} as const;

/** Uso interno (sin sesión): la fila viene de la semilla. Lanza si falta, porque sin ella nada es seguro. */
export async function configuracionActual(
  cliente: Pick<typeof bd, "configuracion"> = bd,
): Promise<Configuracion> {
  const c = await cliente.configuracion.findUnique({
    where: { id: 1 },
    select: CAMPOS,
  });
  if (!c)
    throw new Error("Falta la fila de Configuracion (ejecuta bd:semilla)");
  return c;
}

export async function obtenerConfiguracion(
  sesion: Sesion | null | undefined,
): Promise<Resultado<Configuracion>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  // ponytail: S02 pide además exigirConfirmacionReciente() (acción sensible); se conecta con T-217.
  return ok(await configuracionActual());
}

/** Cambia solo los campos enviados. Auditoría `CONFIG_CAMBIADA`: nombres de campo y, si no es un dato de contacto,
 *  el valor anterior y el nuevo. */
export async function actualizarConfiguracion(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<Configuracion>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(cambioConfiguracionSchema, entrada);
  if (!v.ok) return v;

  const nueva = await bd.$transaction(async (tx) => {
    const antes = await configuracionActual(tx);
    const despues = await tx.configuracion.update({
      where: { id: 1 },
      data: v.datos,
      select: CAMPOS,
    });
    const detalle: Record<string, string | number | boolean | null> = {};
    for (const k of Object.keys(v.datos) as (keyof Configuracion)[]) {
      if (k === "correoAdministracion" || k === "dominiosPermitidos")
        detalle[k] = true; // sin valores: es dato de contacto
      else {
        detalle[`${k}_antes`] = antes[k] as number | boolean;
        detalle[`${k}_despues`] = despues[k] as number | boolean;
      }
    }
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: "CONFIG_CAMBIADA",
        entidad: "Configuracion",
        entidadId: "1",
        detalle,
      },
      tx,
    );
    return despues;
  });
  return ok(nueva);
}

/** Valida el dominio del correo contra `dominiosPermitidos`. Lista vacía = cualquiera, salvo en producción, donde se rechaza (E03 §7). */
export const dominioPermitido = (correo: string, dominios: string[]) =>
  (dominios.length === 0 && process.env.ENTORNO !== "produccion") ||
  dominios.includes(correo.slice(correo.lastIndexOf("@") + 1).toLowerCase());
