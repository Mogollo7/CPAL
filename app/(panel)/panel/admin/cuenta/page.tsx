import { redirect } from "next/navigation";
import { connection } from "next/server";
import { FormularioCuentaAdmin } from "@/componentes/panel/admin/formulario-cuenta";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { obtenerSesion } from "@/servidor/cuentas/sesionActual";

export const instant = false;

export default async function PaginaAdminCuenta() {
  await connection();
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/ingresar");
  if (sesion.rol !== "ADMIN") redirect("/panel?error=sin-permiso");

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Mi cuenta"
        descripcion="Actualiza la contraseña que usas para acceder al panel."
      />
      <FormularioCuentaAdmin />
    </div>
  );
}
