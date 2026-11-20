"use client";

import { useState } from "react";
import { CalendarCheck, Clock, Phone, Mail } from "lucide-react";
import type { CitaLista } from "@/contratos/cita";
import { PildoraEstado } from "@/componentes/panel/citas/pildora-estado";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";
import { cn } from "@/componentes/cn";

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
    <div className="space-y-6 max-w-5xl">
      {/* Pestañas de Navegación Rápida */}
      <div className="flex items-center gap-2 border-b border-borde-suave pb-1">
        <button
          type="button"
          onClick={() => setPestaña("proximas")}
          className={cn(
            "px-4 py-2 rounded-m text-caption font-weight-medio transition-all cursor-pointer",
            pestaña === "proximas"
              ? "bg-accion-suave-fondo text-accion-suave-texto font-weight-fuerte border border-morado-300"
              : "text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave",
          )}
        >
          Próximas consultas
        </button>
        <button
          type="button"
          onClick={() => setPestaña("pendientes")}
          className={cn(
            "px-4 py-2 rounded-m text-caption font-weight-medio transition-all cursor-pointer",
            pestaña === "pendientes"
              ? "bg-accion-suave-fondo text-accion-suave-texto font-weight-fuerte border border-morado-300"
              : "text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave",
          )}
        >
          Pendientes por autorizar
        </button>
        <button
          type="button"
          onClick={() => setPestaña("pasadas")}
          className={cn(
            "px-4 py-2 rounded-m text-caption font-weight-medio transition-all cursor-pointer",
            pestaña === "pasadas"
              ? "bg-accion-suave-fondo text-accion-suave-texto font-weight-fuerte border border-morado-300"
              : "text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave",
          )}
        >
          Historial / Pasadas
        </button>
      </div>

      {/* Lista de Citas Asignadas */}
      <div className="space-y-4">
        {citasFiltradas.map((cita) => {
          const { fecha, hora } = formatearFechaBogota(cita.inicio);
          const nombrePaciente = cita.pacienteNombre || cita.solicitanteNombre;

          return (
            <div
              key={cita.id}
              className="p-5 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs hover:border-morado-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Información Principal del Paciente y Cita */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-weight-fuerte text-caption text-morado-900 bg-fondo-suave px-2.5 py-0.5 rounded-s border border-borde-suave">
                    {cita.codigo}
                  </span>
                  <PildoraEstado estado={cita.estado} />
                  <span className="text-caption text-texto-secundario">
                    {cita.servicio}
                  </span>
                </div>

                <div>
                  <h4 className="text-h2 font-weight-fuerte text-texto-titulo">
                    {nombrePaciente}
                  </h4>
                  <div className="flex items-center gap-2 text-caption text-texto-principal mt-1">
                    <Clock className="w-4 h-4 text-morado-600" />
                    <span className="font-weight-medio capitalize">
                      {fecha}
                    </span>
                    <span className="text-texto-secundario">a las {hora}</span>
                  </div>
                </div>
              </div>

              {/* Contacto del Paciente (RF-PSI-05) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-borde-suave/60">
                <div className="flex items-center gap-2">
                  {cita.solicitanteTelefono && (
                    <a
                      href={`tel:${cita.solicitanteTelefono}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-m bg-fondo-suave border border-borde-suave text-caption font-weight-medio text-texto-principal hover:text-texto-enlace hover:border-morado-300 transition-colors"
                      title="Llamar al paciente"
                    >
                      <Phone className="w-3.5 h-3.5 text-texto-secundario" />
                      <span>{cita.solicitanteTelefono}</span>
                    </a>
                  )}

                  {cita.solicitanteCorreo && (
                    <a
                      href={`mailto:${cita.solicitanteCorreo}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-m bg-fondo-suave border border-borde-suave text-caption font-weight-medio text-texto-principal hover:text-texto-enlace hover:border-morado-300 transition-colors"
                      title="Enviar correo institucional"
                    >
                      <Mail className="w-3.5 h-3.5 text-texto-secundario" />
                      <span className="max-w-[150px] truncate">
                        {cita.solicitanteCorreo}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

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
    </div>
  );
}
