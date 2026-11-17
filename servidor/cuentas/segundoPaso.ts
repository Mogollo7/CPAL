// Segundo paso de ingreso de administradores (T-217, RF-AUT-08, S02): código de 6 dígitos al correo,
// dispositivo de confianza 30 días y aviso de ingreso.
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { codigoSchema } from "../../contratos/cuenta";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { limitar } from "../limites";
import { registrar } from "../registro";
import { correoDeAvisoIngreso, correoDeCodigo } from "./correos";
import { hashToken } from "./enlaces";
import type { SesionIniciada } from "./ingresar";
import {
  ahoraS,
  firmar,
  firmarDatos,
  leerDatos,
  MAX_INACTIVIDAD_S,
  nuevaCarga,
  secreto,
} from "./sesion";

export const COOKIE_PASO = "capl_paso";
export const COOKIE_DISPOSITIVO = "capl_dispositivo";
export const CODIGO_VIGENCIA_S = 10 * 60;
export const MAX_INTENTOS_CODIGO = 5;
export const DISPOSITIVO_DIAS = 30;
export const ESPERA_REENVIO_S = 60;

const REINGRESAR = "Vuelve a ingresar tu correo y contraseña.";

// Paso intermedio: contraseña ya verificada, falta el código (cookie firmada de 10 min).
type Paso = { t: "paso2"; u: string; exp: number };
export const firmarPaso = (usuarioId: string, ahora = ahoraS()) =>
  firmarDatos({
    t: "paso2",
    u: usuarioId,
    exp: ahora + CODIGO_VIGENCIA_S,
  } satisfies Paso);
export function leerPaso(
  token: string | undefined,
  ahora = ahoraS(),
): string | null {
  const d = leerDatos<Paso>(token, secreto(), ahora);
  return d?.t === "paso2" && typeof d.u === "string" ? d.u : null;
}

// El código tiene solo 1 000 000 de valores: se guarda un HMAC con AUTH_SECRET y el usuario, no un SHA-256 simple.
const hashCodigo = (usuarioId: string, codigo: string) =>
  createHmac("sha256", secreto())
    .update(`${usuarioId}:${codigo}`)
    .digest("hex");

/** Genera un código nuevo (el anterior deja de servir) y lo manda al instante. `false` si el correo no salió: ofrecer reenviar. */
export async function enviarCodigo(
  u: { id: string },
  ahora = new Date(),
): Promise<boolean> {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await bd.$transaction([
    bd.codigoAcceso.updateMany({
      where: { usuarioId: u.id, usadoEn: null },
      data: { usadoEn: ahora },
    }),
    bd.codigoAcceso.create({
      data: {
        usuarioId: u.id,
        codigoHash: hashCodigo(u.id, codigo),
        venceEn: new Date(ahora.getTime() + CODIGO_VIGENCIA_S * 1000),
        creadoEn: ahora,
      },
    }),
  ]);
  const enviado = await correoDeCodigo(u.id, codigo);
  registrar("cuenta.codigo_enviado", {
    rol: "admin",
    actor: u.id,
    resultado: enviado ? "ok" : "ERROR_ENVIO",
  });
  return enviado;
}

/** ¿Este navegador es de confianza para este usuario? (cookie `capl_dispositivo`) */
export async function dispositivoConfiable(
  usuarioId: string,
  token: string | undefined,
  ahora = new Date(),
): Promise<boolean> {
  if (!token) return false;
  const d = await bd.dispositivoConfiable.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  return !!d && d.usuarioId === usuarioId && d.venceEn > ahora;
}

export type SesionConDispositivo = SesionIniciada & {
  dispositivo?: { token: string; maxAgeS: number };
};

