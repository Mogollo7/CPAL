import { Calendar } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminCalendario() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-borde-suave">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Calendario Semanal
        </h2>
        <p className="text-p text-texto-secundario mt-1">
          Vista cronológica de las citas y turnos de atención del centro.
        </p>
      </div>

      <EstadoVacio
        icono={Calendar}
        titulo="Calendario de atención"
        descripcion="La visualización semanal general de turnos y citas programadas estará disponible en esta sección."
      />
    </div>
  );
}
