import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCita } from "@/componentes/publico/formulario-cita";
import { EsqueletoCalmo } from "@/componentes/ui/esqueleto-calmo";

export const metadata: Metadata = {
  title: "Pedir Cita en Línea · Atención Psicológica Gratuita · CAPL",
  description:
    "Solicita tu cita de psicología individual, neuropsicología u orientación vocacional en el CAPL. Proceso guiado en 5 pasos, sin contraseñas y 100% gratuito.",
};

function CargandoFormulario() {
  return (
    <div
      className="mx-auto max-w-[900px] space-y-6"
      aria-busy="true"
      aria-label="Cargando formulario de cita"
    >
      <div className="h-4 w-48 bg-morado-100 rounded-pildora capl-pulso-respiracion" />
      <EsqueletoCalmo
        className="h-[460px] w-full rounded-l"
        varianteTono="crema"
      />
    </div>
  );
}

export default function PedirCitaPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="mx-auto max-w-[900px] space-y-3">
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
          / <span aria-current="page">Pedir cita</span>
        </nav>

        <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
          Solicitud de Cita de Atención Psicológica
        </h1>
        <p className="text-p text-texto-secundario leading-texto">
          Completa los 5 pasos para solicitar tu espacio. La atención es
          gratuita, confidencial y sin necesidad de crear contraseñas.
        </p>
      </div>

      {/* Envuelto en Suspense para soporte óptimo de useSearchParams en Next.js App Router */}
      <Suspense fallback={<CargandoFormulario />}>
        <FormularioCita />
      </Suspense>
    </div>
  );
}
