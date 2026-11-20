import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { Suspense } from "react";
import type { EstadoCita } from "@/contratos/cita";
import { listarCitasAccion } from "@/servidor/acciones";
import { FiltrosCitas } from "@/componentes/panel/citas/filtros-citas";
import { TablaCitas } from "@/componentes/panel/citas/tabla-citas";

interface PaginaAdminCitasProps {
  searchParams: Promise<{
    estado?: string;
    busqueda?: string;
    fecha?: string;
    pagina?: string;
  }>;
}

export default async function PaginaAdminCitas({
  searchParams,
}: PaginaAdminCitasProps) {
  const params = await searchParams;
  const estadoFiltro = (params.estado || "PENDIENTE") as EstadoCita | "todas";
  const busqueda = (params.busqueda || "").toLowerCase().trim();
  const pagina = Number(params.pagina) || 1;

  const { citas, total } = datosDePagina(
    await listarCitasAccion({
      estado: estadoFiltro === "todas" ? undefined : estadoFiltro,
      busqueda: busqueda || undefined,
      pagina,
    }),
  );

  return (
    <div className="space-y-6">
      {/* Encabezado de la pÃ¡gina */}
      <EncabezadoPagina
        titulo="Citas del centro"
        descripcion="Revisa las solicitudes y gestiona las citas de todos los profesionales."
      />

      <TarjetaPanel>
        <Titulo nivel="h2" tamano="tarjeta" className="text-subtitulo">
          Bandeja de citas
        </Titulo>
        <p className="mt-1 mb-5 text-texto-secundario">
          Selecciona una cita para revisar sus datos.
        </p>
        {/* Controles de Filtros y BÃºsqueda */}
        <Suspense
          fallback={
            <div className="h-[80px] bg-fondo-suave rounded-m animate-pulse" />
          }
        >
          <FiltrosCitas />
        </Suspense>

        {/* Tabla Interactiva de Citas */}
        <TablaCitas
          citas={citas}
          total={total}
          paginaActual={pagina}
          baseUrl="/panel/admin/citas"
        />
      </TarjetaPanel>
    </div>
  );
}
