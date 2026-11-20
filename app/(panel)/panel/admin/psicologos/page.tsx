import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { connection } from "next/server";
import { datosDePagina } from "@/servidor/pagina";
import { listarPsicologosAccion } from "@/servidor/acciones";
import { GestorPsicologos } from "@/componentes/panel/admin/gestor-psicologos";

export const instant = false;

export default async function PaginaAdminPsicologos() {
  await connection();
  const psicologos = datosDePagina(await listarPsicologosAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Psicólogos"
        descripcion="Consulta y administra los perfiles del equipo."
      />

      <GestorPsicologos psicologosIniciales={psicologos} />
    </div>
  );
}
