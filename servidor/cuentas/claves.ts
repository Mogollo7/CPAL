// Crear, recuperar y cambiar contraseña (RF-AUT-02, 03, 04; E05 «Cuenta»).
import {
  cambiarClaveSchema,
  crearClaveSchema,
  solicitarEnlaceSchema,
} from "../../contratos/cuenta";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { limitar, olvidar } from "../limites";
import { exigir, type Sesion } from "../permisos";
import { registrar } from "../registro";
import { hashClave, verificarClave } from "./clave";
import { correoDeEnlace } from "./correos";
import { consumirEnlace, generarEnlace, validarEnlace } from "./enlaces";
import type { SesionIniciada } from "./ingresar";
import { errorDeClave } from "./politicaClave";
import { firmar, MAX_INACTIVIDAD_S, nuevaCarga } from "./sesion";

const camposDe = (e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  Object.fromEntries(
    e.issues.map((i) => [String(i.path[0] ?? "clave"), i.message]),
  );

/** Crea la contraseña con un enlace de invitación o recuperación vigente y abre sesión. */
export async function crearClave(
  entrada: unknown,
  ahora = new Date(),
): Promise<Resultado<SesionIniciada>> {
  const datos = crearClaveSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("VALIDACION", "Revisa los datos.", camposDe(datos.error));
  const enlace = await validarEnlace(datos.data.token, ahora);
  if (!enlace.ok) return enlace;

  const u = await bd.usuario.findUnique({
    where: { id: enlace.datos.usuarioId },
    select: { id: true, correo: true, rol: true },
  });
  if (!u) return fallo("ENLACE_INVALIDO", "Este enlace no es válido.");
  const mala = errorDeClave(datos.data.clave, u.correo);
  if (mala) return fallo("VALIDACION", mala, { clave: mala });

  const claveHash = await hashClave(datos.data.clave);
  const hecho = await bd.$transaction(async (tx) => {
    const vigentes = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Usuario" WHERE "id" = ${u.id} AND "activo" = true FOR UPDATE`;
    if (!vigentes.length) return false;
    if (!(await consumirEnlace(enlace.datos.id, ahora, tx))) return false;
    await tx.codigoAcceso.deleteMany({ where: { usuarioId: u.id } });
    // Cualquier otro enlace pendiente del usuario deja de servir; los dispositivos de confianza se olvidan (S02).
    await tx.tokenAcceso.updateMany({
      where: { usuarioId: u.id, usadoEn: null },
      data: { usadoEn: ahora },
    });
    await tx.dispositivoConfiable.deleteMany({ where: { usuarioId: u.id } });
    await tx.usuario.update({
      where: { id: u.id },
      data: {
        claveHash,
        sesionesDesde: ahora,
        ultimoIngreso: ahora,
        bloqueadaEn: null,
      },
    });
    return true;
  });
  if (!hecho) return fallo("ENLACE_INVALIDO", "Este enlace no es válido.");
  olvidar("ingresoDia", u.correo); // contraseña nueva: se levanta el bloqueo por fallos del día

  registrar("cuenta.clave_creada", {
    rol: u.rol === "ADMIN" ? "admin" : "psicologo",
    actor: u.id,
    resultado: "ok",
  });
  // La persona demostró controlar su correo con el enlace: abre sesión directa, también si es administradora.
  return ok({
    token: firmar(nuevaCarga(u.id, u.rol)),
    rol: u.rol,
    maxAgeS: MAX_INACTIVIDAD_S[u.rol],
    usuarioId: u.id,
  });
}

/** Responde SIEMPRE `{ ok: true }` exista o no el correo (E03 §6). Solo falla por exceso de solicitudes o correo mal escrito. */
export async function solicitarEnlace(
  entrada: unknown,
): Promise<Resultado<{ ok: true }>> {
  const datos = solicitarEnlaceSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("VALIDACION", "Escribe un correo válido.", {
      correo: "Correo no válido",
    });
  const { correo } = datos.data;

  const espera = limitar("solicitarEnlace", correo);
  if (!espera.permitido)
    return fallo(
      "DEMASIADOS_INTENTOS",
      `Demasiadas solicitudes. Vuelve a intentarlo en ${Math.ceil(espera.esperaSeg / 60)} minutos.`,
    );

  registrar("cuenta.enlace_solicitado", { rol: "publico" });
  const u = await bd.usuario.findUnique({ where: { correo } });
  // ponytail: la rama "existe" hace más trabajo que la otra; si se quiere igualar el tiempo, hacerlo fuera de la petición.
  if (u?.activo) {
    const invitacion = !u.claveHash; // aún no creó su contraseña: se reenvía la invitación
    const e = await generarEnlace(
      u.id,
      invitacion ? "INVITACION" : "RECUPERACION",
    );
    await correoDeEnlace(
      invitacion ? "invitacion" : "recuperar-clave",
      e.id,
      e.token,
    );
  }
  return ok({ ok: true });
}

/** Cambia la contraseña de la sesión actual. Pide la actual y olvida los dispositivos de confianza. */
export async function cambiarClave(
  sesion: Sesion | null,
  entrada: unknown,
): Promise<Resultado<{ ok: true }>> {
  const permiso = exigir(sesion, ["ADMIN", "PSICOLOGO"]);
  if (!permiso.ok) return permiso;
  const datos = cambiarClaveSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("VALIDACION", "Revisa los datos.", camposDe(datos.error));

  const u = await bd.usuario.findUniqueOrThrow({
    where: { id: permiso.datos.usuarioId },
  });
  const espera = limitar("ingreso", `cambiar|${u.id}`); // cada intento cuenta; mismos 5 que el ingreso
  if (!espera.permitido)
    return fallo(
      "DEMASIADOS_INTENTOS",
      "Demasiados intentos. Espera un momento.",
    );
  if (
    !u.claveHash ||
    !(await verificarClave(u.claveHash, datos.data.claveActual))
  )
    return fallo("CREDENCIALES", "La contraseña actual no es correcta.", {
      claveActual: "No es correcta",
    });
  const mala = errorDeClave(datos.data.claveNueva, u.correo);
  if (mala) return fallo("VALIDACION", mala, { claveNueva: mala });

  const claveHash = await hashClave(datos.data.claveNueva);
  await bd.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: u.id, claveHash: u.claveHash },
      data: { claveHash, sesionesDesde: new Date() },
    });
    await tx.tokenAcceso.updateMany({
      where: { usuarioId: u.id, usadoEn: null },
      data: { usadoEn: new Date() },
    });
    await tx.codigoAcceso.deleteMany({ where: { usuarioId: u.id } });
    await tx.dispositivoConfiable.deleteMany({ where: { usuarioId: u.id } });
    if (u.rol === "ADMIN")
      await auditar(
        {
          usuarioId: u.id,
          accion: "CLAVE_CAMBIADA",
          entidad: "Usuario",
          entidadId: u.id,
        },
        tx,
      );
  });
  return ok({ ok: true });
}

/** "Cerrar mis sesiones" (S02): invalida toda sesión ya iniciada de esa persona, en cualquier dispositivo, y olvida
 *  sus dispositivos de confianza. La acción de servidor borra además las cookies de este navegador. */
export async function cerrarSesiones(usuarioId: string, ahora = new Date()) {
  await bd.$transaction([
    bd.usuario.update({
      where: { id: usuarioId },
      data: { sesionesDesde: ahora },
    }),
    bd.dispositivoConfiable.deleteMany({ where: { usuarioId } }),
  ]);
  registrar("cuenta.sesion_cerrada", { actor: usuarioId, resultado: "todas" });
}
