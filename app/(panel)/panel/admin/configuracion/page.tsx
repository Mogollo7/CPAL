import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { obtenerConfiguracionAccion } from "@/servidor/acciones";
import { FormularioConfiguracion } from "@/componentes/panel/admin/formulario-configuracion";

export default async function PaginaAdminConfiguracion() {
  const configuracion = datosDePagina(await obtenerConfiguracionAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Configuración del centro"
        descripcion="Ajusta las reglas de atención y acceso del centro."
      />

      <FormularioConfiguracion configuracionInicial={configuracion} />
    </div>
  );
}
