// Invitación por correo: crea el enlace para definir la contraseña y lo encola (RF-ADM-01, RF-AUT-02, P-06).
// El token en claro SOLO viaja en el correo; en la base queda su SHA-256 (E02).
import { randomBytes } from "node:crypto";
import { encolarPlantilla } from "../correo/enviar";
import { hashToken } from "../cuentas/enlaces";
import type { bd } from "../bd";
import { configuracionActual } from "../centro/configuracion";

type Tx = Pick<typeof bd, "tokenAcceso" | "trabajo" | "configuracion">;
type Invitado = {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "PSICOLOGO";
};

// Igual que `generarEnlace` de cuentas, pero dentro de la transacción del alta (el usuario aún no está confirmado).

/** Deja vigente un solo enlace por persona: los anteriores sin usar se marcan usados (reenviar invalida el viejo). */
export async function crearTokenInvitacion(
  usuarioId: string,
  horas: number,
  tx: Pick<typeof bd, "tokenAcceso">,
): Promise<{ token: string; id: string }> {
  await tx.tokenAcceso.updateMany({
    where: { usuarioId, tipo: "INVITACION", usadoEn: null },
    data: { usadoEn: new Date() },
  });
  const token = randomBytes(32).toString("base64url");
  const fila = await tx.tokenAcceso.create({
    data: {
      usuarioId,
      tipo: "INVITACION",
      tokenHash: hashToken(token),
      venceEn: new Date(Date.now() + horas * 3_600_000),
    },
  });
  return { token, id: fila.id };
}

/** Crea el enlace y encola el correo `invitacion` (E06) dentro de la misma transacción del alta o del reenvío. */
export async function enviarInvitacion(u: Invitado, tx: Tx): Promise<void> {
  const { duracionEnlaceHoras } = await configuracionActual(tx);
  const { token, id } = await crearTokenInvitacion(
    u.id,
    duracionEnlaceHoras,
    tx,
  );
  // Una llave por enlace emitido: cada reenvío es un correo nuevo.
  await encolarPlantilla(
    "invitacion",
    { tokenId: id, token },
    { entidad: id },
    tx,
  );
}
