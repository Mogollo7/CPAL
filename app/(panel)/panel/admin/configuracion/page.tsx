import { datosDePagina } from "@/servidor/pagina";
import { obtenerConfiguracionAccion } from "@/servidor/acciones";
import { FormularioConfiguracion } from "@/componentes/panel/admin/formulario-configuracion";

export default async function PaginaAdminConfiguracion() {
  const configuracion = datosDePagina(await obtenerConfiguracionAccion());

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Configuración y Reglas del Centro
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Ajusta las políticas de antelación, límites de cupos,
          auto-autorización y dominios institucionales sin necesidad de
          redesplegar.
        </p>
      </div>

      <FormularioConfiguracion configuracionInicial={configuracion} />
    </div>
  );
}
