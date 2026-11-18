"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";
import { cn } from "./cn";
import type { Servicios } from "@/contratos/servicio-contenido";

export type ServicioContenido = Servicios["servicios"][number];

export interface CatalogoServiciosProps {
  servicios: ServicioContenido[];
  className?: string;
}

export function CatalogoServicios({
  servicios,
  className,
}: CatalogoServiciosProps) {
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");

  const areas = [
    { id: "TODAS", label: "Todos los servicios" },
    { id: "PSICOLOGIA", label: "Psicología" },
    { id: "NEUROPSICOLOGIA", label: "Neuropsicología" },
  ];

  const serviciosFiltrados =
    filtroArea === "TODAS"
      ? servicios
      : servicios.filter((s) => s.area === filtroArea);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Filtros de área accesibles */}
      <div
        role="tablist"
        aria-label="Filtrar servicios por especialidad"
        className="flex flex-wrap items-center gap-2 border-b border-borde-suave pb-4"
      >
        <span className="text-caption font-medio text-texto-secundario flex items-center gap-1.5 mr-2">
          <Filter className="w-4 h-4 text-morado-600" aria-hidden="true" />
          <span>Especialidad:</span>
        </span>

        {areas.map((area) => {
          const esActiva = filtroArea === area.id;
          return (
            <button
              key={area.id}
              type="button"
              role="tab"
              aria-selected={esActiva}
              onClick={() => setFiltroArea(area.id)}
              className={cn(
                "min-h-[42px] px-4 py-2 rounded-pildora text-caption font-medio transition-colors duration-mov-rapido",
                "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                esActiva
                  ? "bg-accion-fondo text-accion-texto shadow-sm"
                  : "bg-fondo-superficie border border-borde-suave text-texto-secundario hover:bg-morado-50 hover:text-texto-principal",
              )}
            >
              {area.label}
            </button>
          );
        })}
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosFiltrados.map((servicio) => (
          <article
            key={servicio.slug}
            className="rounded-m border border-borde-suave bg-fondo-superficie p-6 shadow-xs flex flex-col justify-between hover:border-morado-300 transition-colors duration-mov-rapido"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-pildora text-caption font-medio bg-morado-50 text-morado-700 border border-morado-100">
                  {servicio.area === "NEUROPSICOLOGIA"
                    ? "Neuropsicología"
                    : "Psicología"}
                </span>

                {servicio.agendableEnLinea ? (
                  <span className="inline-flex items-center gap-1 text-caption text-agua-700 font-medio">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Agendable en línea</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-caption text-tinta-suave">
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Vía contacto</span>
                  </span>
                )}
              </div>

              <h2 className="text-h2 font-medio text-texto-titulo leading-titulo">
                {servicio.nombre}
              </h2>

              <p className="text-p text-texto-principal leading-texto">
                {servicio.descripcion}
              </p>

              <div className="pt-3 border-t border-morado-50 space-y-1.5">
                <p className="text-caption text-tinta-suave">
                  <strong className="text-texto-principal font-medio">
                    ¿Para quién es?:
                  </strong>{" "}
                  {servicio.paraQuien}
                </p>
                <p className="text-caption text-tinta-suave flex items-center gap-1.5">
                  <Clock
                    className="w-3.5 h-3.5 text-morado-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Duración aproximada: 50 a 60 minutos</span>
                </p>
              </div>
            </div>

            {/* Acción de agendamiento o contacto */}
            <div className="pt-6">
              {servicio.agendableEnLinea ? (
                <Link
                  href={`/pedir-cita?servicio=${servicio.slug}`}
                  className="w-full min-h-[48px] px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center justify-center gap-2 shadow-sm transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
                >
                  <CalendarPlus
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Pedir cita</span>
                </Link>
              ) : (
                <Link
                  href="/contacto"
                  className="w-full min-h-[48px] px-5 py-2.5 rounded-m bg-fondo-suave border border-borde-suave text-texto-principal hover:bg-morado-100 font-medio text-p inline-flex items-center justify-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
                >
                  <span>Solicitar información</span>
                  <ArrowRight
                    className="w-4 h-4 text-texto-secundario shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
