import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { connection } from "next/server";
import { datosDePagina } from "@/servidor/pagina";
import {
  listarBloqueosCentroAccion,
  listarFestivosAccion,
} from "@/servidor/acciones";
import { GestorBloqueos } from "@/componentes/panel/admin/gestor-bloqueos";

export default async function PaginaAdminBloqueos() {
  await connection(); // el año en curso se decide al pedir la página, no al compilar
  const [bloqueos, festivos] = await Promise.all([
    listarBloqueosCentroAccion().then(datosDePagina),
    listarFestivosAccion(new Date().getFullYear()).then(datosDePagina),
  ]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Cierres del centro"
        descripcion="Los cierres institucionales afectan los cupos disponibles de todo el equipo."
      />

      <GestorBloqueos bloqueosIniciales={bloqueos} festivos={festivos} />
    </div>
  );
}
