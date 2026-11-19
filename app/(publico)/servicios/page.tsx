import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart, Users } from "lucide-react";
import { CatalogoServicios } from "@/componentes/publico/catalogo-servicios";
import serviciosData from "@/contenido/servicios.json";
import type { Servicios } from "@/contratos/servicio-contenido";

export const metadata: Metadata = {
  title: "Servicios de Atención Psicológica y Neuropsicología · CAPL",
  description:
    "Catálogo de servicios de atención psicológica individual, valoración neuropsicológica y orientación vocacional. Atención gratuita en Caldas, Antioquia.",
};

const datos = serviciosData as Servicios;

export default function ServiciosPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
      <div className="mx-auto max-w-[1200px] space-y-10">
        {/* Encabezado */}
        <header className="border-b border-borde-suave pb-6 space-y-3">
          <nav
            aria-label="Navegación secundaria"
            className="text-caption text-texto-secundario"
          >
            <Link
              href="/"
              className="text-texto-enlace hover:underline focus-visible:outline-3 focus-visible:outline-foco rounded-s"
            >
              Inicio
            </Link>{" "}
            / <span aria-current="page">Servicios</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pildora bg-morado-50 text-morado-700 border border-morado-100 text-caption font-medio">
            <Sparkles
              className="w-3.5 h-3.5 text-morado-600"
              aria-hidden="true"
            />
            <span>Atención sin costo · Modalidad presencial y virtual</span>
          </div>

          <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
            Nuestros Servicios de Atención Psicológica
          </h1>

          <p className="text-p text-texto-secundario max-w-[70ch] leading-texto">
            Ofrecemos espacios de escucha profesional, valoración de funciones
            cognitivas y acompañamiento en proyectos de vida. Puedes agendar tu
            cita directamente en los servicios disponibles en línea.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-caption text-tinta-suave">
            <span className="flex items-center gap-1.5">
              <ShieldCheck
                className="w-4 h-4 text-agua-700"
                aria-hidden="true"
              />
              <span>Habilitación MinSalud DHS803177</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-morado-600" aria-hidden="true" />
              <span>100% Gratuito</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amarillo-700" aria-hidden="true" />
              <span>Comunidad universitaria y público en general</span>
            </span>
          </div>
        </header>

        {/* Catálogo interactivo de servicios */}
        <CatalogoServicios servicios={datos.servicios} />

        {/* Banner de aviso o ayuda */}
        <section
          aria-label="Aviso sobre servicios especiales"
          className="rounded-m bg-crema border border-borde-suave p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h2 className="text-h2 font-medio text-texto-titulo">
              ¿Requieres un taller, charla o certificación específica?
            </h2>
            <p className="text-p text-texto-secundario">
              Servicios como evaluación para mascotas de apoyo o capacitaciones
              a instituciones se coordinan mediante nuestro canal de contacto.
            </p>
          </div>

          <Link
            href="/contacto"
            className="min-h-[48px] px-6 py-2.5 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 shrink-0 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
          >
            <span>Escríbenos a contacto</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
