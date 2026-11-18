import { Users, UserPlus } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminPsicologos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Equipo de Psicólogos
          </h2>
          <p className="text-p text-texto-secundario mt-1">
            Gestión de psicólogos en formación, invitaciones institucionales y estados activos.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invitar psicólogo</span>
        </button>
      </div>

      <EstadoVacio
        icono={Users}
        titulo="Gestión de psicólogos"
        descripcion="Aquí podrás listar a los profesionales, invitar nuevos psicólogos institucionales y configurar sus perfiles y áreas de atención."
      />
    </div>
  );
}
