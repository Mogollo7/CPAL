import { connection } from "next/server";
import { GestorServicios } from "@/componentes/panel/admin/gestor-servicios";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { listarServiciosAccion } from "@/servidor/acciones";
import { datosDePagina } from "@/servidor/pagina";

export const instant = false;

export default async function PaginaAdminServicios() {
  await connection();
  const servicios = datosDePagina(await listarServiciosAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Servicios"
        descripcion="Administra el catálogo y elige qué servicios se pueden agendar en línea."
      />
      <GestorServicios iniciales={servicios} />
    </div>
  );
}
