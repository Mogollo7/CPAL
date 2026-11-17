// Confirmación de contraseña en acciones sensibles (T-218, S02): vale 10 minutos. Va en una cookie firmada propia,
// ligada al usuario; no es la sesión.
import { confirmarClaveSchema } from "../../contratos/cuenta";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { limitar, olvidar } from "../limites";
import { exigir, type Sesion } from "../permisos";
import { verificarClave } from "./clave";
import { ahoraS, firmarDatos, leerDatos, secreto } from "./sesion";

export const COOKIE_CONFIRMACION = "capl_confirmacion";
export const CONFIRMACION_VIGENCIA_S = 10 * 60;

type Conf = { t: "conf"; u: string; exp: number };

export const firmarConfirmacion = (usuarioId: string, ahora = ahoraS()) =>
  firmarDatos({
    t: "conf",
    u: usuarioId,
    exp: ahora + CONFIRMACION_VIGENCIA_S,
  } satisfies Conf);

/** ¿La cookie es una confirmación vigente DE ESTE usuario? */
export function confirmacionVigente(
  token: string | undefined,
  usuarioId: string,
  ahora = ahoraS(),
): boolean {
  const d = leerDatos<Conf>(token, secreto(), ahora);
  return d?.t === "conf" && d.u === usuarioId;
}

/** `confirmarClave`: verifica la contraseña de la sesión y devuelve la cookie que la acredita 10 minutos. */
export async function confirmarClave(
  sesion: Sesion | null,
  entrada: unknown,
): Promise<Resultado<{ token: string; maxAgeS: number }>> {
  const permiso = exigir(sesion, ["ADMIN", "PSICOLOGO"]);
  if (!permiso.ok) return permiso;
  const datos = confirmarClaveSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("CREDENCIALES", "La contraseña no es correcta.");
  const { usuarioId } = permiso.datos;
  const quien = `confirmar|${usuarioId}`;
  const espera = limitar("ingreso", quien);
  if (!espera.permitido)
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Demasiados intentos. Espera un momento.",
    );
  const u = await bd.usuario.findUnique({
    where: { id: usuarioId },
    select: { claveHash: true },
  });
  if (!u?.claveHash || !(await verificarClave(u.claveHash, datos.data.clave)))
    return fallo("CREDENCIALES", "La contraseña no es correcta.");
  olvidar("ingreso", quien);
  return ok({
    token: firmarConfirmacion(usuarioId),
    maxAgeS: CONFIRMACION_VIGENCIA_S,
  });
}
