import { datosDePagina } from "@/servidor/pagina";
import {
  listarBloqueosCentroAccion,
  listarFestivosAccion,
} from "@/servidor/acciones";
import { GestorBloqueos } from "@/componentes/panel/admin/gestor-bloqueos";

export default async function PaginaAdminBloqueos() {
  const [bloqueos, festivos] = await Promise.all([
    listarBloqueosCentroAccion().then(datosDePagina),
    listarFestivosAccion(new Date().getFullYear()).then(datosDePagina),
  ]);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Fechas Bloqueadas y Festivos
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Administración de días inhábiles para todo el centro y consulta del
          calendario festivo oficial colombiano.
        </p>
      </div>

      <GestorBloqueos bloqueosIniciales={bloqueos} festivos={festivos} />
    </div>
  );
}
