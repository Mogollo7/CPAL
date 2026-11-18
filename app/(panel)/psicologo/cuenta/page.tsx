import { FormularioCuenta } from "@/componentes/panel/psicologo/formulario-cuenta";

export default function PaginaPsicologoCuenta() {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Cuenta y Seguridad
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Administra tus credenciales de acceso institucional y controla la actividad de tus sesiones.
        </p>
      </div>

      <FormularioCuenta />
    </div>
  );
}
