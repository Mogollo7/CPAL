// Sesión de la petición en curso, para Server Components y acciones de servidor (no usar desde pruebas unitarias).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bd } from "../bd";
import { exigir, type Rol, type Sesion } from "../permisos";
import { registrar } from "../registro";
import { COOKIE_SESION, leer } from "./sesion";

/** Sesión válida o `null`. Comprueba en la BD que el usuario siga activo y con el mismo rol: un usuario
 *  desactivado pierde el acceso en la siguiente carga aunque su cookie siga vigente (E03 §7). */
export async function obtenerSesion(): Promise<Sesion | null> {
  const carga = leer((await cookies()).get(COOKIE_SESION)?.value);
  if (!carga) return null;
  const u = await bd.usuario.findUnique({
    where: { id: carga.u },
    select: { id: true, rol: true, activo: true },
  });
  if (!u || !u.activo || u.rol !== carga.r) return null;
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
