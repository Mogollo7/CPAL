"use server";
// Acciones de servidor de cuenta. Brand las conecta a los formularios de /ingresar, /crear-clave, "Mi cuenta" y al botón "Cerrar sesión".
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Resultado } from "../../contratos/resultado";
import { registrar } from "../registro";
import {
  cambiarClave,
  cerrarSesiones,
  crearClave,
  solicitarEnlace,
} from "./claves";
import { COOKIE_CONFIRMACION, confirmarClave } from "./confirmacion";
import { ingresar, type SesionIniciada } from "./ingresar";
import {
  COOKIE_DISPOSITIVO,
  COOKIE_PASO,
  CODIGO_VIGENCIA_S,
  reenviarCodigo,
  verificarCodigo,
} from "./segundoPaso";
import { COOKIE_SESION, leer, opcionesCookie } from "./sesion";
import { obtenerSesion } from "./sesionActual";
import { exigirSuperusuario } from "./superusuario";

const INICIO = {
  ADMIN: "/panel/admin/citas",
  PSICOLOGO: "/panel/psicologo/citas",
} as const;

const opcionesAuxiliar = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.ENTORNO !== "local",
  path: "/",
  maxAge,
});

async function abrirSesion({
  token,
  rol,
  usuarioId,
}: SesionIniciada): Promise<never> {
  const jar = await cookies();
  jar.set(COOKIE_SESION, token, opcionesCookie(rol));
  jar.delete(COOKIE_PASO);
  if (
    rol === "ADMIN" &&
    (await exigirSuperusuario({ usuarioId, rol, activo: true })).ok
  )
    redirect("/panel/admin/equipo");
  redirect(INICIO[rol]);
}

/** Uso: `<form action={ingresarAccion}>` con campos `correo` y `clave`. Si falla devuelve el error; si entra, redirige.
 *  Administrador en dispositivo nuevo: devuelve `CODIGO_REQUERIDO` (ya dejó la cookie del paso 2): mostrar el campo del código. */
export async function ingresarAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<never>> {
  const red =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ||
    "desconocida";
  const jar = await cookies();
  const r = await ingresar(
    { correo: formData.get("correo"), clave: formData.get("clave") },
    red,
    jar.get(COOKIE_DISPOSITIVO)?.value,
  );
  if (!r.ok) {
    if (r.codigo === "CODIGO_REQUERIDO" && r.campos?.paso) {
      jar.set(COOKIE_PASO, r.campos.paso, opcionesAuxiliar(CODIGO_VIGENCIA_S));
      return { ...r, campos: undefined }; // la firma del paso no viaja al navegador por la respuesta
    }
    return r;
  }
  return abrirSesion(r.datos);
}

/** Campos `codigo` (6 dígitos) y `recordar` (casilla "recordar este dispositivo"). */
export async function verificarCodigoAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<never>> {
  const h = await headers();
  const jar = await cookies();
  const r = await verificarCodigo(
    jar.get(COOKIE_PASO)?.value,
    {
      codigo: formData.get("codigo"),
      recordarDispositivo: formData.has("recordar"),
    },
    h.get("user-agent") ?? undefined,
  );
  if (!r.ok) return r;
  if (r.datos.dispositivo)
    jar.set(
      COOKIE_DISPOSITIVO,
      r.datos.dispositivo.token,
      opcionesAuxiliar(r.datos.dispositivo.maxAgeS),
    );
  return abrirSesion(r.datos);
}

export async function reenviarCodigoAccion(): Promise<Resultado<{ ok: true }>> {
  return reenviarCodigo((await cookies()).get(COOKIE_PASO)?.value);
}

/** Campos `token` (de la URL), `clave` y `confirmacion`. Abre sesión y redirige. */
export async function crearClaveAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<never>> {
  const r = await crearClave({
    token: formData.get("token"),
    clave: formData.get("clave"),
    confirmacion: formData.get("confirmacion"),
  });
  if (!r.ok) return r;
  return abrirSesion(r.datos);
}

/** Campo `correo`. Responde igual exista o no la cuenta. */
export async function solicitarEnlaceAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<{ ok: true }>> {
  return solicitarEnlace({ correo: formData.get("correo") });
}

/** Campos `claveActual` y `claveNueva`. */
export async function cambiarClaveAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<{ ok: true }>> {
  return cambiarClave(await obtenerSesion(), {
    claveActual: formData.get("claveActual"),
    claveNueva: formData.get("claveNueva"),
  });
}

/** Campo `clave`. Deja la cookie que `exigirClaveReciente` reconoce durante 10 minutos. */
export async function confirmarClaveAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<{ ok: true }>> {
  const r = await confirmarClave(await obtenerSesion(), {
    clave: formData.get("clave"),
  });
  if (!r.ok) return r;
  (await cookies()).set(
    COOKIE_CONFIRMACION,
    r.datos.token,
    opcionesAuxiliar(r.datos.maxAgeS),
  );
  return { ok: true, datos: { ok: true } };
}

export async function cerrarSesionAccion(): Promise<void> {
  const jar = await cookies();
  const carga = leer(jar.get(COOKIE_SESION)?.value);
  jar.delete(COOKIE_SESION);
  jar.delete(COOKIE_CONFIRMACION);
  registrar("cuenta.sesion_cerrada", {
    actor: carga?.u,
    rol: carga?.r === "ADMIN" ? "admin" : "psicologo",
  });
  redirect("/ingresar");
}

/** "Cerrar mis sesiones" en Mi cuenta (y el botón del correo `aviso-ingreso`): cierra TODAS, también la de este
 *  navegador, y olvida los dispositivos de confianza. Redirige a /ingresar. */
export async function cerrarMisSesionesAccion(): Promise<void> {
  const sesion = await obtenerSesion();
  if (sesion) await cerrarSesiones(sesion.usuarioId);
  const jar = await cookies();
  jar.delete(COOKIE_SESION);
  jar.delete(COOKIE_CONFIRMACION);
  jar.delete(COOKIE_DISPOSITIVO);
  redirect("/ingresar");
}
