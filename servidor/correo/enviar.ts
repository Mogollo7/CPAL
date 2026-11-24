// Puertas de entrada para quien necesita enviar un correo de E06: encolar (lo normal) o enviar ya (código de ingreso).
import { bd } from "../bd";
import { cifrar } from "../citas/cifrado";
import { encolar, llaveCorreo } from "../cola";
import { enviarCorreo, type ResultadoEnvio } from "../externos/resend";
import { prepararCorreo, type Payloads } from "./preparar";
import type { NombrePlantilla } from "../../correos/indice";

/** Encola un correo por nombre de plantilla (E06) y payload de ids. Pasa `cliente` = la transacción del hecho que lo origina.
 *  `entidad` por defecto: el primer id del payload. `version` distingue envíos repetidos de lo mismo (p. ej. reenvío de invitación). */
export function encolarPlantilla<N extends NombrePlantilla>(
  plantilla: N,
  payload: Payloads[N],
  opciones: { entidad?: string; version?: string | number } = {},
  cliente: Pick<typeof bd, "trabajo"> = bd,
) {
  const p = payload as Record<string, unknown>;
  const entidad =
    opciones.entidad ??
    String(p.citaId ?? p.tokenId ?? p.inscripcionId ?? p.usuarioId);
  return encolar(
    {
      tipo: "CORREO",
      llave: llaveCorreo(plantilla, entidad, opciones.version),
      datos: {
        plantilla,
        ...p,
        ...(typeof p.token === "string" && { token: cifrar(p.token) }),
      },
      citaId: typeof p.citaId === "string" ? p.citaId : undefined,
    },
    cliente,
  );
}

/** Envío inmediato, sin cola (solo `codigo-ingreso`, E06). Si falla, quien llama ofrece reenviar. */
export async function enviarYa<N extends NombrePlantilla>(
  plantilla: N,
  payload: Payloads[N],
): Promise<ResultadoEnvio> {
  const c = await prepararCorreo(plantilla, payload);
  if (!c) return { ok: false, permanente: true, error: "SIN_DESTINATARIO" };
  return enviarCorreo(c);
}
