import { connection } from "next/server";
import { GestorAdministradores } from "@/componentes/panel/admin/gestor-administradores";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { listarAdministradoresAccion } from "@/servidor/acciones";
import { datosDePagina } from "@/servidor/pagina";

export const instant = false;

export default async function PaginaAdminAdministradores() {
  await connection();
  const administradores = datosDePagina(await listarAdministradoresAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Administradores"
        descripcion="Invita y administra a las personas con acceso al panel del centro."
      />
      <GestorAdministradores iniciales={administradores} />
    </div>
  );
}
