import { KeyRound, ShieldAlert } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaPsicologoCuenta() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-borde-suave">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Cuenta y Seguridad
        </h2>
        <p className="text-p text-texto-secundario mt-1">
          Gestión de contraseña institucional y sesiones activas.
        </p>
      </div>

      <EstadoVacio
        icono={KeyRound}
        titulo="Seguridad de la cuenta"
        descripcion="Cambia tu contraseña periódicamente y administra tus dispositivos de confianza para mantener protegida la información del centro."
        accion={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-m bg-fondo-superficie border border-borde-control text-texto-principal text-caption font-weight-medio hover:bg-fondo-suave transition-colors shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-morado-600" />
            <span>Cambiar contraseña</span>
          </button>
        }
      />
    </div>
  );
}
