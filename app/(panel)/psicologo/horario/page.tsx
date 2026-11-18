import { Clock, Plus } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaPsicologoHorario() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Mi Horario de Atención
          </h2>
          <p className="text-p text-texto-secundario mt-1">
            Define tu disponibilidad semanal (lunes a viernes) y registra ausencias puntuales.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir bloque horario</span>
        </button>
      </div>

      <EstadoVacio
        icono={Clock}
        titulo="Horario no configurado"
        descripcion="Aún no has registrado tus bloques semanales de atención. Configura tus horarios para que los usuarios puedan solicitar citas contigo."
      />
    </div>
  );
}
