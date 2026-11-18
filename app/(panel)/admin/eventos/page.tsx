import { Sparkles, Plus } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminEventos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Cartelera de Eventos
          </h2>
          <p className="text-p text-texto-secundario mt-1">
            Administración de talleres, conferencias y eventos comunitarios del CAPL.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Crear evento</span>
        </button>
      </div>

      <EstadoVacio
        icono={Sparkles}
        titulo="Sin eventos registrados"
        descripcion="Actualmente no hay eventos o talleres publicados en la cartelera. Crea un evento para que aparezca en el sitio público."
      />
    </div>
  );
}
