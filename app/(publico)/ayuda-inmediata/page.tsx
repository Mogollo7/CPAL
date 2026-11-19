import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, PhoneCall, ShieldCheck, Calendar } from "lucide-react";
import { BotonLlamar } from "@/componentes/ui/BotonLlamar";
import { OrientadorCrisis } from "@/componentes/ui/OrientadorCrisis";
import { EjercicioAnclaje } from "@/componentes/ui/EjercicioAnclaje";
import emergenciasData from "@/contenido/emergencias.json";
import type { Emergencias } from "@/contratos/emergencias";

export const metadata: Metadata = {
  title: "Guía de Emergencias y Ayuda Inmediata · CAPL",
  description:
    "Directorio de líneas de atención inmediata en Colombia, códigos de crisis, orientador confidencial y técnicas de apoyo emocional.",
};

const datos = emergenciasData as Emergencias;

export default function AyudaInmediataPage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-10">
        {/* Enlace accesible para saltar directo a las líneas */}
        <a
          href="#directorio-lineas"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-accion-fondo text-accion-texto px-4 py-2 rounded-m font-medio focus-visible:outline-3 focus-visible:outline-foco"
        >
          Saltar al directorio de llamadas de emergencia
        </a>

        {/* Encabezado y Aviso de No Urgencias Médicas (RF-PUB-08) */}
        <header className="space-y-4">
          <nav
            aria-label="Ruta de navegación"
            className="text-caption text-texto-secundario"
          >
            <Link
              href="/"
              className="text-texto-enlace hover:underline focus-visible:outline-3 focus-visible:outline-foco rounded-s"
            >
              Inicio
            </Link>{" "}
            / <span aria-current="page">Ayuda inmediata</span>
          </nav>

          <div className="border-b border-borde-suave pb-6">
            <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
              Guía de Emergencias y Ayuda Inmediata
            </h1>
            <p className="text-p text-texto-secundario mt-2 max-w-[70ch] leading-texto">
              Si estás viviendo un momento de angustia desbordante, pensamientos
              de hacerte daño o una situación de violencia, aquí encuentras los
              canales de apoyo profesional gratuitos y disponibles para ti en
              Colombia.
            </p>
          </div>

          {/* Aviso prioritario obligatorio: El CAPL no atiende urgencias médicas */}
          <div
            role="alert"
            className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle
                className="w-6 h-6 text-amarillo-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h2 className="text-p font-fuerte text-tinta">
                  El CAPL no es un servicio de urgencias médicas ni
                  psiquiátricas
                </h2>
                <p className="text-p text-tinta leading-texto">
                  Nuestro centro brinda atención psicológica con cita previa. Si
                  tú o una persona cercana se encuentra en peligro inmediato,
                  requiere hospitalización o atraviesa una crisis aguda,
                  comunícate ya mismo a las líneas de ayuda oficiales o acude al
                  servicio de urgencias de salud más cercano.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 1. Directorio general de líneas de ayuda directas (RF-EMG-02) */}
        <section
          id="directorio-lineas"
          aria-labelledby="titulo-directorio"
          className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="border-b border-borde-suave pb-4">
            <div className="flex items-center gap-2 text-morado-700 text-caption font-medio uppercase tracking-wider">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>Atención gratuita y confidencial</span>
            </div>
            <h2
              id="titulo-directorio"
              className="text-h1 font-fuerte text-texto-titulo mt-1"
            >
              Directorio de Líneas de Emergencia en Colombia
            </h2>
            <p className="text-p text-texto-secundario mt-1">
              Haz clic o toca cualquiera de los botones para llamar directamente
              desde tu teléfono.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datos.directorio.map((linea, idx) => (
              <BotonLlamar
                key={idx}
                nombre={linea.nombre}
                telefono={linea.telefono}
                horario={linea.horario}
                porConfirmar={linea.porConfirmar}
                variante={linea.telefono === "123" ? "alerta" : "principal"}
              />
            ))}
          </div>

          <p className="text-caption text-tinta-suave pt-2">
            * Todas las líneas anteriores son de acceso gratuito desde teléfonos
            móviles y fijos en el territorio colombiano.
          </p>
        </section>

        {/* 2. Orientador Interactivo de Crisis (RF-EMG-03) */}
        <OrientadorCrisis />

        {/* 3. Tarjetas de Códigos de Emergencia (RF-EMG-01, RF-EMG-05) */}
        <section aria-labelledby="titulo-codigos" className="space-y-6">
          <div className="border-b border-borde-suave pb-4">
            <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
              Protocolos de contención y acompañamiento
            </span>
            <h2
              id="titulo-codigos"
              className="text-h1 font-fuerte text-texto-titulo mt-1"
            >
              Códigos de Crisis: Cómo actuar paso a paso
            </h2>
            <p className="text-p text-texto-secundario mt-1 max-w-[70ch]">
              Información clara sobre qué hacer y qué evitar según la situación
              que se esté presentando.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {datos.codigos.map((codigo) => (
              <article
                key={codigo.id}
                id={`codigo-${codigo.id}`}
                className="scroll-mt-8 rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-sm space-y-6"
                aria-labelledby={`titulo-${codigo.id}`}
              >
                {/* REQUISITO ESTRICTO: Destacar PRIMERO la situación en text-h2 font-medio */}
                <div className="border-b border-borde-suave pb-4 space-y-2">
                  <h3
                    id={`titulo-${codigo.id}`}
                    className="text-h2 font-medio text-texto-titulo leading-titulo"
                  >
                    {codigo.situacion}
                  </h3>

                  {/* Nombre del código y píldora de color */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pildora text-caption font-fuerte bg-morado-100 text-morado-900 border border-morado-300">
                      <span
                        className="w-2.5 h-2.5 rounded-circulo shrink-0"
                        style={{
                          backgroundColor:
                            codigo.id === "dorado"
                              ? "#FFCB05"
                              : codigo.id === "fucsia"
                                ? "#E040FB"
                                : codigo.id === "rosa"
                                  ? "#FF80AB"
                                  : "#A9AEEB",
                        }}
                        aria-hidden="true"
                      />
                      {codigo.nombre}
                    </span>

                    <span className="text-caption text-tinta-suave">
                      Ruta asociada: Color {codigo.color}
                    </span>

                    {codigo.porConfirmar && (
                      <span className="text-caption bg-morado-50 text-tinta-suave px-2 py-0.5 rounded-s border border-borde-suave">
                        Contenido en validación por CAPL
                      </span>
                    )}
                  </div>
                </div>

                {/* Señales de alerta */}
                <div>
                  <h4 className="text-p font-fuerte text-texto-titulo mb-2">
                    Señales a las que debemos prestar atención:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {codigo.senales.map((senal, sIdx) => (
                      <li
                        key={sIdx}
                        className="flex items-start gap-2.5 text-p text-texto-principal leading-texto"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-circulo bg-morado-600 mt-2.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{senal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Qué hacer vs Qué no hacer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Qué hacer */}
                  <div className="rounded-m bg-agua-100/60 border border-agua-300 p-5 space-y-3">
                    <h4 className="text-p font-fuerte text-agua-700 flex items-center gap-2">
                      <ShieldCheck
                        className="w-5 h-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Qué SÍ debes hacer:</span>
                    </h4>
                    <ul className="space-y-2">
                      {codigo.queHacer.map((hacer, hIdx) => (
                        <li
                          key={hIdx}
                          className="flex items-start gap-2 text-p text-texto-principal leading-texto"
                        >
                          <span className="font-fuerte text-agua-700 shrink-0 select-none">
                            •
                          </span>
                          <span>{hacer}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Qué no hacer */}
                  <div className="rounded-m bg-error-fondo border border-coral-700/30 p-5 space-y-3">
                    <h4 className="text-p font-fuerte text-error-texto flex items-center gap-2">
                      <AlertTriangle
                        className="w-5 h-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Qué NO debes hacer:</span>
                    </h4>
                    <ul className="space-y-2">
                      {codigo.queNoHacer.map((noHacer, nIdx) => (
                        <li
                          key={nIdx}
                          className="flex items-start gap-2 text-p text-texto-principal leading-texto"
                        >
                          <span className="font-fuerte text-error-texto shrink-0 select-none">
                            •
                          </span>
                          <span>{noHacer}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Líneas específicas para este código */}
                <div className="border-t border-borde-suave pt-4">
                  <p className="text-caption font-medio text-texto-secundario mb-3">
                    Líneas prioritarias para este caso:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {codigo.lineas.map((linea, lIdx) => (
                      <BotonLlamar
                        key={lIdx}
                        nombre={linea.nombre}
                        telefono={linea.telefono}
                        horario={linea.horario}
                        porConfirmar={linea.porConfirmar}
                        variante={
                          linea.telefono === "123" ? "alerta" : "secundario"
                        }
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Ejercicio de Anclaje Sensorial 5-4-3-2-1 (RF-EMG-06) */}
        <EjercicioAnclaje />

        {/* Pie de la página: Metadatos y Fecha de Revisión */}
        <footer className="border-t border-borde-suave pt-6 text-caption text-tinta-suave flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Última revisión: {datos.ultimaRevision}</span>
            <span>·</span>
            <span>{datos.aprobadoPor}</span>
          </div>
          <div>
            <Link
              href="/contacto"
              className="text-texto-enlace hover:underline focus-visible:outline-3 focus-visible:outline-foco rounded-s"
            >
              ¿Tienes dudas sobre los servicios del CAPL? Contáctanos
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
