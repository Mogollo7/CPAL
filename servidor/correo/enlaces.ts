// Enlace para gestionar una cita sin cuenta (E03 §6): `/cita/{id}.{firma}`, firma = HMAC-SHA256 del id con una clave
// derivada de AUTH_SECRET. No se guarda nada: el mismo enlace se regenera para el recordatorio.
// SUPUESTO: derivación de la clave = HMAC(AUTH_SECRET, "enlace-cita"). Quien construya la pantalla `/cita/[enlace]`
// debe usar `citaDeEnlace()` de aquí para que ambos lados coincidan.
import { createHmac, timingSafeEqual } from "node:crypto";

const clave = () =>
  createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update("enlace-cita")
    .digest();

export const firmaCita = (citaId: string) =>
  createHmac("sha256", clave()).update(citaId).digest("base64url");

/** Ruta relativa para el botón de los correos. */
export const rutaCita = (citaId: string) =>
  `/cita/${citaId}.${firmaCita(citaId)}`;

/** `abc.firma` → id de la cita, o null si la firma no coincide (sin revelar si la cita existe). */
export function citaDeEnlace(enlace: string): string | null {
  const i = enlace.lastIndexOf(".");
  if (i < 1) return null;
  const id = enlace.slice(0, i);
  const dada = Buffer.from(enlace.slice(i + 1));
  const buena = Buffer.from(firmaCita(id));
  return dada.length === buena.length && timingSafeEqual(dada, buena)
    ? id
    : null;
}
