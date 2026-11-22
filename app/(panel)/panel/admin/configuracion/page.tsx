import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { connection } from "next/server";
import { datosDePagina } from "@/servidor/pagina";
import { obtenerConfiguracionAccion } from "@/servidor/acciones";
import { AccesoConfiguracion } from "@/componentes/panel/admin/acceso-configuracion";

export const instant = false;

export default async function PaginaAdminConfiguracion() {
  await connection();
  const resultado = await obtenerConfiguracionAccion();
  const requiereConfirmacion =
    !resultado.ok && resultado.codigo === "CONFIRMACION_REQUERIDA";

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Configuración del centro"
        descripcion="Ajusta las reglas de atención y acceso del centro."
      />

      <AccesoConfiguracion
        inicial={requiereConfirmacion ? undefined : datosDePagina(resultado)}
      />
    </div>
  );
}
