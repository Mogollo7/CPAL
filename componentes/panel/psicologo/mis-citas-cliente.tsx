"use client";

import { useState } from "react";
import { CalendarCheck, Phone, Mail } from "lucide-react";
import type { CitaLista } from "@/contratos/cita";
import { PildoraEstado } from "@/componentes/panel/citas/pildora-estado";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";
import { cn } from "@/componentes/cn";
import { Titulo } from "@/componentes/atomos/titulo";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";

interface MisCitasClienteProps {
  citasIniciales: CitaLista[];
}

function formatearFechaBogota(isoString: string): {
  fecha: string;
  hora: string;
} {
  try {
    const d = new Date(isoString);
    const fecha = new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

function ContactoCita({ cita }: { cita: CitaLista }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {cita.solicitanteTelefono && (
        <a
          href={`tel:${cita.solicitanteTelefono}`}
          className="inline-flex min-h-[44px] max-w-full items-center gap-2 text-p wrap-anywhere text-texto-enlace hover:underline"
          title="Llamar al paciente"
        >
          <Phone className="size-[14px] shrink-0" />
          {cita.solicitanteTelefono}
        </a>
      )}
      {cita.solicitanteCorreo && (
        <a
          href={`mailto:${cita.solicitanteCorreo}`}
          className="inline-flex min-h-[44px] max-w-full items-center gap-2 text-p wrap-anywhere text-texto-enlace hover:underline"
          title="Enviar correo institucional"
        >
          <Mail className="size-[14px] shrink-0" />
          <span>{cita.solicitanteCorreo}</span>
        </a>
      )}
    </div>
  );
}

export function MisCitasCliente({ citasIniciales }: MisCitasClienteProps) {
  const [pestaña, setPestaña] = useState<"proximas" | "pendientes" | "pasadas">(
    "proximas",
  );

  const ahora = new Date();

  const citasFiltradas = citasIniciales.filter((c) => {
    const fechaCita = new Date(c.inicio);
    if (pestaña === "proximas") {
      return c.estado === "AUTORIZADA" && fechaCita >= ahora;
    }
    if (pestaña === "pendientes") {
      return c.estado === "PENDIENTE";
    }
    if (pestaña === "pasadas") {
      return (
        fechaCita < ahora ||
        [
          "ATENDIDA",
          "NO_ASISTIO",
          "CANCELADA",
          "RECHAZADA",
          "VENCIDA",
        ].includes(c.estado)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [
            "Citas próximas",
            citasIniciales.filter(
              (c) => c.estado === "AUTORIZADA" && new Date(c.inicio) >= ahora,
            ).length,
          ],
          [
            "Por confirmar",
            citasIniciales.filter((c) => c.estado === "PENDIENTE").length,
          ],
          [
            "Autorizadas",
            citasIniciales.filter((c) => c.estado === "AUTORIZADA").length,
          ],
          ["Total de citas", citasIniciales.length],
        ].map(([titulo, valor]) => (
          <TarjetaPanel key={titulo}>
            <p className="font-medio text-texto-titulo">{titulo}</p>
            <p className="font-titulo font-fuerte text-bloque text-texto-titulo mt-2">
              {valor}
            </p>
          </TarjetaPanel>
        ))}
      </div>
      <TarjetaPanel>
        <Titulo tamano="tarjeta" className="text-subtitulo">
          Agenda de citas
        </Titulo>
        <p className="text-caption text-texto-secundario mb-4">
          Consulta tus citas y sus datos de contacto.
        </p>
        {/* Pestañas de Navegación Rápida */}
        <div className="flex flex-wrap items-center gap-2 pb-4">
          <button
            type="button"
            onClick={() => setPestaña("proximas")}
            className={cn(
              "px-5 py-3 rounded-pildora text-p font-medio transition-all cursor-pointer border",
              pestaña === "proximas"
                ? "bg-accion-fondo text-accion-texto border-accion-fondo"
                : "border-borde-control text-texto-principal hover:bg-fondo-suave",
            )}
          >
            Próximas consultas
          </button>
          <button
            type="button"
            onClick={() => setPestaña("pendientes")}
            className={cn(
              "px-5 py-3 rounded-pildora text-p font-medio transition-all cursor-pointer border",
              pestaña === "pendientes"
                ? "bg-accion-fondo text-accion-texto border-accion-fondo"
                : "border-borde-control text-texto-principal hover:bg-fondo-suave",
            )}
          >
            Pendientes por autorizar
          </button>
          <button
            type="button"
            onClick={() => setPestaña("pasadas")}
            className={cn(
              "px-5 py-3 rounded-pildora text-p font-medio transition-all cursor-pointer border",
              pestaña === "pasadas"
                ? "bg-accion-fondo text-accion-texto border-accion-fondo"
                : "border-borde-control text-texto-principal hover:bg-fondo-suave",
            )}
          >
            Historial / Pasadas
          </button>
        </div>

        {/* Citas asignadas */}
        <div className="@container">
          {citasFiltradas.length > 0 && (
            <ul
              className="reticula-capl @min-[50rem]:hidden"
              aria-label="Citas asignadas"
            >
              {citasFiltradas.map((cita) => {
                const { fecha, hora } = formatearFechaBogota(cita.inicio);
                return (
                  <li
                    key={cita.id}
                    className="col-span-4 min-w-0 rounded-m border border-borde-suave p-4 wrap-anywhere @min-[34rem]:col-span-2"
                  >
                    <p className="text-caption text-texto-secundario">
                      {cita.codigo}
                    </p>
                    <h3 className="text-h2 font-fuerte">
                      {cita.pacienteNombre || cita.solicitanteNombre}
                    </h3>
                    <p className="mt-2">{cita.servicio}</p>
                    <p className="mb-2 text-texto-secundario">
                      {fecha} · {hora}
                    </p>
                    <PildoraEstado estado={cita.estado} />
                    <div className="mt-2">
                      <ContactoCita cita={cita} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {citasFiltradas.length > 0 && (
            <div className="hidden overflow-x-auto @min-[50rem]:block">
              <table className="w-full min-w-[800px] text-left text-p">
                <thead className="bg-fondo-suave text-caption text-texto-secundario">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medio">
                      Fecha y hora
                    </th>
                    <th scope="col" className="px-4 py-3 font-medio">
                      Paciente
                    </th>
                    <th scope="col" className="px-4 py-3 font-medio">
                      Servicio
                    </th>
                    <th scope="col" className="px-4 py-3 font-medio">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 font-medio">
                      Contacto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((cita) => {
                    const { fecha, hora } = formatearFechaBogota(cita.inicio);
                    const nombrePaciente =
                      cita.pacienteNombre || cita.solicitanteNombre;
                    return (
                      <tr
                        key={cita.id}
                        className="border-b border-borde-suave last:border-0"
                      >
                        <td className="px-4 py-4">
                          <span className="block font-fuerte">{hora}</span>
                          <span className="text-caption capitalize text-texto-secundario">
                            {fecha}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="block font-medio">
                            {nombrePaciente}
                          </span>
                          <span className="text-caption text-texto-secundario">
                            {cita.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-texto-secundario">
                          {cita.servicio}
                        </td>
                        <td className="px-4 py-4">
                          <PildoraEstado estado={cita.estado} />
                        </td>
                        <td className="px-4 py-4">
                          <ContactoCita cita={cita} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {citasFiltradas.length === 0 && (
            <EstadoVacio
              icono={CalendarCheck}
              titulo={`Sin citas en "${pestaña}"`}
              descripcion={
                pestaña === "proximas"
                  ? "No tienes consultas agendadas para los próximos días."
                  : pestaña === "pendientes"
                    ? "No hay solicitudes pendientes de asignación o confirmación en este momento."
                    : "No hay citas registradas en tu historial previo."
              }
            />
          )}
        </div>
      </TarjetaPanel>
    </div>
  );
}
