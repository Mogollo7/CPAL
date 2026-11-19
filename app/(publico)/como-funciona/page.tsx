import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  UserCheck,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo Funciona · Paso a Paso para tu Cita · CAPL",
  description:
    "Conoce cómo solicitar tu cita en el CAPL, el proceso de confirmación, qué llevar a tu primera sesión y nuestra política de cancelación oportuna.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      <div className="mx-auto max-w-[1000px] space-y-12">
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
            / <span aria-current="page">Cómo funciona</span>
          </nav>

          <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
            Acompañamiento transparente y cercano
          </span>
          <h1 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
            ¿Cómo funciona la atención en el CAPL?
          </h1>
          <p className="text-p text-texto-secundario max-w-[70ch] leading-texto">
            Queremos que tu experiencia sea clara, cálida y sin trámites
            burocráticos. Aquí te explicamos cada etapa del proceso, desde que
            solicitas tu cita hasta que eres atendido por nuestro equipo.
          </p>
        </header>

        {/* 1. EL PROCESO EN 3 PASOS */}
        <section aria-labelledby="titulo-pasos" className="space-y-8">
          <div className="border-b border-borde-suave pb-3">
            <h2
              id="titulo-pasos"
              className="text-h1 font-fuerte text-texto-titulo"
            >
              El camino de tu atención en 3 pasos
            </h2>
          </div>

          <div className="space-y-6">
            {/* Paso 1 */}
            <div className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-circulo bg-morado-600 text-blanco font-fuerte text-h2 flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-h2 font-fuerte text-texto-titulo">
                    Pide tu cita en línea
                  </h3>
                  <span className="text-caption font-medio text-morado-700 bg-morado-50 px-3 py-0.5 rounded-pildora border border-morado-100">
                    Sin contraseñas
                  </span>
                </div>
                <p className="text-p text-texto-principal leading-texto">
                  Ingresa a nuestro formulario web y elige el servicio que
                  requieres (psicología individual, neuropsicología u
                  orientación vocacional). Indica si la cita es para ti o para
                  otra persona, selecciona el profesional y horario de tu
                  preferencia, y diligencia tus datos de contacto básicos.
                </p>
                <p className="text-caption text-tinta-suave">
                  * El motivo de consulta es totalmente opcional y se almacena
                  con cifrado seguro.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-circulo bg-morado-600 text-blanco font-fuerte text-h2 flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-h2 font-fuerte text-texto-titulo">
                    Autorización y confirmación por correo
                  </h3>
                  <span className="text-caption font-medio text-agua-700 bg-agua-100 px-3 py-0.5 rounded-pildora border border-agua-300">
                    Notificación segura
                  </span>
                </div>
                <p className="text-p text-texto-principal leading-texto">
                  El equipo de coordinación del CAPL revisa la solicitud para
                  garantizar que el servicio se ajuste a tus necesidades y que
                  el cupo esté debidamente asignado. En un plazo habitual de 24
                  a 48 horas hábiles recibirás un correo electrónico oficial de
                  confirmación.
                </p>
                <p className="text-caption text-tinta-suave">
                  * En ese correo recibirás los datos exactos del profesional
                  asignado, fecha, hora y tu enlace personal de gestión.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-circulo bg-morado-600 text-blanco font-fuerte text-h2 flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-h2 font-fuerte text-texto-titulo">
                    Asiste a tu sesión en la Casa Amarilla
                  </h3>
                  <span className="text-caption font-medio text-amarillo-700 bg-amarillo-100 px-3 py-0.5 rounded-pildora border border-amarillo-300">
                    Sede Unilasallista
                  </span>
                </div>
                <p className="text-p text-texto-principal leading-texto">
                  Acude a nuestra sede física en la &quot;casa amarilla&quot; de
                  Unilasallista (Caldas, Antioquia) en el horario acordado. Allí
                  te recibirá el profesional en formación asignado en un
                  consultorio cómodo y privado para iniciar tu proceso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. RECOMENDACIONES PREVIAS A LA PRIMERA CITA */}
        <section
          aria-labelledby="titulo-recomendaciones"
          className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="border-b border-borde-suave pb-3">
            <h2
              id="titulo-recomendaciones"
              className="text-h1 font-fuerte text-texto-titulo"
            >
              ¿Qué debes tener en cuenta para tu primera cita?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-m bg-crema border border-morado-100 space-y-2">
              <div className="flex items-center gap-2 font-fuerte text-p text-texto-titulo">
                <Clock
                  className="w-5 h-5 text-morado-600 shrink-0"
                  aria-hidden="true"
                />
                <span>Puntualidad</span>
              </div>
              <p className="text-p text-texto-principal leading-texto">
                Llega entre 10 y 15 minutos antes de la hora programada para
                anunciarte en recepción y realizar el registro inicial sin
                prisas.
              </p>
            </div>

            <div className="p-5 rounded-m bg-crema border border-morado-100 space-y-2">
              <div className="flex items-center gap-2 font-fuerte text-p text-texto-titulo">
                <FileText
                  className="w-5 h-5 text-morado-600 shrink-0"
                  aria-hidden="true"
                />
                <span>Documento de identidad</span>
              </div>
              <p className="text-p text-texto-principal leading-texto">
                Es indispensable presentar tu documento original (cédula de
                ciudadanía, tarjeta de identidad o cédula de extranjería).
              </p>
            </div>

            <div className="p-5 rounded-m bg-crema border border-morado-100 space-y-2">
              <div className="flex items-center gap-2 font-fuerte text-p text-texto-titulo">
                <UserCheck
                  className="w-5 h-5 text-morado-600 shrink-0"
                  aria-hidden="true"
                />
                <span>Menores de 18 años</span>
              </div>
              <p className="text-p text-texto-principal leading-texto">
                Los menores de edad deben asistir obligatoriamente acompañados
                por su padre, madre o acudiente legal acreditado, quien firmará
                el consentimiento informado.
              </p>
            </div>

            <div className="p-5 rounded-m bg-crema border border-morado-100 space-y-2">
              <div className="flex items-center gap-2 font-fuerte text-p text-texto-titulo">
                <ShieldCheck
                  className="w-5 h-5 text-morado-600 shrink-0"
                  aria-hidden="true"
                />
                <span>Exámenes o informes previos</span>
              </div>
              <p className="text-p text-texto-principal leading-texto">
                Si solicitaste evaluación neuropsicológica, trae valoraciones
                neurológicas previas, gafas o audífonos si los requieres para
                leer.
              </p>
            </div>
          </div>
        </section>

        {/* 3. POLÍTICA DE CANCELACIÓN Y REPROGRAMACIÓN */}
        <section
          aria-labelledby="titulo-politica"
          className="rounded-l border border-amarillo-300 bg-aviso-fondo/70 p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              className="w-6 h-6 text-amarillo-700 shrink-0"
              aria-hidden="true"
            />
            <h2 id="titulo-politica" className="text-h2 font-fuerte text-tinta">
              Política de cancelación y reprogramación responsable
            </h2>
          </div>

          <p className="text-p text-tinta leading-texto">
            Nuestros servicios son 100% gratuitos y la demanda de atención en la
            comunidad es alta. Por eso te pedimos cuidar tu cupo:
          </p>

          <ul className="space-y-2 text-p text-tinta">
            <li className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-4 h-4 text-amarillo-700 shrink-0 mt-1"
                aria-hidden="true"
              />
              <span>
                <strong>Avisa con al menos 12 horas de anticipación:</strong> En
                tu correo de confirmación tienes un botón para cancelar o
                reprogramar con un solo clic.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-4 h-4 text-amarillo-700 shrink-0 mt-1"
                aria-hidden="true"
              />
              <span>
                <strong>Permite que otra persona use el cupo:</strong> Cancelar
                a tiempo libera el espacio para alguien que está en lista de
                espera o necesita atención urgente.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-4 h-4 text-amarillo-700 shrink-0 mt-1"
                aria-hidden="true"
              />
              <span>
                <strong>Una cita activa a la vez:</strong> Solo puedes mantener
                una cita activa en el sistema para garantizar igualdad de
                oportunidades a todos los consultantes.
              </span>
            </li>
          </ul>
        </section>

        {/* 4. ¿QUIÉNES TE ATIENDEN? */}
        <section
          aria-labelledby="titulo-quienes"
          className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <Heart
              className="w-6 h-6 text-morado-600 shrink-0"
              aria-hidden="true"
            />
            <h2
              id="titulo-quienes"
              className="text-h2 font-fuerte text-texto-titulo"
            >
              ¿Quiénes realizan la atención?
            </h2>
          </div>

          <p className="text-p text-texto-principal leading-texto">
            El CAPL es un centro docente-asistencial habilitado por el
            Ministerio de Salud de Colombia (DHS803177). Las sesiones son
            llevadas a cabo por psicólogos en formación de los últimos semestres
            de Unilasallista y neuropsicólogos del CES.
          </p>

          <p className="text-p text-texto-principal leading-texto">
            Todos los casos cuentan con la asesoría, revisión y supervisión
            ética y clínica continua de psicólogos profesionales y docentes con
            amplia experiencia en salud mental.
          </p>
        </section>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-borde-suave">
          <Link
            href="/servicios"
            className="min-h-[48px] px-6 py-3 rounded-m bg-fondo-superficie border border-borde-suave text-texto-principal hover:bg-morado-50 font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
          >
            <span>Ver catálogo de servicios</span>
          </Link>

          <Link
            href="/pedir-cita"
            className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco"
          >
            <CalendarPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Pedir mi cita ahora</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
