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
      {/* Encabezado de la página */}
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Bandeja de Citas
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Revisión de solicitudes entrantes, autorizaciones inmediatas y
          seguimiento clínico.
        </p>
      </div>

      {/* Controles de Filtros y Búsqueda */}
      <Suspense
        fallback={
          <div className="h-20 bg-fondo-suave rounded-m animate-pulse" />
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
    </div>
  );
}
