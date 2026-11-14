"use server";
// Acciones de servidor de la sesión. Brand las conecta a los formularios de /ingresar y al botón "Cerrar sesión".
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Resultado } from "../../contratos/resultado";
import { registrar } from "../registro";
import { ingresar } from "./ingresar";
import { COOKIE_SESION, leer, opcionesCookie } from "./sesion";

const INICIO = {
  ADMIN: "/panel/admin/citas",
  PSICOLOGO: "/panel/psicologo/citas",
} as const;

/** Uso: `<form action={ingresarAccion}>` con campos `correo` y `clave`. Si falla devuelve el error; si entra, redirige. */
export async function ingresarAccion(
  _previo: unknown,
  formData: FormData,
): Promise<Resultado<never>> {
  const red =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ||
    "desconocida";
  const r = await ingresar(
    { correo: formData.get("correo"), clave: formData.get("clave") },
    red,
  );
  if (!r.ok) return r;
  (await cookies()).set(
    COOKIE_SESION,
    r.datos.token,
    opcionesCookie(r.datos.rol),
  );
  redirect(INICIO[r.datos.rol]);
}

export async function cerrarSesionAccion(): Promise<void> {
  const jar = await cookies();
  const carga = leer(jar.get(COOKIE_SESION)?.value);
  jar.delete(COOKIE_SESION);
  registrar("cuenta.sesion_cerrada", {
    actor: carga?.u,
    rol: carga?.r === "ADMIN" ? "admin" : "psicologo",
  });
  redirect("/ingresar");
}
