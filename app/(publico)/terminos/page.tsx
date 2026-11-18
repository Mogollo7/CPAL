import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  LifeBuoy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso · CAPL",
  description:
    "Condiciones de uso de la plataforma web del Centro de Atención Psicológica Lasallista, políticas de citas, gratuidad y responsabilidades.",
};

export default function TerminosPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="mx-auto max-w-[900px] space-y-8">
        {/* Cabecera y Navegación */}
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
            / <span aria-current="page">Términos y condiciones</span>
          </nav>

          <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
            Marco de uso institucional
          </span>
          <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-p text-texto-secundario leading-texto">
            Condiciones de acceso, uso y agendamiento a través de la plataforma
            web del Centro de Atención Psicológica Lasallista (CAPL).
          </p>
        </header>

        {/* Banner superior obligatorio: Documento provisional */}
        <div
          role="alert"
          className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-5 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-amarillo-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h2 className="text-p font-fuerte text-tinta">
                Documento provisional pendiente de validación jurídica por el
                CAPL
              </h2>
              <p className="text-p text-tinta leading-texto">
                Esta versión técnica se encuentra en proceso de revisión formal
                y aval por parte de la Coordinación del CAPL y la Dirección
                Jurídica de Unilasallista Corporación Universitaria.
              </p>
            </div>
          </div>
        </div>

        {/* AVISO CRÍTICO: No somos urgencias médicas */}
        <div
          role="alert"
          className="rounded-m bg-error-fondo border border-coral-700/30 p-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-coral-700 font-fuerte text-p">
            <ShieldAlert className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>
              Aviso prioritario: La plataforma web no atiende urgencias en
              tiempo real
            </span>
          </div>
          <p className="text-p text-texto-principal leading-texto">
            Si tú o alguien cercano experimenta pensamientos de autolesión,
            conducta suicida o peligro inminente,{" "}
            <strong>no solicites una cita por este medio</strong>. Acude de
            inmediato al servicio de urgencias hospitalario más cercano o
            comunícate con la <strong>Línea 123</strong> o la{" "}
            <strong>Línea 106 de salud mental</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/ayuda-inmediata"
              className="min-h-[42px] px-4 py-2 rounded-m bg-ayuda-fondo text-ayuda-texto hover:bg-amarillo-300 font-medio text-caption inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
            >
              <LifeBuoy className="w-4 h-4 text-tinta" aria-hidden="true" />
              <span>Ver Guía de Ayuda Inmediata 24/7</span>
            </Link>
          </div>
        </div>

        {/* Contenido de términos */}
        <article className="space-y-8 text-p text-texto-principal leading-texto">
          {/* 1. Naturaleza del servicio */}
          <section className="space-y-3">
            <h2 className="text-h2 font-fuerte text-texto-titulo">
              1. Naturaleza docente-asistencial y gratuidad
            </h2>
            <p>El consultante reconoce y acepta que:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Atención formativa supervisada:</strong> Las sesiones
                son realizadas por psicólogos en formación de Unilasallista y
                neuropsicólogos del CES, con supervisión permanente y rigurosa
                de docentes y profesionales habilitados.
              </li>
              <li>
                <strong>Gratuidad total:</strong> Todos los servicios
                asistenciales básicos provistos por el CAPL son 100% gratuitos.
                Ninguna persona está autorizada a solicitar cobro alguno por
                agendamiento o atención.
              </li>
              <li>
                <strong>Sede presencial:</strong> Las sesiones presenciales se
                llevan a cabo en la &quot;casa amarilla&quot; de Unilasallista
                en Caldas (Antioquia).
              </li>
            </ul>
          </section>

          {/* 2. Condiciones para la solicitud de citas */}
          <section className="space-y-3">
            <h2 className="text-h2 font-fuerte text-texto-titulo">
              2. Condiciones para la solicitud de citas
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong>Veracidad de la información:</strong> El consultante
                  declara bajo su responsabilidad que los datos proporcionados
                  corresponden a su identidad real.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong>Una cita activa por persona:</strong> Con el fin de
                  garantizar el acceso equitativo a toda la comunidad, cada
                  persona podrá mantener como máximo una (1) cita activa a la
                  vez en el sistema.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong>Atención a menores de edad:</strong> Las citas para
                  menores de 18 años deben ser solicitadas por su representante
                  legal, quien deberá acompañar al menor a la sesión física.
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Política de cancelación y reprogramación */}
          <section className="space-y-3">
            <h2 className="text-h2 font-fuerte text-texto-titulo">
              3. Política de cancelación y puntualidad
            </h2>
            <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave space-y-2">
              <p className="flex items-center gap-2 font-medio text-texto-titulo">
                <Clock
                  className="w-5 h-5 text-morado-600 shrink-0"
                  aria-hidden="true"
                />
                <span>Cancelación con al menos 12 horas de anticipación</span>
              </p>
              <p>
                Si no puedes acudir a tu cita, debes cancelarla o reprogramarla
                a través del enlace personal incluido en tu correo de
                confirmación. Esto permite que el cupo sea asignado a otra
                persona en lista de espera.
              </p>
              <p className="text-caption text-tinta-suave">
                * Las inasistencias reiteradas y no justificadas podrán
                suspender temporalmente la facultad de agendar citas en línea.
              </p>
            </div>
          </section>

          {/* 4. Propiedad intelectual */}
          <section className="space-y-3">
            <h2 className="text-h2 font-fuerte text-texto-titulo">
              4. Propiedad intelectual
            </h2>
            <p>
              Los contenidos, textos, ilustraciones, diseños y marcas presentes
              en este sitio son propiedad exclusiva de Unilasallista Corporación
              Universitaria y del CAPL. Queda prohibida su reproducción sin
              autorización previa y por escrito.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
