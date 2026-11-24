// Sesión propia en cookie firmada (HMAC-SHA256 con AUTH_SECRET). Sin estado en servidor: el token solo dice
// "este usuario, este rol, vence en tal momento". Si el usuario sigue activo y cuál es su rol se comprueba en la
// base de datos en cada carga (`obtenerSesion`), no se confía en el token para eso (E03 §7).
// Inactividad: 2 h para administradores, 8 h para psicólogos. Cada uso renueva el plazo (ver `renovada`).
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Rol } from "../permisos";

// S01: en producción la cookie lleva el prefijo `__Host-` (el navegador exige Secure, path "/" y sin Domain). En local no hay HTTPS, así que sin prefijo.
export const COOKIE_SESION =
  process.env.ENTORNO === "local" ? "capl_sesion" : "__Host-capl_sesion";
export const MAX_INACTIVIDAD_S: Record<Rol, number> = {
  ADMIN: 2 * 3600,
  PSICOLOGO: 8 * 3600,
};

// exp e iat: segundos desde 1970. `iat` (cuándo se inició la sesión) permite cerrar todas las sesiones de una persona.
export type Carga = {
  u: string;
  r: Rol;
  exp: number;
  iat?: number;
  inicioMs?: number;
};

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function secreto(): string {
  const s = process.env.AUTH_SECRET ?? "";
  if (s.length < 32)
    throw new Error(
      "AUTH_SECRET falta o es demasiado corta (mínimo 32 caracteres)",
    );
  return s;
}

const firma = (cuerpo: string, clave: string) =>
  createHmac("sha256", clave).update(cuerpo).digest();

export const ahoraS = () => Math.floor(Date.now() / 1000);

export const nuevaCarga = (u: string, r: Rol, segundos?: number): Carga => {
  const inicioMs = segundos === undefined ? Date.now() : segundos * 1000;
  const ahora = Math.floor(inicioMs / 1000);
  return {
    u,
    r,
    exp: ahora + MAX_INACTIVIDAD_S[r],
    iat: ahora,
    inicioMs,
  };
};

export function firmar(carga: Carga, clave = secreto()): string {
  const cuerpo = b64(JSON.stringify(carga));
  return `${cuerpo}.${b64(firma(cuerpo, clave))}`;
}

/** Devuelve la carga si la firma es válida y no venció; si no, `null`. Comparación en tiempo constante. */
export function leer(
  token: string | undefined,
  clave = secreto(),
  ahora = ahoraS(),
): Carga | null {
  const [cuerpo, f] = (token ?? "").split(".");
  if (!cuerpo || !f) return null;
  const esperada = firma(cuerpo, clave);
  const recibida = Buffer.from(f, "base64url");
  if (
    recibida.length !== esperada.length ||
    !timingSafeEqual(recibida, esperada)
  )
    return null;
  try {
    const c = JSON.parse(Buffer.from(cuerpo, "base64url").toString()) as Carga;
    const valida =
      typeof c.u === "string" &&
      (c.r === "ADMIN" || c.r === "PSICOLOGO") &&
      Number.isFinite(c.exp);
    return valida && c.exp > ahora ? c : null;
  } catch {
    return null;
  }
}

/** Renovación deslizante: si ya pasó la mitad del plazo, devuelve la carga con el plazo completo otra vez. */
export function renovada(c: Carga, ahora = ahoraS()): Carga | null {
  const max = MAX_INACTIVIDAD_S[c.r];
  return c.exp - ahora < max / 2 ? { ...c, exp: ahora + max } : null;
}

export const opcionesCookie = (r: Rol) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.ENTORNO !== "local",
  path: "/",
  maxAge: MAX_INACTIVIDAD_S[r],
});

/** Datos firmados de uso corto (paso 2 del ingreso, confirmación de contraseña). Siempre llevan `exp` en segundos. */
export function firmarDatos(
  d: { exp: number; t: string; u: string },
  clave = secreto(),
) {
  const cuerpo = b64(JSON.stringify(d));
  return `${cuerpo}.${b64(firma(cuerpo, clave))}`;
}

/** Devuelve los datos si la firma es válida y no vencieron; si no, `null`. El llamador comprueba `t` (el tipo). */
export function leerDatos<T extends { exp: number }>(
  token: string | undefined,
  clave = secreto(),
  ahora = ahoraS(),
): T | null {
  const [cuerpo, f] = (token ?? "").split(".");
  if (!cuerpo || !f) return null;
  const esperada = firma(cuerpo, clave);
  const recibida = Buffer.from(f, "base64url");
  if (
    recibida.length !== esperada.length ||
    !timingSafeEqual(recibida, esperada)
  )
    return null;
  try {
    const d = JSON.parse(Buffer.from(cuerpo, "base64url").toString()) as T;
    return Number.isFinite(d.exp) && d.exp > ahora ? d : null;
  } catch {
    return null;
  }
}
