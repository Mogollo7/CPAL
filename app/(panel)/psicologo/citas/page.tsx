import { CalendarCheck } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaPsicologoCitas() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-borde-suave">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mis Citas Asignadas
        </h2>
        <p className="text-p text-texto-secundario mt-1">
          Pacientes y citas agendadas bajo tu atención clínica.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-borde-suave pb-1">
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-fuerte bg-accion-suave-fondo text-accion-suave-texto border border-morado-300"
        >
          Próximas (0)
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-medio text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave transition-colors"
        >
          Pasadas
        </button>
      </div>

      <EstadoVacio
        icono={CalendarCheck}
        titulo="Sin citas programadas"
        descripcion="No tienes citas agendadas para los próximos días. Cuando una solicitud sea asignada y autorizada para ti, aparecerá en esta lista."
      />
    </div>
  );
}
