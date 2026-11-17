// Correos de cuentas. Las plantillas son de `correos/` y la carga de datos de `servidor/correo/` (otro dueño):
// aquí solo se decide cuál se manda y con qué ids. El token y el código en claro viajan en el trabajo y nunca en la BD de cuentas.
import { encolarCorreo } from "../cola";
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

// PENDIENTE(correos): E06 no tiene plantilla para avisar a los demás administradores del acceso de emergencia (S02).
// Mientras tanto va como texto mínimo ya renderizado; cuando exista `aviso-acceso-emergencia` en `correos/`, pasarlo a `encolarPlantilla`.
export const correoDeAvisoEmergencia = (
  adminId: string,
  correo: string,
  version: string,
) =>
  encolarCorreo({
    plantilla: "aviso-acceso-emergencia",
    entidad: adminId,
    version,
    correo: {
      para: correo,
      asunto: "Se creó un administrador por acceso de emergencia",
      texto:
        "Se creó un administrador del CAPL mediante el acceso de emergencia en el servidor. Si no lo esperabas, revisa la auditoría.",
      html: "<p>Se creó un administrador del CAPL mediante el acceso de emergencia en el servidor. Si no lo esperabas, revisa la auditoría.</p>",
    },
  });
