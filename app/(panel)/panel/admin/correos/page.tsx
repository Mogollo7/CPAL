import { connection } from "next/server";
import { GestorCorreos } from "@/componentes/panel/admin/gestor-correos";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { trabajosFallidosAccion } from "@/servidor/acciones";
import { datosDePagina } from "@/servidor/pagina";

export const instant = false;

export default async function PaginaAdminCorreos() {
  await connection();
  const { trabajos } = datosDePagina(await trabajosFallidosAccion());

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Correos fallidos"
        descripcion="Revisa los envíos que agotaron sus intentos y vuelve a ponerlos en la cola."
      />
      <GestorCorreos iniciales={trabajos} />
    </div>
  );
}
