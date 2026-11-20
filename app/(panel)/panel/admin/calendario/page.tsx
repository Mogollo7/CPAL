import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { Calendar } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminCalendario() {
  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Calendario del centro"
        descripcion="Consulta la semana de atención del centro."
      />

      <EstadoVacio
        icono={Calendar}
        titulo="Calendario de atención"
        descripcion="La visualización semanal general de turnos y citas programadas estará disponible en esta sección."
      />
    </div>
  );
}
