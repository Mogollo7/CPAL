import { bd } from "../bd";
import { exigir, type Sesion } from "../permisos";
import { fallo } from "../../contratos/resultado";

export function correoSuperusuario() {
  const configurado = process.env.SUPERUSUARIO_CORREO?.trim().toLowerCase();
  if (configurado) return configurado;
  if (process.env.ENTORNO === "local")
    return (
      process.env.ADMIN_INICIAL_CORREO?.trim().toLowerCase() ||
      "admin@ejemplo.test"
    );
}

export const permiteCuentasDePrueba = () =>
  process.env.ENTORNO === "local" || process.env.ENTORNO === "pruebas";

export async function exigirSuperusuario(sesion: Sesion | null | undefined) {
  const permiso = exigir(sesion, "ADMIN");
  if (!permiso.ok) return permiso;
  const correo = correoSuperusuario();
  const usuario =
    correo &&
    (await bd.usuario.findFirst({
      where: {
        id: permiso.datos.usuarioId,
        correo,
        rol: "ADMIN",
        activo: true,
      },
      select: { id: true },
    }));
  return usuario
    ? permiso
    : fallo("SIN_PERMISO", "Esta acción requiere acceso de superusuario.");
}
