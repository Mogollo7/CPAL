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
