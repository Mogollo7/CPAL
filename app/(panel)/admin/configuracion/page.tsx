import { Settings } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminConfiguracion() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-borde-suave">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Configuración del Centro
        </h2>
        <p className="text-p text-texto-secundario mt-1">
          Parámetros operativos, reglas de negocio y políticas de autorización de citas.
        </p>
      </div>

      <EstadoVacio
        icono={Settings}
        titulo="Ajustes y políticas"
        descripcion="Configura las horas de antelación para solicitar o cancelar citas, el interruptor de auto-autorización y la capacidad de atención."
      />
    </div>
  );
}
