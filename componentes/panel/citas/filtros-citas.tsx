"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Download, RotateCcw } from "lucide-react";
import type { EstadoCita } from "@/contratos/cita";
import { cn } from "@/componentes/ui/cn";

const PESTANAS: { id: string; label: string; estado?: EstadoCita }[] = [
  { id: "pendientes", label: "Pendientes", estado: "PENDIENTE" },
  { id: "autorizadas", label: "Autorizadas", estado: "AUTORIZADA" },
  { id: "rechazadas", label: "Rechazadas", estado: "RECHAZADA" },
  { id: "todas", label: "Todas" },
];

export function FiltrosCitas() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const estadoActual = searchParams.get("estado") || "PENDIENTE";
  const busquedaActual = searchParams.get("busqueda") || "";
  const fechaActual = searchParams.get("fecha") || "";

  const actualizarFiltro = (clave: string, valor: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    // Al cambiar filtros volvemos a la página 1
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  };

  const limpiarFiltros = () => {
    router.push(`${pathname}?estado=PENDIENTE`);
  };

  // Construir URL de exportación a CSV con los parámetros vigentes
  const urlExportar = `/api/admin/exportar?${searchParams.toString()}`;

  const hayFiltrosActivos =
    busquedaActual !== "" || fechaActual !== "" || estadoActual !== "PENDIENTE";

  return (
    <div className="space-y-4">
      {/* Fila superior: Pestañas de estado rápido y botón de exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-borde-suave pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {PESTANAS.map((pestana) => {
            const estaActiva =
              (!pestana.estado && !searchParams.get("estado")) ||
              searchParams.get("estado") === pestana.estado ||
              (!searchParams.get("estado") && pestana.id === "pendientes");

            return (
              <button
                key={pestana.id}
                type="button"
                onClick={() =>
                  actualizarFiltro("estado", pestana.estado || null)
                }
                className={cn(
                  "px-4 py-2 rounded-m text-caption font-weight-medio transition-all cursor-pointer whitespace-nowrap",
                  estaActiva
                    ? "bg-accion-suave-fondo text-accion-suave-texto font-weight-fuerte shadow-2xs border border-morado-300"
                    : "text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave border border-transparent",
                )}
              >
                {pestana.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-caption font-weight-medio text-texto-secundario hover:text-texto-principal rounded-m border border-borde-suave hover:bg-fondo-suave transition-colors"
              title="Restablecer filtros a Pendientes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}

          <a
            href={urlExportar}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-m bg-fondo-superficie border border-borde-control text-caption font-weight-medio text-texto-principal hover:bg-fondo-suave transition-colors shadow-xs"
            title="Exportar citas filtradas a formato CSV compatible con Excel"
          >
            <Download className="w-4 h-4 text-texto-secundario" />
            <span>Exportar CSV</span>
          </a>
        </div>
      </div>

      {/* Fila inferior: Buscador por texto y selector de fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <input
            type="search"
            value={busquedaActual}
            onChange={(e) =>
              actualizarFiltro("busqueda", e.target.value || null)
            }
            placeholder="Buscar por código (ej. CAPL-1234), paciente, correo o documento..."
            className="w-full pl-10 pr-4 py-2 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal placeholder:text-texto-secundario/50 text-caption focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
          />
          <Search className="w-4 h-4 text-texto-secundario absolute left-3.5 top-2.5" />
        </div>

        <div>
          <input
            type="date"
            value={fechaActual}
            onChange={(e) => actualizarFiltro("fecha", e.target.value || null)}
            className="w-full px-3 py-2 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal text-caption focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
            title="Filtrar por fecha específica"
          />
        </div>
      </div>
    </div>
  );
}
