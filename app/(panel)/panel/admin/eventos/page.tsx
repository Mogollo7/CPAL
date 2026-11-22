import { connection } from "next/server";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { listarEventosAccion } from "@/servidor/acciones";
import { GestorEventos } from "@/componentes/panel/admin/gestor-eventos";

export const instant = false;

export default async function PaginaAdminEventos() {
  await connection();
  const eventos = datosDePagina(await listarEventosAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Eventos"
        descripcion="Organiza los encuentros que aparecen en la cartelera pública del CAPL."
      />

      <GestorEventos eventosIniciales={eventos} />
    </div>
  );
}
