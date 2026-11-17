// Acceso de emergencia (T-219, S02): crea un administrador y le envía su enlace. Solo lo llama `scripts/admin-crear.ts`,
// que corre en la consola del servidor; no hay ruta web que lo exponga. Queda en auditoría como acción de Operación
// (usuarioId vacío) y avisa a los demás administradores activos.
import { z } from "zod";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { registrar } from "../registro";
import { correoDeAvisoEmergencia, correoDeEnlace } from "./correos";
import { generarEnlace } from "./enlaces";

const entradaSchema = z.object({
  correo: z.string().trim().toLowerCase().max(120).pipe(z.email()),
  nombre: z.string().trim().min(2).max(120),
});

export async function crearAdminEmergencia(
  entrada: unknown,
): Promise<Resultado<{ usuarioId: string; reemitido: boolean }>> {
  const datos = entradaSchema.safeParse(entrada);
  if (!datos.success)
    return fallo("VALIDACION", "Faltan --correo o --nombre válidos.");
  const { correo, nombre } = datos.data;

  // Mismo criterio que crear psicólogos (E03 §7): el correo debe pertenecer a `dominiosPermitidos`; vacía + producción = rechazo.
  const config = await bd.configuracion.findUnique({ where: { id: 1 } });
  const dominios = config?.dominiosPermitidos ?? [];
  const dominio = correo.split("@")[1];
  if (
    dominios.length
      ? !dominios.includes(dominio)
      : process.env.ENTORNO === "produccion"
  )
    return fallo(
      "CORREO_NO_PERMITIDO",
      "El correo no pertenece a un dominio permitido.",
    );

  const existente = await bd.usuario.findUnique({ where: { correo } });
  if (existente && existente.rol !== "ADMIN")
    return fallo(
      "CORREO_EN_USO",
      "Ese correo ya es de un psicólogo; no se convierte en administrador por aquí.",
    );

  // Si ya existía como administrador (incluso desactivado) se reactiva y se le reenvía el enlace.
  const u = existente
    ? await bd.usuario.update({
        where: { id: existente.id },
        data: { activo: true },
      })
    : await bd.usuario.create({ data: { correo, nombre, rol: "ADMIN" } });

  const enlace = await generarEnlace(u.id, "INVITACION");
  await correoDeEnlace("invitacion", enlace.id, enlace.token);

  const otros = await bd.usuario.findMany({
    where: { rol: "ADMIN", activo: true, id: { not: u.id } },
    select: { id: true },
  });
  for (const a of otros) await correoDeAvisoEmergencia(a.id, u.id);

  await auditar({
    usuarioId: null, // Operación: quien tiene la consola del servidor, sin cuenta en la aplicación
    accion: "ADMIN_ACCESO_EMERGENCIA",
    entidad: "Usuario",
    entidadId: u.id,
    detalle: {
      origen: "consola",
      reemitido: !!existente,
      avisados: otros.length,
    },
  });
  registrar("admin.acceso_emergencia", { rol: "sistema", resultado: "ok" });
  return ok({ usuarioId: u.id, reemitido: !!existente });
}
