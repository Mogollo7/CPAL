// Sesión de la petición en curso, para Server Components y acciones de servidor (no usar desde pruebas unitarias).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { fallo, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { COOKIE_CONFIRMACION, confirmacionVigente } from "./confirmacion";
import { exigir, type Rol, type Sesion } from "../permisos";
import { registrar } from "../registro";
import { COOKIE_SESION, leer } from "./sesion";

/** Sesión válida o `null`. Comprueba en la BD que el usuario siga activo y con el mismo rol: un usuario
 *  desactivado pierde el acceso en la siguiente carga aunque su cookie siga vigente (E03 §7). */
export async function obtenerSesion(): Promise<Sesion | null> {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) return null;
  await connection();
  const carga = leer(token);
  if (!carga) return null;
  const u = await bd.usuario.findUnique({
    where: { id: carga.u },
    select: { id: true, rol: true, activo: true, sesionesDesde: true },
  });
  if (!u || !u.activo || u.rol !== carga.r) return null;
  // "Cerrar mis sesiones": toda sesión iniciada antes de ese instante deja de valer (las antiguas sin `iat` también).
  if (
    u.sesionesDesde &&
    (carga.inicioMs ?? (carga.iat ?? 0) * 1000) < u.sesionesDesde.getTime()
  )
    return null;
  return { usuarioId: u.id, rol: u.rol, activo: u.activo };
}

/** Primera línea de toda página del panel: sin sesión → /ingresar; rol que no alcanza → inicio del panel. */
export async function paginaProtegida(roles: Rol | Rol[]): Promise<Sesion> {
  const sesion = await obtenerSesion();
  const r = exigir(sesion, roles);
  if (r.ok) return r.datos;
  if (r.codigo === "NO_AUTENTICADO") redirect("/ingresar");
  registrar("permiso.negado", {
    nivel: "aviso",
    actor: sesion?.usuarioId,
    rol: sesion?.rol === "ADMIN" ? "admin" : "psicologo",
    resultado: r.codigo,
  });
  redirect("/panel?error=sin-permiso");
}

/** Para operaciones y route handlers: sesión del rol pedido o `NO_AUTENTICADO` / `SIN_PERMISO` (E05). */
export async function sesionDeOperacion(
  roles: Rol | Rol[],
): Promise<Resultado<Sesion>> {
  return exigir(await obtenerSesion(), roles);
}

/** Primera línea de toda acción SENSIBLE (S02), después de `exigir`: si pasaron más de 10 minutos desde que la persona
 *  confirmó su contraseña devuelve `CONFIRMACION_REQUERIDA` y la pantalla debe pedirla (`confirmarClaveAccion`). */
export async function exigirClaveReciente(
  sesion: Sesion,
): Promise<Resultado<Sesion>> {
  const cookie = (await cookies()).get(COOKIE_CONFIRMACION)?.value;
  return confirmacionVigente(cookie, sesion.usuarioId)
    ? { ok: true, datos: sesion }
    : fallo("CONFIRMACION_REQUERIDA", "Confirma tu contraseña para continuar.");
}
