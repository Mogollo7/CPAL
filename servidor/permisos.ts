// `exigir` es la primera línea de TODA operación no pública (S02): comprueba sesión, usuario activo y rol.
// Es una función pura sobre la sesión: de dónde sale la sesión (Auth.js) se conecta en T-201.
import { fallo, ok, type Resultado } from "../contratos/resultado";

export type Rol = "ADMIN" | "PSICOLOGO";
export type Sesion = { usuarioId: string; rol: Rol; activo: boolean };

export function exigir(
  sesion: Sesion | null | undefined,
  roles: Rol | Rol[],
): Resultado<Sesion> {
  if (!sesion || !sesion.activo)
    return fallo("NO_AUTENTICADO", "Ingresa para continuar.");
  if (![roles].flat().includes(sesion.rol))
    return fallo("SIN_PERMISO", "No tienes permiso para hacer esto.");
  return ok(sesion);
}

/** Guarda de rutas del panel por rol (T-201): /panel/admin solo ADMIN, /panel/psicologo solo PSICOLOGO.
 *  El resto de /panel/** (inicio, mi cuenta) es de cualquier rol con sesión. La página vuelve a comprobarlo con la BD. */
export function rutaPermitida(ruta: string, rol: Rol): boolean {
  if (/^\/panel\/admin(\/|$)/.test(ruta)) return rol === "ADMIN";
  if (/^\/panel\/psicologo(\/|$)/.test(ruta)) return rol === "PSICOLOGO";
  return true;
}

/** Regla del último administrador (S02/T-218): llamar DENTRO de la transacción que desactiva o degrada a `usuarioId`.
 *  Bloquea las filas de administradores activos para que dos bajas simultáneas no dejen el sistema sin ninguno. */
export async function exigirOtroAdminActivo(
  usuarioId: string,
  tx: { $queryRaw: typeof import("./bd").bd.$queryRaw },
): Promise<Resultado<null>> {
  const filas = await tx.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Usuario" WHERE "rol" = 'ADMIN' AND "activo" = true FOR UPDATE`;
  return filas.some((f) => f.id !== usuarioId)
    ? ok(null)
    : fallo(
        "TRANSICION_INVALIDA",
        "Debe quedar al menos un administrador activo.",
      );
}
