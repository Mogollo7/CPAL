import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import { AcordeonFaq } from "@/componentes/ui/acordeon-faq";
import serviciosData from "@/contenido/servicios.json";
import faqData from "@/contenido/faq.json";
import type { Servicios } from "@/contratos/servicio-contenido";
import type { Faq } from "@/contratos/faq";
import ilustracionHero from "@/contenido/ilustraciones/ilu-escena-portada-sillon.png";

export const metadata: Metadata = {
  title: "CAPL · Centro de Atención Psicológica Lasallista",
  description:
    "Atención psicológica y neuropsicológica gratuita en Caldas (Antioquia). Acompañamiento profesional y humano de Unilasallista para toda la comunidad.",
};

const datosServicios = serviciosData as Servicios;
const datosFaq = faqData as Faq;

export default function InicioPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* 1. HERO ACOGEDOR */}
      <section
        aria-labelledby="titulo-hero"
        className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pildora bg-morado-100 text-morado-900 border border-morado-300 text-caption font-medio">
            <Sparkles className="w-4 h-4 text-morado-700" aria-hidden="true" />
            <span>Atención gratuita y abierta a toda la comunidad</span>
          </div>

          <h1
            id="titulo-hero"
            className="text-h1 sm:text-[38px] font-fuerte text-texto-titulo tracking-tight leading-titulo"
          >
            Un espacio seguro, cálido y confidencial para cuidar tu salud mental
          </h1>

          <p className="text-p text-texto-secundario leading-texto max-w-[60ch]">
            En el{" "}
            <strong>Centro de Atención Psicológica Lasallista (CAPL)</strong> te
            escuchamos sin juicios. Brindamos orientación psicológica,
            neuropsicológica y vocacional atendida por psicólogos en formación
            con el acompañamiento permanente de docentes especialistas.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/pedir-cita"
              className="min-h-[48px] px-6 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo active:bg-accion-fondo-activo font-medio text-p shadow-sm inline-flex items-center gap-2.5 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              <CalendarPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Pedir cita</span>
            </Link>

            <Link
              href="/como-funciona"
              className="min-h-[48px] px-6 py-3 rounded-m bg-fondo-superficie border border-borde-suave text-texto-principal hover:bg-morado-50 font-medio text-p inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              <span>Cómo funciona</span>
              <ArrowRight
                className="w-5 h-5 shrink-0 text-texto-secundario"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Sellos de confianza institucional */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-borde-suave text-caption text-tinta-suave">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="w-4 h-4 text-agua-700 shrink-0"
                aria-hidden="true"
              />
              <span>Habilitado por MinSalud</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart
                className="w-4 h-4 text-morado-600 shrink-0"
                aria-hidden="true"
              />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <Users
                className="w-4 h-4 text-amarillo-700 shrink-0"
                aria-hidden="true"
              />
              <span>Para todos y todas</span>
            </div>
          </div>
        </div>

        {/* Ilustración de portada oficial */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-4/3 sm:aspect-square rounded-l overflow-hidden bg-morado-50 border border-morado-100 shadow-md">
            <Image
              src={ilustracionHero}
              alt="Ilustración cálida del espacio de consulta y acompañamiento psicológico en el CAPL"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA EN 3 PASOS SIMPLES */}
      <section
        aria-labelledby="titulo-pasos"
        className="mx-auto max-w-[1200px] rounded-l bg-fondo-superficie border border-borde-suave p-6 sm:p-10 shadow-xs space-y-8"
      >
        <div className="text-center max-w-[65ch] mx-auto space-y-2">
          <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
            Fácil y sin trámites complejos
          </span>
          <h2
            id="titulo-pasos"
            className="text-h1 font-fuerte text-texto-titulo"
          >
            ¿Cómo agendar y recibir tu atención?
          </h2>
          <p className="text-p text-texto-secundario">
            No necesitas crear una cuenta ni recordar contraseñas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-m bg-crema border border-morado-100 space-y-3">
            <div className="w-10 h-10 rounded-circulo bg-morado-600 text-blanco font-fuerte text-p flex items-center justify-center">
              1
            </div>
            <h3 className="text-h2 font-fuerte text-texto-titulo">
              Elige tu servicio
            </h3>
            <p className="text-p text-texto-secundario leading-texto">
              Selecciona si necesitas atención psicológica individual,
              valoración neuropsicológica u orientación vocacional.
            </p>
          </div>

          <div className="p-6 rounded-m bg-crema border border-morado-100 space-y-3">
            <div className="w-10 h-10 rounded-circulo bg-morado-600 text-blanco font-fuerte text-p flex items-center justify-center">
              2
            </div>
            <h3 className="text-h2 font-fuerte text-texto-titulo">
              Escoge tu horario
            </h3>
            <p className="text-p text-texto-secundario leading-texto">
              Elige el día y el profesional de tu preferencia entre los cupos
              disponibles en nuestro calendario.
            </p>
          </div>

          <div className="p-6 rounded-m bg-crema border border-morado-100 space-y-3">
            <div className="w-10 h-10 rounded-circulo bg-morado-600 text-blanco font-fuerte text-p flex items-center justify-center">
              3
            </div>
            <h3 className="text-h2 font-fuerte text-texto-titulo">
              Asiste a tu sesión
            </h3>
            <p className="text-p text-texto-secundario leading-texto">
              Recibe la confirmación en tu correo y acude a la Casa Amarilla de
              Unilasallista en Caldas.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/como-funciona"
            className="inline-flex items-center gap-2 text-texto-enlace hover:underline font-medio text-p focus-visible:outline-3 focus-visible:outline-foco rounded-s p-1"
          >
            <span>Conoce todos los detalles sobre el proceso de atención</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 3. VISTA PREVIA DE SERVICIOS */}
      <section
        aria-labelledby="titulo-servicios"
        className="mx-auto max-w-[1200px] space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-borde-suave pb-4">
          <div>
            <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
              Cuidado y acompañamiento integral
            </span>
            <h2
              id="titulo-servicios"
              className="text-h1 font-fuerte text-texto-titulo mt-1"
            >
              Nuestros servicios de atención
            </h2>
            <p className="text-p text-texto-secundario mt-1 max-w-[60ch]">
              Programas de bienestar mental diseñados para acompañarte en tus
              metas y momentos de cambio.
            </p>
          </div>

          <Link
            href="/servicios"
            className="text-texto-enlace hover:underline font-medio text-p inline-flex items-center gap-1.5 focus-visible:outline-3 focus-visible:outline-foco rounded-s shrink-0"
          >
            <span>Ver todos los servicios</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datosServicios.servicios.slice(0, 6).map((servicio) => (
            <article
              key={servicio.slug}
              className="rounded-m border border-borde-suave bg-fondo-superficie p-6 shadow-xs flex flex-col justify-between hover:border-morado-300 transition-colors duration-mov-rapido"
            >
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-pildora text-caption font-medio bg-morado-50 text-morado-700 border border-morado-100">
                  {servicio.area === "NEUROPSICOLOGIA"
                    ? "Neuropsicología"
                    : "Psicología"}
                </span>

                <h3 className="text-h2 font-medio text-texto-titulo leading-titulo">
                  {servicio.nombre}
                </h3>

                <p className="text-p text-texto-principal leading-texto">
                  {servicio.descripcion}
                </p>

                <div className="pt-2 border-t border-morado-50">
                  <p className="text-caption text-tinta-suave">
                    <strong>Para quién:</strong> {servicio.paraQuien}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                {servicio.agendableEnLinea ? (
                  <Link
                    href={`/pedir-cita?servicio=${servicio.slug}`}
                    className="w-full min-h-[44px] px-4 py-2 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-caption inline-flex items-center justify-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
                  >
                    <span>Pedir cita para este servicio</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href="/contacto"
                    className="w-full min-h-[44px] px-4 py-2 rounded-m bg-fondo-suave border border-borde-suave text-texto-principal hover:bg-morado-100 font-medio text-caption inline-flex items-center justify-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco"
                  >
                    <span>Consultar disponibilidad</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. PREGUNTAS FRECUENTES (FAQ) */}
      <section
        aria-labelledby="titulo-faq"
        className="mx-auto max-w-[1200px] space-y-8"
      >
        <div className="border-b border-borde-suave pb-4">
          <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
            Claridad y tranquilidad
          </span>
          <h2
            id="titulo-faq"
            className="text-h1 font-fuerte text-texto-titulo mt-1"
          >
            Preguntas frecuentes
          </h2>
          <p className="text-p text-texto-secundario mt-1 max-w-[65ch]">
            Todo lo que necesitas saber sobre costos, agendamiento, privacidad y
            profesionales del CAPL.
          </p>
        </div>

        <AcordeonFaq preguntas={datosFaq.preguntas} />
      </section>

      {/* 5. BANNER FINAL DE INVITACIÓN AL CUIDADO */}
      <section
        aria-labelledby="titulo-llamado"
        className="mx-auto max-w-[1200px] rounded-l bg-morado-900 text-blanco p-8 sm:p-12 text-center space-y-6 shadow-md"
      >
        <div className="max-w-[65ch] mx-auto space-y-3">
          <span className="text-caption font-medio uppercase tracking-wider text-amarillo-300">
            Estamos contigo
          </span>
          <h2
            id="titulo-llamado"
            className="text-h1 sm:text-[32px] font-fuerte text-blanco leading-titulo"
          >
            Tu bienestar emocional no tiene que esperar
          </h2>
          <p className="text-p text-morado-100 leading-texto">
            Dar el primer paso puede generar dudas, pero en el CAPL encontrarás
            un equipo cálido y dispuesto a acompañarte en tu proceso con total
            respeto y privacidad.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/pedir-cita"
            className="min-h-[48px] px-8 py-3 rounded-m bg-ayuda-fondo text-ayuda-texto hover:bg-amarillo-300 font-medio text-p shadow-sm inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-blanco"
          >
            <CalendarPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Pedir mi cita ahora</span>
          </Link>
          <Link
            href="/contacto"
            className="min-h-[48px] px-8 py-3 rounded-m bg-morado-700 hover:bg-morado-600 text-blanco font-medio text-p border border-morado-500 inline-flex items-center gap-2 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-blanco"
          >
            <span>Canales de contacto</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
