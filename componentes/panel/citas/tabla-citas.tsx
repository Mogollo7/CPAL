import Link from "next/link";
import { CalendarCheck, ChevronRight } from "lucide-react";
import type { CitaLista } from "@/contratos/cita";
import { PildoraEstado } from "./pildora-estado";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";
import { POR_PAGINA } from "@/contratos/filtros-cita";

interface TablaCitasProps {
  citas: CitaLista[];
  total: number;
  paginaActual: number;
  baseUrl?: string;
}

function formatearFechaBogota(isoString: string): {
  fecha: string;
  hora: string;
} {
  try {
    const d = new Date(isoString);
    const fecha = new Intl.DateTimeFormat("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "America/Bogota",
    }).format(d);
    const hora = new Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Bogota",
    }).format(d);
    return { fecha, hora };
  } catch {
    return { fecha: isoString, hora: "" };
  }
}

export function TablaCitas({
  citas,
  total,
  paginaActual,
  baseUrl = "/panel/admin/citas",
}: TablaCitasProps) {
  const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;

  if (citas.length === 0) {
    return (
      <EstadoVacio
        icono={CalendarCheck}
        titulo="No se encontraron citas"
        descripcion="No hay citas registradas que coincidan con los filtros o el término de búsqueda actual."
      />
    );
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-caption">
        <thead className="bg-fondo-suave text-texto-secundario">
          <tr>
            <th className="rounded-l-s p-3">Paciente</th>
            <th className="p-3">Fecha y hora</th>
            <th className="p-3">Servicio</th>
            <th className="p-3">Profesional</th>
            <th className="p-3">Estado</th>
            <th className="rounded-r-s p-3">
              <span className="sr-only">Detalle</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde-suave">
          {citas.map((cita) => {
            const { fecha, hora } = formatearFechaBogota(cita.inicio);
            return (
              <tr key={cita.id} className="hover:bg-fondo-suave/50">
                <td className="p-3">
                  <Link
                    href={`${baseUrl}/${cita.id}`}
                    className="font-fuerte text-texto-principal hover:underline"
                  >
                    {cita.pacienteNombre || cita.solicitanteNombre}
                  </Link>
                  <span className="block text-texto-secundario">
                    {cita.codigo}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-texto-secundario font-medio">
                  {fecha} · {hora}
                </td>
                <td className="p-3 text-texto-secundario">{cita.servicio}</td>
                <td className="p-3 text-texto-secundario">
                  {cita.psicologoNombre || "Por asignar"}
                </td>
                <td className="p-3">
                  <PildoraEstado estado={cita.estado} />
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`${baseUrl}/${cita.id}`}
                    aria-label={`Ver cita ${cita.codigo}`}
                    className="inline-flex text-texto-enlace"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between pt-4 text-caption text-texto-secundario">
        <span>
          Mostrando {citas.length} de {total} citas
        </span>
        {totalPaginas > 1 && (
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
        )}
      </div>
    </div>
  );
}
