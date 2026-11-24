// Consulta de cita por código (pie del sitio). El código se dicta por teléfono, así que NO es un secreto: no se muestra
// nada de la cita en pantalla; si existe y sigue vigente, el enlace privado va al correo que quedó en la cita.
// La respuesta es SIEMPRE la misma exista o no el código (no se puede averiguar qué citas existen).
import { z } from "zod";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { encolarPlantilla } from "../correo/enviar";
import { limitar } from "../limites";
import { despachar } from "./correos";

const HORA = 3_600_000;
const codigoSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^CAPL-[A-Z0-9]{4}$/);

export const MENSAJE_CONSULTA =
  "Si el código corresponde a una cita vigente, enviamos el enlace al correo con el que la pediste. Revisa también la carpeta de spam.";

export async function consultarCitaPorCodigo(
  entrada: unknown,
  {
    ip = "desconocida",
    ahora = new Date(),
  }: { ip?: string; ahora?: Date } = {},
): Promise<Resultado<{ mensaje: string }>> {
  const v = limitar("consultarCita", ip, ahora.getTime());
  if (!v.permitido)
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Hiciste varios intentos seguidos. Espera un momento e inténtalo de nuevo.",
    );
  const codigo = codigoSchema.safeParse(entrada);
  if (!codigo.success)
    return fallo("VALIDACION", "Escribe el código con el formato CAPL-0000.");
  const c = await bd.cita.findUnique({
    where: { codigo: codigo.data },
    select: { id: true, estado: true, fin: true, anonimizadaEn: true },
  });
  if (c && !c.anonimizadaEn && c.fin > ahora) {
    // Una vez por hora y cita: quien la consulte repetidamente no puede inundar el correo de la persona.
    const r = await encolarPlantilla(
      "enlace-cita",
      { citaId: c.id },
      { version: Math.floor(ahora.getTime() / HORA) },
    );
    if (r.creado) await despachar();
  }
  return ok({ mensaje: MENSAJE_CONSULTA });
}
