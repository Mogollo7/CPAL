// Enlaces de acceso para crear o recuperar contraseña (E03 §6). En la BD solo vive el SHA-256 del token.
import { createHash, randomBytes } from "node:crypto";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import type { TipoToken } from "../generado/enums";

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const HORAS_POR_DEFECTO = 48;

/** Vigencia configurada (`duracionEnlaceHoras`, 24–48 h). */
export async function duracionEnlaceHoras(): Promise<number> {
  const c = await bd.configuracion.findUnique({
    where: { id: 1 },
    select: { duracionEnlaceHoras: true },
  });
  return c?.duracionEnlaceHoras ?? HORAS_POR_DEFECTO;
}

/** Crea un enlace nuevo e invalida los anteriores sin usar del mismo tipo para ese usuario (en una transacción). */
export async function generarEnlace(
  usuarioId: string,
  tipo: TipoToken,
  ahora = new Date(),
): Promise<{ token: string; id: string; venceEn: Date; horas: number }> {
  const horas = await duracionEnlaceHoras();
  const token = randomBytes(32).toString("base64url");
  const venceEn = new Date(ahora.getTime() + horas * 3_600_000);
  const [, creado] = await bd.$transaction([
    bd.tokenAcceso.updateMany({
      where: { usuarioId, tipo, usadoEn: null },
      data: { usadoEn: ahora }, // reemitido = ya no sirve
    }),
    bd.tokenAcceso.create({
      data: { usuarioId, tipo, tokenHash: hashToken(token), venceEn },
    }),
  ]);
  return { token, id: creado.id, venceEn, horas };
}

export type EnlaceValido = {
  id: string;
  usuarioId: string;
  nombre: string;
  tipo: TipoToken;
};

/** Se puede abrir las veces que sea mientras esté vigente y sin usar (D-06). No lo consume. */
export async function validarEnlace(
  token: unknown,
  ahora = new Date(),
): Promise<Resultado<EnlaceValido>> {
  const invalido = fallo("ENLACE_INVALIDO", "Este enlace no es válido.");
  if (typeof token !== "string" || !token || token.length > 200)
    return invalido;
  const t = await bd.tokenAcceso.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: { select: { nombre: true, activo: true } } },
  });
  if (!t || t.usadoEn || !t.usuario.activo) return invalido;
  if (t.venceEn <= ahora)
    return fallo(
      "ENLACE_VENCIDO",
      "Este enlace venció. Escribe tu correo para pedir otro.",
    );
  return ok({
    id: t.id,
    usuarioId: t.usuarioId,
    nombre: t.usuario.nombre,
    tipo: t.tipo,
  });
}

/** Marca el enlace como usado. `false` si otro lo consumió antes o ya venció (carrera). */
export async function consumirEnlace(
  id: string,
  ahora = new Date(),
  cliente: Pick<typeof bd, "tokenAcceso"> = bd,
): Promise<boolean> {
  const r = await cliente.tokenAcceso.updateMany({
    where: { id, usadoEn: null, venceEn: { gt: ahora } },
    data: { usadoEn: ahora },
  });
  return r.count === 1;
}
