import Link from "next/link";
import { connection } from "next/server";
import { Calendar } from "lucide-react";
import { BotonEnlace } from "@/componentes/atomos/boton";
import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import {
  RUTA_CITAS,
  semanaBogota,
} from "@/componentes/panel/citas/consulta-citas";
import { PildoraEstado } from "@/componentes/panel/citas/pildora-estado";
import type { CitaLista } from "@/contratos/cita";
import { listarCitasAccion, listarPsicologosAccion } from "@/servidor/acciones";
import { desdeBogota, fechaBogota, formatoHora, ZONA } from "@/servidor/fechas";
import { datosDePagina } from "@/servidor/pagina";

export const instant = false;

const RUTA = "/panel/admin/calendario";
const fechaCorta = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const diaSemana = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "short",
});

async function citasDeSemana(filtros: { desde: string; hasta: string }) {
  const primera = datosDePagina(await listarCitasAccion(filtros));
  const citas = new Map(primera.citas.map((cita) => [cita.id, cita]));
  const paginas = Math.ceil(primera.total / primera.porPagina);
  for (let pagina = 2; pagina <= paginas; pagina++) {
    const siguiente = datosDePagina(
      await listarCitasAccion({ ...filtros, pagina }),
    );
    if (siguiente.pagina !== pagina) break;
    for (const cita of siguiente.citas) citas.set(cita.id, cita);
  }
  return [...citas.values()].sort((primera, segunda) =>
    primera.inicio.localeCompare(segunda.inicio),
  );
}

export default async function PaginaAdminCalendario({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string | string[] }>;
}) {
  await connection();
  const { dias, anterior, siguiente, desde, hasta } = semanaBogota(
    (await searchParams).semana,
  );
  const [citas, resultadoEquipo] = await Promise.all([
    citasDeSemana({ desde, hasta }),
    listarPsicologosAccion(),
  ]);
  const equipo = new Map(
    datosDePagina(resultadoEquipo)
      .filter(({ estado }) => estado === "ACTIVO")
      .map(({ id, nombre }) => [id, nombre]),
  );
  const porProfesional = new Map<string, Map<string, CitaLista[]>>();
  for (const cita of citas) {
    const fecha = fechaBogota(new Date(cita.inicio));
    equipo.set(cita.psicologoId, cita.psicologoNombre);
    const porDia =
      porProfesional.get(cita.psicologoId) ?? new Map<string, CitaLista[]>();
    const agenda = porDia.get(fecha) ?? [];
    agenda.push(cita);
    porDia.set(fecha, agenda);
    porProfesional.set(cita.psicologoId, porDia);
  }
  const profesionales = [...equipo].sort((primero, segundo) =>
    primero[1].localeCompare(segundo[1], "es-CO"),
  );
  const periodo = `${fechaCorta.format(new Date(desde))} – ${fechaCorta.format(new Date(hasta))}`;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Calendario del centro"
        descripcion="Consulta las citas de la semana por profesional, en hora de Bogotá."
      />
      <TarjetaPanel>
        <nav
          aria-label="Semanas del calendario"
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          <BotonEnlace tipo="borde" href={`${RUTA}?semana=${anterior}`}>
            Semana anterior
          </BotonEnlace>
          <span className="font-fuerte">{periodo}</span>
          <BotonEnlace tipo="borde" href={`${RUTA}?semana=${siguiente}`}>
            Semana siguiente
          </BotonEnlace>
        </nav>
        {profesionales.length === 0 ? (
          <EstadoVacio
            icono={Calendar}
            titulo="No hay citas esta semana"
            descripcion="Puedes consultar otra semana con los controles del calendario."
          />
        ) : (
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Citas de la semana por profesional"
          >
            <table className="w-full border-collapse text-left text-caption">
              <caption className="sr-only">Citas del {periodo}</caption>
              <thead className="bg-fondo-suave text-texto-secundario">
                <tr>
                  <th scope="col" className="p-3">
                    Día
                  </th>
                  {profesionales.map(([id, nombre]) => (
                    <th key={id} scope="col" className="min-w-[160px] p-3">
                      {nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-borde-suave">
                {dias.map((fecha) => (
                  <tr key={fecha}>
                    <th scope="row" className="p-3 align-top capitalize">
                      {diaSemana.format(desdeBogota(fecha))}
                    </th>
                    {profesionales.map(([id]) => {
                      const agenda = porProfesional.get(id)?.get(fecha);
                      return (
                        <td
                          key={id}
                          className="border-l border-borde-suave p-2 align-top"
                        >
                          {agenda ? (
                            <ul className="space-y-2">
                              {agenda.map((cita) => (
                                <li key={cita.id}>
                                  <Link
                                    href={`${RUTA_CITAS}/${cita.id}`}
                                    className="block space-y-1 rounded-m bg-fondo-suave p-2 text-texto-principal hover:underline focus-visible:outline-3 focus-visible:outline-foco"
                                  >
                                    <span className="block font-fuerte">
                                      {formatoHora(new Date(cita.inicio))} ·{" "}
                                      {cita.codigo}
                                    </span>
                                    <span className="block">
                                      {cita.servicio}
                                    </span>
                                    <PildoraEstado estado={cita.estado} />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-texto-secundario">
                              Sin citas
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TarjetaPanel>
    </div>
  );
}
