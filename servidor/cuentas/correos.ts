// Correos de cuentas. Las plantillas son de `correos/` y la carga de datos de `servidor/correo/` (otro dueño):
// aquí solo se decide cuál se manda y con qué ids. El token y el código en claro viajan en el trabajo y nunca en la BD de cuentas.
import { encolarPlantilla, enviarYa } from "../correo/enviar";

/** `invitacion` (cuenta sin contraseña) o `recuperar-clave`. Una llave por enlace emitido (`tokenId`). */
export const correoDeEnlace = (
  plantilla: "invitacion" | "recuperar-clave",
  tokenId: string,
  token: string,
) => encolarPlantilla(plantilla, { tokenId, token }, { entidad: tokenId });

/** `codigo-ingreso`: único correo que NO espera la cola (E06). `false` si no salió: la pantalla ofrece reenviar. */
export async function correoDeCodigo(
  usuarioId: string,
  codigo: string,
): Promise<boolean> {
  return (await enviarYa("codigo-ingreso", { usuarioId, codigo })).ok;
}

/** `aviso-ingreso`: una vez por código verificado (`codigoId`). */
export const correoDeAvisoIngreso = (
  usuarioId: string,
  codigoId: string,
  navegador: string,
  cuando: Date,
) =>
  encolarPlantilla(
    "aviso-ingreso",
    { usuarioId, navegador, cuando: cuando.toISOString() },
    { entidad: usuarioId, version: codigoId },
  );

/** Aviso a otro administrador de que se creó una cuenta por el acceso de emergencia (S02). Una llave por cuenta creada. */
export const correoDeAvisoEmergencia = (
  adminId: string,
  nuevoAdminId: string,
) =>
  encolarPlantilla(
    "aviso-acceso-emergencia",
    { usuarioId: adminId, nuevoAdminId },
    { entidad: adminId, version: nuevoAdminId },
  );
