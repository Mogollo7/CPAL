// Firma de los avisos de Resend (S04). Resend firma con Svix: HMAC-SHA256 de `id.marca.cuerpo` con el secreto `whsec_…`
// (en base64). Se comprueba a mano para no sumar dependencias.
import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCIA_S = 5 * 60;

export type Cabeceras = { id: string; marca: string; firma: string };

export function firmaValida(
  c: Cabeceras,
  cuerpo: string,
  secreto: string,
  ahora = Date.now(),
): boolean {
  if (!secreto || !c.id || !c.marca || !c.firma) return false;
  const marca = Number(c.marca);
  if (!Number.isFinite(marca) || Math.abs(ahora / 1000 - marca) > TOLERANCIA_S)
    return false; // demasiado vieja (o del futuro)
  const clave = Buffer.from(secreto.replace(/^whsec_/, ""), "base64");
  const esperada = createHmac("sha256", clave)
    .update(`${c.id}.${c.marca}.${cuerpo}`)
    .digest();
  // La cabecera puede traer varias firmas: "v1,abc v1,def".
  return c.firma.split(" ").some((f) => {
    const dada = Buffer.from(f.split(",")[1] ?? "", "base64");
    return dada.length === esperada.length && timingSafeEqual(dada, esperada);
  });
}
