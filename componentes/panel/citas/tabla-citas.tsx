import Link from "next/link";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
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

function formatearFechaBogota(isoString: string): { fecha: string; hora: string } {
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
    <div className="space-y-4">
      {/* Vista de Tabla para Escritorio (md en adelante) */}
      <div className="hidden md:block rounded-l bg-fondo-superficie border border-borde-suave shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borde-suave bg-fondo-suave/60 text-caption font-weight-fuerte text-texto-secundario uppercase tracking-wider">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Paciente / Solicitante</th>
                <th className="py-3 px-4">Horario</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Psicólogo(a)</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave text-caption text-texto-principal">
              {citas.map((cita) => {
                const { fecha, hora } = formatearFechaBogota(cita.inicio);
                const nombreMostrar =
                  cita.pacienteNombre || cita.solicitanteNombre;

                return (
                  <tr
                    key={cita.id}
                    className="hover:bg-fondo-suave/50 transition-colors group"
                  >
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono font-weight-fuerte text-morado-900 whitespace-nowrap">
                      <Link
                        href={`${baseUrl}/${cita.id}`}
                        className="hover:underline hover:text-accion-fondo"
                      >
                        {cita.codigo}
                      </Link>
                    </td>

                    {/* Paciente */}
                    <td className="py-3.5 px-4 min-w-[180px]">
                      <div className="font-weight-fuerte text-texto-titulo">
                        {nombreMostrar}
                      </div>
                      <div className="text-[11px] text-texto-secundario">
                        {cita.solicitanteTelefono || cita.solicitanteCorreo}
                      </div>
                    </td>

                    {/* Horario */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-weight-medio text-texto-titulo">
                        <Clock className="w-3.5 h-3.5 text-texto-secundario" />
                        <span>{hora}</span>
                      </div>
                      <div className="text-[11px] text-texto-secundario capitalize">
                        {fecha}
                      </div>
                    </td>

                    {/* Servicio */}
                    <td className="py-3.5 px-4 max-w-[180px] truncate">
                      <span className="text-texto-secundario" title={cita.servicio}>
                        {cita.servicio}
                      </span>
                    </td>

                    {/* Psicólogo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-texto-principal">
                        <User className="w-3.5 h-3.5 text-texto-secundario" />
                        <span>{cita.psicologoNombre || "Por asignar"}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center">
                      <PildoraEstado estado={cita.estado} />
                    </td>

                    {/* Botón Acción */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`${baseUrl}/${cita.id}`}
                        className="inline-flex items-center gap-1 text-caption font-weight-medio text-texto-enlace hover:text-accion-fondo group-hover:translate-x-0.5 transition-all p-1"
                        title="Ver detalle completo de la cita"
                      >
                        <span>Ver</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Tarjetas para Móviles (md oculto) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {citas.map((cita) => {
          const { fecha, hora } = formatearFechaBogota(cita.inicio);
          const nombreMostrar = cita.pacienteNombre || cita.solicitanteNombre;

          return (
            <Link
              key={cita.id}
              href={`${baseUrl}/${cita.id}`}
              className="p-4 rounded-m bg-fondo-superficie border border-borde-suave shadow-xs hover:border-morado-300 transition-all flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-weight-fuerte text-caption text-morado-900 bg-fondo-suave px-2 py-0.5 rounded-s border border-borde-suave">
                  {cita.codigo}
                </span>
                <PildoraEstado estado={cita.estado} />
              </div>

              <div>
                <h4 className="font-weight-fuerte text-p text-texto-titulo">
                  {nombreMostrar}
                </h4>
                <p className="text-caption text-texto-secundario">
                  {cita.servicio}
                </p>
              </div>

              <div className="flex items-center justify-between text-caption text-texto-secundario pt-2 border-t border-borde-suave/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {fecha}, {hora}
                  </span>
                </div>
                <span className="font-weight-medio text-texto-enlace inline-flex items-center gap-0.5">
                  Gestionar <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Barra de Paginación */}
      <div className="flex items-center justify-between pt-2 px-1 text-caption text-texto-secundario">
        <span>
          Mostrando {citas.length} de {total} citas
        </span>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-2">
            <span className="font-weight-medio">
              Página {paginaActual} de {totalPaginas}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
