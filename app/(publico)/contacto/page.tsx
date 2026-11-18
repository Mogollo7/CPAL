import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  ExternalLink,
  AlertTriangle,
  LifeBuoy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto y Ubicación · Casa Amarilla Unilasallista · CAPL",
  description:
    "Comunícate con el Centro de Atención Psicológica Lasallista. Ubicación en Caldas (Antioquia), correo institucional, WhatsApp y horarios de atención.",
};

export default function ContactoPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="mx-auto max-w-[1000px] space-y-10">
        {/* Cabecera */}
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
            / <span aria-current="page">Contacto</span>
          </nav>

          <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
            Canales de comunicación institucional
          </span>
          <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
            Canales de Contacto y Ubicación
          </h1>
          <p className="text-p text-texto-secundario max-w-[65ch] leading-texto">
            Estamos atentos a responder tus dudas sobre citas, talleres,
            certificaciones y convenios institucionales.
          </p>
        </header>

        {/* Recordatorio de NO urgencias */}
        <div
          role="alert"
          className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-amarillo-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-fuerte text-p text-tinta">
                ¿Necesitas atención por una emergencia o crisis inmediata?
              </p>
              <p className="text-caption text-tinta-suave">
                El canal de contacto atiende en horario hábil. Para emergencias
                24/7 utiliza las líneas oficiales.
              </p>
            </div>
          </div>
          <Link
            href="/ayuda-inmediata"
            className="min-h-[44px] px-4 py-2 rounded-m bg-ayuda-fondo text-ayuda-texto hover:bg-amarillo-300 font-medio text-caption inline-flex items-center gap-2 shrink-0 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
          >
            <LifeBuoy className="w-4 h-4 text-tinta" aria-hidden="true" />
            <span>Ver líneas de emergencia</span>
          </Link>
        </div>

        {/* Grid de canales de atención */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta 1: Ubicación Física */}
          <article className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-morado-700">
              <div className="p-3 bg-morado-50 rounded-circulo">
                <MapPin
                  className="w-6 h-6 text-morado-600"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-h2 font-fuerte text-texto-titulo">
                Sede física
              </h2>
            </div>

            <p className="text-p text-texto-principal leading-texto">
              <strong>Campus Unilasallista — &quot;Casa Amarilla&quot;</strong>
              <br />
              Carrera 51 # 118 Sur – 57, Caldas, Antioquia, Colombia.
            </p>

            <p className="text-caption text-tinta-suave italic">
              * Dirección física de referencia institucional sujeta a validación
              final de nomenclatura por la universidad.
            </p>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Unilasallista+Corporación+Universitaria+Caldas+Antioquia"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-5 py-2.5 rounded-m border border-borde-suave bg-fondo-suave hover:bg-morado-100 text-texto-principal font-medio text-p inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
              >
                <span>Ver ubicación en Google Maps</span>
                <ExternalLink
                  className="w-4 h-4 text-texto-secundario"
                  aria-hidden="true"
                />
              </a>
            </div>
          </article>

          {/* Tarjeta 2: Correo y Conmutador */}
          <article className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-morado-700">
              <div className="p-3 bg-morado-50 rounded-circulo">
                <Mail className="w-6 h-6 text-morado-600" aria-hidden="true" />
              </div>
              <h2 className="text-h2 font-fuerte text-texto-titulo">
                Correo institucional
              </h2>
            </div>

            <p className="text-p text-texto-principal leading-texto">
              Escríbenos para consultas administrativas, talleres a grupos o
              convenios académicos:
            </p>

            <div>
              <a
                href="mailto:capl@unilasallista.edu.co"
                className="text-h2 font-fuerte text-texto-enlace hover:underline break-all focus-visible:outline-3 focus-visible:outline-foco rounded-s"
              >
                capl@unilasallista.edu.co
              </a>
            </div>

            <div className="pt-2 border-t border-morado-50 flex items-center gap-2 text-p text-texto-principal">
              <Phone
                className="w-5 h-5 text-morado-600 shrink-0"
                aria-hidden="true"
              />
              <span>Conmutador: (604) 320 19 99</span>
            </div>
          </article>

          {/* Tarjeta 3: WhatsApp institucional */}
          <article className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-morado-700">
              <div className="p-3 bg-morado-50 rounded-circulo">
                <MessageCircle
                  className="w-6 h-6 text-morado-600"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-h2 font-fuerte text-texto-titulo">
                WhatsApp del CAPL
              </h2>
            </div>

            <p className="text-p text-texto-principal leading-texto">
              Línea móvil de orientación y recepción de inquietudes para
              consultantes.
            </p>

            <div className="space-y-2">
              <div className="inline-block p-4 rounded-m bg-morado-50 border border-morado-100 text-caption text-tinta-suave">
                <strong>Estado:</strong> Número oficial de WhatsApp en proceso
                de asignación y verificación institucional por el CAPL.
              </div>

              <div>
                <a
                  href="https://wa.me/573000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Contactar por WhatsApp (En verificación)</span>
                </a>
              </div>
            </div>
          </article>

          {/* Tarjeta 4: Horarios de atención */}
          <article className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-morado-700">
              <div className="p-3 bg-morado-50 rounded-circulo">
                <Clock className="w-6 h-6 text-morado-600" aria-hidden="true" />
              </div>
              <h2 className="text-h2 font-fuerte text-texto-titulo">
                Horarios de atención
              </h2>
            </div>

            <ul className="space-y-2 text-p text-texto-principal">
              <li className="flex items-start justify-between gap-2 border-b border-morado-50 pb-2">
                <span className="font-medio">Lunes a viernes:</span>
                <span>8:00 a. m. – 5:00 p. m.</span>
              </li>
              <li className="flex items-start justify-between gap-2 border-b border-morado-50 pb-2 text-texto-secundario">
                <span>Fines de semana y festivos:</span>
                <span>Cerrado</span>
              </li>
            </ul>

            <p className="text-caption text-tinta-suave italic">
              * La atención de sesiones de psicología y neuropsicología depende
              de los cupos agendados previamente.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
