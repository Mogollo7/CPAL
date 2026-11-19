import { datosDePagina } from "@/servidor/pagina";
import { listarEventosAccion } from "@/servidor/acciones";
import { GestorEventos } from "@/componentes/panel/admin/gestor-eventos";

export default async function PaginaAdminEventos() {
  const eventos = datosDePagina(await listarEventosAccion());

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Cartelera de Eventos y Talleres
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Publica conferencias, talleres grupales y actividades comunitarias
          visibles en el portal público.
        </p>
      </div>

      <GestorEventos eventosIniciales={eventos} />
    </div>
  );
}
