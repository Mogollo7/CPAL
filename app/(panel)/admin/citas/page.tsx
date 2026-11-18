import Link from "next/link";
import { CalendarCheck, Filter, Download, Plus } from "lucide-react";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";

export default function PaginaAdminCitas() {
  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Bandeja de Citas
          </h2>
          <p className="text-p text-texto-secundario mt-1">
            Gestión de solicitudes, autorizaciones y seguimiento de atención clínica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/api/admin/exportar"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal text-caption font-weight-medio hover:bg-fondo-suave transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-texto-secundario" />
            <span>Exportar CSV</span>
          </Link>
        </div>
      </div>

      {/* Pestañas de estado según RF-ADM-03 */}
      <div className="flex items-center gap-2 border-b border-borde-suave pb-1 overflow-x-auto">
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-fuerte bg-accion-suave-fondo text-accion-suave-texto border border-morado-300"
        >
          Pendientes (0)
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-medio text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave transition-colors"
        >
          Autorizadas
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-medio text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave transition-colors"
        >
          Rechazadas
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-m text-caption font-weight-medio text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave transition-colors"
        >
          Todas
        </button>
      </div>

      {/* Estado vacío inicial para T-111 (Se completará en el Paso 3 con la tabla interactiva) */}
      <EstadoVacio
        icono={CalendarCheck}
        titulo="No hay citas pendientes"
        descripcion="Actualmente no hay solicitudes de citas en espera de autorización. Las nuevas solicitudes que los usuarios envíen desde el sitio público aparecerán aquí."
      />
    </div>
  );
}
