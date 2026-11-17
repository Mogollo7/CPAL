// Ingreso con correo y contraseña (RF-AUT-01, E03 §7). No toca cookies: devuelve el token y la acción de servidor lo guarda.
import { ingresoSchema } from "../../contratos/cuenta";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { consultar, limitar, olvidar } from "../limites";
import type { Rol } from "../permisos";
import { redTruncada, registrar } from "../registro";
import { verificarClave, verificarContraRelleno } from "./clave";
import { dispositivoConfiable, enviarCodigo, firmarPaso } from "./segundoPaso";
import { firmar, MAX_INACTIVIDAD_S, nuevaCarga } from "./sesion";

const MENSAJE = "Correo o contraseña incorrectos"; // siempre el mismo, exista o no el correo
// Igual exista o no la cuenta: el contador diario se lleva por correo, también para correos sin cuenta.
const BLOQUEADA = fallo(
  "DEMASIADOS_INTENTOS",
  "Por seguridad, esta cuenta necesita una contraseña nueva. Usa «Olvidé mi contraseña».",
);

export type SesionIniciada = {
  token: string;
  rol: Rol;
  maxAgeS: number;
  usuarioId: string;
};

/** `dispositivo`: valor de la cookie `capl_dispositivo`. Un administrador sin dispositivo de confianza recibe
 *  `CODIGO_REQUERIDO` con `campos.paso` = valor para la cookie `capl_paso` (T-217). */
export async function ingresar(
  entrada: unknown,
  red: string,
  dispositivo?: string,
): Promise<Resultado<SesionIniciada>> {
  const datos = ingresoSchema.safeParse(entrada);
  if (!datos.success) return fallo("CREDENCIALES", MENSAJE);
  const { correo, clave } = datos.data;
  const quien = `${correo}|${red}`; // 5 fallidos por correo y dirección de red

  const espera = consultar("ingreso", quien);
  if (!espera.permitido) {
    registrar("cuenta.bloqueada", {
      nivel: "aviso",
      rol: "publico",
      red: redTruncada(red),
    });
    return fallo(
      "DEMASIADOS_INTENTOS",
      `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(espera.esperaSeg / 60)} minutos.`,
    );
  }

  const u = await bd.usuario.findUnique({ where: { correo } });
  // 15 fallos en un día (S02): no se entra ni con la contraseña correcta hasta crear una nueva por enlace.
  if (u?.bloqueadaEn || !consultar("ingresoDia", correo).permitido) {
    registrar("cuenta.bloqueada", {
      nivel: "aviso",
      rol: "publico",
      red: redTruncada(red),
      resultado: "dia",
    });
    return BLOQUEADA;
  }
  // Se verifica SIEMPRE (contra un hash de relleno si no hay cuenta) para no revelar qué correos existen por el tiempo de respuesta.
  const claveOk = u?.claveHash
    ? await verificarClave(u.claveHash, clave)
    : await verificarContraRelleno(clave);

  if (!u || !u.activo || !u.claveHash || !claveOk) {
    limitar("ingreso", quien); // solo los fallos cuentan
    limitar("ingresoDia", correo);
    if (u && !consultar("ingresoDia", correo).permitido)
      await bd.usuario.update({
        where: { id: u.id },
        data: { bloqueadaEn: new Date() }, // sobrevive a un reinicio de la aplicación
      });
    registrar("cuenta.ingreso_fallido", {
      nivel: "aviso",
      rol: "publico",
      red: redTruncada(red),
      resultado: "CREDENCIALES",
    });
    return fallo("CREDENCIALES", MENSAJE);
  }

  olvidar("ingreso", quien);
  olvidar("ingresoDia", correo);
  if (u.rol === "ADMIN" && !(await dispositivoConfiable(u.id, dispositivo))) {
    await enviarCodigo(u);
    return fallo("CODIGO_REQUERIDO", "Te enviamos un código a tu correo.", {
      paso: firmarPaso(u.id),
    });
  }
  await bd.usuario.update({
    where: { id: u.id },
    data: { ultimoIngreso: new Date() },
  });
  registrar("cuenta.ingreso", {
    rol: u.rol === "ADMIN" ? "admin" : "psicologo",
    actor: u.id,
    resultado: "ok",
  });
  return ok({
    token: firmar(nuevaCarga(u.id, u.rol)),
    rol: u.rol,
    maxAgeS: MAX_INACTIVIDAD_S[u.rol],
    usuarioId: u.id,
  });
}
