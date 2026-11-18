import { User, Camera } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaPsicologoPerfil() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-borde-suave">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Perfil Profesional
        </h2>
        <p className="text-p text-texto-secundario mt-1">
          Actualiza tu foto, texto de presentación y servicios clínicos que atiendes.
        </p>
      </div>

      <EstadoVacio
        icono={User}
        titulo="Perfil del terapeuta"
        descripcion="Completa tu presentación profesional y sube tu foto (400 × 400 px) para que los consultantes conozcan tu enfoque en el directorio institucional."
        accion={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-colors shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Editar perfil y foto</span>
          </button>
        }
      />
    </div>
  );
}
