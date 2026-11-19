import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { formatoFecha, formatoHora } from "@/servidor/fechas";
import { cache } from "react";
import { notFound } from "next/navigation";
import { verEventoPublicoAccion } from "@/servidor/acciones";

export const instant = false;

// Una sola consulta aunque la pidan los metadatos y la página.
const cargarEvento = cache(async (slug: string) => {
  await connection();
  return verEventoPublicoAccion(slug);
});

// Metadatos dinámicos por evento
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await cargarEvento(slug);

  if (!r.ok) {
    return {
      title: "Evento no encontrado | CAPL",
    };
  }

  return {
    title: `${r.datos.titulo} | Eventos CAPL`,
    description: r.datos.descripcion.slice(0, 160),
  };
}

function EtiquetaModalidad({ lugar }: { lugar: string }) {
  const esVirtual = lugar.toLowerCase().includes("virtual");
  return (
    <span
      className={`inline-block rounded-pildora px-[12px] py-[4px] text-caption font-medio ${
        esVirtual
          ? "bg-agua-100 text-agua-700"
          : "bg-fondo-suave text-texto-secundario"
      }`}
    >
      {esVirtual ? "🌐 Virtual" : "📍 Presencial"}
    </span>
  );
}

export default async function PaginaDetalleEvento({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await cargarEvento(slug);
  if (!r.ok) notFound();
  const evento = r.datos;

  const fechaInicio = formatoFecha(new Date(evento.inicio));
  const horaInicio = formatoHora(new Date(evento.inicio));
  const horaFin = evento.fin ? formatoHora(new Date(evento.fin)) : null;

  // Párrafos de la descripción separados por salto de línea doble
  const parrafos = evento.descripcion
    .split("\n\n")
    .flatMap((bloque) => bloque.split("\n"))
    .filter((p) => p.trim().length > 0);

  return (
    <div className="capl-textura-papel min-h-screen bg-fondo-pagina">
      {/* Migas de pan */}
      <nav
        aria-label="Ruta de navegación"
        className="bg-fondo-superficie px-[16px] py-[12px]"
      >
        <ol className="mx-auto flex max-w-[800px] flex-wrap items-center gap-[6px] text-caption text-texto-secundario">
          <li>
            <Link
              href="/"
              className="underline hover:text-texto-principal focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/eventos"
              className="underline hover:text-texto-principal focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              Eventos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-texto-principal font-medio">
            {evento.titulo}
          </li>
        </ol>
      </nav>

      <main
        id="contenido-principal"
        className="mx-auto max-w-[800px] px-[16px] py-[48px]"
      >
        {/* Encabezado del evento */}
        <header className="mb-[40px] flex flex-col gap-[16px]">
          <EtiquetaModalidad lugar={evento.lugar} />

          <h1 className="text-h1 font-fuerte text-texto-titulo">
            {evento.titulo}
          </h1>

          {/* Datos clave en tarjeta */}
          <div className="rounded-m bg-fondo-superficie p-[24px]">
            <dl className="grid gap-[16px] sm:grid-cols-2">
              <div>
                <dt className="text-caption font-medio text-texto-secundario uppercase tracking-wide">
                  Fecha
                </dt>
                <dd className="mt-[4px] text-p font-medio text-texto-principal capitalize">
                  <time dateTime={evento.inicio}>{fechaInicio}</time>
                </dd>
              </div>

              <div>
                <dt className="text-caption font-medio text-texto-secundario uppercase tracking-wide">
                  Horario
                </dt>
                <dd className="mt-[4px] text-p font-medio text-texto-principal">
                  <time dateTime={evento.inicio}>{horaInicio}</time>
                  {horaFin && (
                    <>
                      {" "}
                      –{" "}
                      <time dateTime={evento.fin ?? undefined}>{horaFin}</time>
                    </>
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-caption font-medio text-texto-secundario uppercase tracking-wide">
                  Lugar
                </dt>
                <dd className="mt-[4px] text-p text-texto-principal">
                  {evento.lugar}
                </dd>
              </div>

              {evento.enlace && (
                <div className="sm:col-span-2">
                  <dt className="text-caption font-medio text-texto-secundario uppercase tracking-wide">
                    Enlace
                  </dt>
                  <dd className="mt-[4px]">
                    <a
                      href={evento.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-p text-accion-fondo underline focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
                    >
                      Acceder al evento virtual
                      <span className="sr-only"> (abre en nueva pestaña)</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </header>

        {/* Descripción del evento */}
        <section aria-labelledby="descripcion-evento" className="mb-[48px]">
          <h2
            id="descripcion-evento"
            className="mb-[16px] text-h2 font-medio text-texto-titulo"
          >
            Acerca de este evento
          </h2>
          <div className="flex flex-col gap-[12px]">
            {parrafos.map((parrafo, idx) => (
              <p
                key={idx}
                className="text-p leading-relaxed text-texto-principal"
              >
                {parrafo}
              </p>
            ))}
          </div>
        </section>

        {/* Aviso de no urgencias */}
        <aside
          role="note"
          className="mb-[48px] rounded-m border border-borde-suave bg-aviso-fondo p-[20px]"
        >
          <p className="text-p text-texto-principal">
            <strong>Este espacio es informativo y de acompañamiento.</strong> No
            reemplaza la atención psicológica individual. Si estás pasando por
            una situación difícil,{" "}
            <Link
              href="/pedir-cita"
              className="font-medio text-accion-fondo underline focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              pide tu cita
            </Link>{" "}
            o visita nuestra{" "}
            <Link
              href="/ayuda-inmediata"
              className="font-medio text-accion-fondo underline focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
            >
              guía de ayuda inmediata
            </Link>
            .
          </p>
        </aside>

        {/* Volver */}
        <div className="flex flex-wrap gap-[16px]">
          <Link
            href="/eventos"
            className="inline-flex min-h-[48px] items-center rounded-pildora border border-borde-suave px-[24px] text-p font-medio text-texto-principal transition-colors duration-mov-rapido hover:bg-fondo-suave focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
          >
            ← Ver todos los eventos
          </Link>
          <Link
            href="/pedir-cita"
            className="inline-flex min-h-[48px] items-center rounded-pildora bg-accion-fondo px-[24px] text-p font-medio text-accion-texto transition-opacity duration-mov-rapido hover:opacity-90 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
          >
            Pedir cita
          </Link>
        </div>
      </main>
    </div>
  );
}
