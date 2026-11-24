import { fallo, ok } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import {
  correoSuperusuario,
  exigirSuperusuario,
  permiteCuentasDePrueba,
} from "../cuentas/superusuario";
import type { Sesion } from "../permisos";

export const ALTA_CUENTA_PRUEBA = "CUENTA_PRUEBA_CREADA";

export async function idsCuentasDePrueba() {
  const filas = await bd.auditoria.findMany({
    where: { entidad: "Usuario", accion: ALTA_CUENTA_PRUEBA },
    select: { entidadId: true },
  });
  return filas.map((fila) => fila.entidadId);
}

/** Con `id` elimina una cuenta de prueba. Sin él limpia todas las cuentas de prueba sin citas. */
export async function limpiarCuentasDePrueba(
  sesion: Sesion | null,
  id?: string,
) {
  const permiso = await exigirSuperusuario(sesion);
  if (!permiso.ok) return permiso;
  if (!permiteCuentasDePrueba())
    return fallo(
      "SIN_PERMISO",
      "La limpieza de cuentas de prueba está deshabilitada en este entorno.",
    );

  const correoProtegido = correoSuperusuario() ?? "";
  const idIndividual = id ?? null;
  return bd.$transaction(async (tx) => {
    // El bloqueo impide que entre una cita nueva para una cuenta mientras se comprueba y elimina.
    const usuarios = await tx.$queryRaw<{ id: string }[]>`
      SELECT u."id" FROM "Usuario" u
      WHERE u."correo" <> ${correoProtegido}
        AND (CAST(${idIndividual} AS text) IS NULL OR u."id" = ${idIndividual})
        AND EXISTS (
          SELECT 1 FROM "Auditoria" a
          WHERE a."entidad" = 'Usuario' AND a."entidadId" = u."id"
            AND a."accion" = ${ALTA_CUENTA_PRUEBA}
        )
      ORDER BY u."id" FOR UPDATE OF u`;
    if (id && !usuarios.length)
      return fallo("NO_ENCONTRADO", "No encontramos esa cuenta de prueba.");
    const ids = usuarios.map((u) => u.id);
    const conCitas = new Set(
      (
        await tx.cita.findMany({
          where: { psicologoId: { in: ids } },
          distinct: ["psicologoId"],
          select: { psicologoId: true },
        })
      ).map((c) => c.psicologoId),
    );
    if (id && conCitas.has(id))
      return fallo(
        "TRANSICION_INVALIDA",
        "La cuenta tiene citas registradas. Puedes desactivarla para conservar su historial.",
      );
    const eliminables = ids.filter((usuarioId) => !conCitas.has(usuarioId));
    if (!eliminables.length)
      return ok({ eliminadas: 0, conCitas: conCitas.size });

    const porUsuario = { usuarioId: { in: eliminables } };
    const porPsicologo = { psicologoId: { in: eliminables } };
    const tokens = await tx.tokenAcceso.findMany({
      where: porUsuario,
      select: { id: true },
    });
    await tx.trabajo.deleteMany({
      where: {
        tipo: "CORREO",
        estado: { not: "EN_CURSO" },
        OR: [
          ...eliminables.map((usuarioId) => ({
            datos: { path: ["usuarioId"], equals: usuarioId },
          })),
          ...tokens.map(({ id }) => ({
            datos: { path: ["tokenId"], equals: id },
          })),
        ],
      },
    });
    await tx.tokenAcceso.deleteMany({ where: porUsuario });
    await tx.codigoAcceso.deleteMany({ where: porUsuario });
    await tx.dispositivoConfiable.deleteMany({ where: porUsuario });
    await tx.bloqueo.deleteMany({ where: porPsicologo });
    await tx.disponibilidad.deleteMany({ where: porPsicologo });
    await tx.perfilPsicologo.deleteMany({ where: porUsuario });
    const resultado = await tx.usuario.deleteMany({
      where: { id: { in: eliminables } },
    });
    await tx.auditoria.createMany({
      data: eliminables.map((entidadId) => ({
        usuarioId: permiso.datos.usuarioId,
        accion: "CUENTA_PRUEBA_ELIMINADA",
        entidad: "Usuario",
        entidadId,
      })),
    });
    if (!id)
      await auditar(
        {
          usuarioId: permiso.datos.usuarioId,
          accion: "CUENTAS_PRUEBA_LIMPIADAS",
          entidad: "Usuario",
          entidadId: "lote",
          detalle: { eliminadas: resultado.count, conCitas: conCitas.size },
        },
        tx,
      );
    return ok({ eliminadas: resultado.count, conCitas: conCitas.size });
  });
}