/** Comprueba el código del paso 2. `paso` es el valor de la cookie `capl_paso`. */
export async function verificarCodigo(
  paso: string | undefined,
  entrada: unknown,
  navegador = "Navegador desconocido",
  ahora = new Date(),
): Promise<Resultado<SesionConDispositivo>> {
  const usuarioId = leerPaso(paso);
  if (!usuarioId) return fallo("NO_AUTENTICADO", REINGRESAR);
  const datos = codigoSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("CODIGO_INVALIDO", "El código tiene 6 dígitos.");

  const u = await bd.usuario.findUnique({ where: { id: usuarioId } });
  if (!u || !u.activo || u.rol !== "ADMIN")
    return fallo("NO_AUTENTICADO", REINGRESAR);

  const c = await bd.codigoAcceso.findFirst({
    where: { usuarioId, usadoEn: null, venceEn: { gt: ahora } },
    orderBy: { creadoEn: "desc" },
  });
  if (!c) return fallo("CODIGO_INVALIDO", "El código venció. Pide uno nuevo.");
  if (c.intentos >= MAX_INTENTOS_CODIGO)
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Demasiados intentos. Pide un código nuevo.",
    );

  const esperado = Buffer.from(c.codigoHash, "hex");
  const recibido = Buffer.from(hashCodigo(usuarioId, datos.data.codigo), "hex");
  if (!timingSafeEqual(esperado, recibido)) {
    await bd.codigoAcceso.update({
      where: { id: c.id },
      data: { intentos: { increment: 1 } },
    });
    registrar("cuenta.codigo_fallido", {
      nivel: "aviso",
      rol: "admin",
      actor: usuarioId,
    });
    return fallo("CODIGO_INVALIDO", "El código no es correcto.");
  }

  // Un solo uso: si dos peticiones lo envían a la vez, solo una gana.
  const gasto = await bd.codigoAcceso.updateMany({
    where: { id: c.id, usadoEn: null },
    data: { usadoEn: ahora },
  });
  if (gasto.count !== 1)
    return fallo("CODIGO_INVALIDO", "El código ya se usó.");

  let dispositivo: SesionConDispositivo["dispositivo"];
  if (datos.data.recordarDispositivo) {
    const token = randomBytes(32).toString("base64url");
    const maxAgeS = DISPOSITIVO_DIAS * 86_400;
    await bd.dispositivoConfiable.create({
      data: {
        usuarioId,
        tokenHash: hashToken(token),
        venceEn: new Date(ahora.getTime() + maxAgeS * 1000),
        navegador: navegador.slice(0, 120),
      },
    });
    dispositivo = { token, maxAgeS };
  }
  await bd.usuario.update({
    where: { id: usuarioId },
    data: { ultimoIngreso: ahora },
  });

  // Aviso de ingreso: si hizo falta el código, el dispositivo era nuevo.
  await correoDeAvisoIngreso(u.id, c.id, navegador.slice(0, 120), ahora);
  registrar("cuenta.dispositivo_nuevo", { rol: "admin", actor: usuarioId });
  registrar("cuenta.ingreso", {
    rol: "admin",
    actor: usuarioId,
    resultado: "ok",
  });

  return ok({
    token: firmar(nuevaCarga(u.id, u.rol)),
    rol: u.rol,
    maxAgeS: MAX_INACTIVIDAD_S[u.rol],
    usuarioId: u.id,
    dispositivo,
  });
}

/** Reenvío: tras 60 s del último código y máximo 3 por hora (S02). */
export async function reenviarCodigo(
  paso: string | undefined,
  ahora = new Date(),
): Promise<Resultado<{ ok: true }>> {
  const usuarioId = leerPaso(paso);
  const u = usuarioId
    ? await bd.usuario.findUnique({ where: { id: usuarioId } })
    : null;
  if (!u || !u.activo || u.rol !== "ADMIN")
    return fallo("NO_AUTENTICADO", REINGRESAR);
  const ultimo = await bd.codigoAcceso.findFirst({
    where: { usuarioId: u.id },
    orderBy: { creadoEn: "desc" },
  });
  if (
    ultimo &&
    ahora.getTime() - ultimo.creadoEn.getTime() < ESPERA_REENVIO_S * 1000
  )
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Espera un minuto antes de pedir otro código.",
    );
  const lim = limitar("reenviarCodigo", u.id, ahora.getTime());
  if (!lim.permitido)
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Pediste demasiados códigos. Intenta más tarde.",
    );
  return (await enviarCodigo(u, ahora))
    ? ok({ ok: true })
    : fallo(
        "SERVICIO_NO_DISPONIBLE",
        "No pudimos enviar el código. Intenta de nuevo.",
      );
}

/** "Cerrar mis sesiones" en lo que toca al segundo paso: olvida todos los dispositivos de confianza. */
export const olvidarDispositivos = (usuarioId: string) =>
  bd.dispositivoConfiable.deleteMany({ where: { usuarioId } });
