import { CalendarOff, Plus } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminBloqueos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Fechas Bloqueadas y Festivos
          </h2>
          <p className="text-p text-texto-secundario mt-1">
            Gestión de días inhábiles del centro y consulta de festivos nacionales.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Bloquear fecha</span>
        </button>
      </div>

      <EstadoVacio
        icono={CalendarOff}
        titulo="Sin fechas bloqueadas"
        descripcion="No hay bloqueos adicionales configurados para la agenda del centro fuera del calendario de festivos oficiales."
      />
    </div>
  );
}
