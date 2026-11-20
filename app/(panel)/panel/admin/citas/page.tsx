import { connection } from "next/server";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import {
  listarCitasAccion,
  listarPsicologosAccion,
  listarServiciosAccion,
} from "@/servidor/acciones";
import { FiltrosCitas } from "@/componentes/panel/citas/filtros-citas";
import { TablaCitas } from "@/componentes/panel/citas/tabla-citas";
import { consultaBandeja } from "@/componentes/panel/citas/consulta-citas";

export const instant = false;

export default async function PaginaAdminCitas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const consulta = consultaBandeja(await searchParams);
  const [resultado, resultadoPendientes, profesionales, servicios] =
    await Promise.all([
      listarCitasAccion({ ...consulta.filtros, pagina: consulta.pagina }),
      consulta.estado === "PENDIENTE"
        ? null
        : listarCitasAccion({ ...consulta.filtros, estado: "PENDIENTE" }),
      listarPsicologosAccion(),
      listarServiciosAccion(),
    ]);
  const { citas, total, pagina, porPagina } = datosDePagina(resultado);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Citas del centro"
        descripcion="Revisa las solicitudes y gestiona las citas de todos los profesionales."
      />
      <TarjetaPanel>
        <Titulo nivel="h2" tamano="tarjeta" className="text-subtitulo">
          Bandeja de citas
        </Titulo>
        <p className="mt-1 mb-5 text-texto-secundario">
          Selecciona una cita para revisar sus datos.
        </p>
        <FiltrosCitas
          consulta={consulta}
          pendientes={
            resultadoPendientes
              ? datosDePagina(resultadoPendientes).total
              : total
          }
          profesionales={datosDePagina(profesionales).map(({ id, nombre }) => ({
            id,
            nombre,
          }))}
          servicios={datosDePagina(servicios).map(({ id, nombre }) => ({
            id,
            nombre,
          }))}
        />
        <TablaCitas
          citas={citas}
          total={total}
          paginaActual={pagina}
          porPagina={porPagina}
          consulta={consulta}
        />
      </TarjetaPanel>
    </div>
  );
}
