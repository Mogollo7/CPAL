import type { BloqueoGuardado, Festivo } from "@/contratos/bloqueo";
import {
  listarBloqueosCentro,
  listarFestivos,
} from "@/contratos/simulados-centro";
import {
  listarBloqueosCentroAccion,
  listarFestivosAccion,
} from "@/servidor/acciones";
import { GestorBloqueos } from "@/componentes/panel/admin/gestor-bloqueos";

export default async function PaginaAdminBloqueos() {
  const anio = new Date().getFullYear();
  let bloqueos: BloqueoGuardado[] = [];
  let festivos: Festivo[] = [];

  try {
    const [resBloqueos, resFestivos] = await Promise.all([
      listarBloqueosCentroAccion(),
      listarFestivosAccion(anio),
    ]);

    if (resBloqueos.ok) bloqueos = resBloqueos.datos;
    if (resFestivos.ok) festivos = resFestivos.datos;
  } catch {
    // Si no hay DB en desarrollo local usamos los datos simulados
    const [b, f] = await Promise.all([
      listarBloqueosCentro(),
      listarFestivos(),
    ]);
    bloqueos = b.ok ? b.datos : [];
    festivos = f.ok ? f.datos : [];
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Fechas Bloqueadas y Festivos
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Administración de días inhábiles para todo el centro y consulta del calendario festivo oficial colombiano.
        </p>
      </div>

      <GestorBloqueos
        bloqueosIniciales={bloqueos}
        festivos={festivos}
      />
    </div>
  );
}
