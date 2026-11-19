import type { Configuracion } from "@/contratos/configuracion";
import { configuracionSimulada } from "@/contratos/simulados-centro";
import { obtenerConfiguracionAccion } from "@/servidor/acciones";
import { FormularioConfiguracion } from "@/componentes/panel/admin/formulario-configuracion";

export default async function PaginaAdminConfiguracion() {
  let configuracion: Configuracion = configuracionSimulada;

  try {
    const res = await obtenerConfiguracionAccion();
    if (res.ok) {
      configuracion = res.datos;
    }
  } catch {
    // Si no hay DB activa en desarrollo local usamos la configuración simulada
    configuracion = configuracionSimulada;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Configuración y Reglas del Centro
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Ajusta las políticas de antelación, límites de cupos, auto-autorización y dominios institucionales sin necesidad de redesplegar.
        </p>
      </div>

      <FormularioConfiguracion configuracionInicial={configuracion} />
    </div>
  );
}
