import type { Metadata } from "next";
import Link from "next/link";
import type { EventoDetalle } from "@/contratos/evento";
import { connection } from "next/server";
import { formatoFecha, formatoHora } from "@/servidor/fechas";
import { datosDePagina } from "@/servidor/pagina";
import { listarEventosPublicosAccion } from "@/servidor/acciones";

export const metadata: Metadata = {
  title: "Eventos y talleres | CAPL — Universidad de La Salle",
  description:
    "Talleres, charlas y grupos de apoyo del Centro de Atención Psicológica Lasallista. Espacios abiertos para toda la comunidad universitaria.",
};

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
      {esVirtual ? "Virtual" : "Presencial"}
    </span>
  );
}

function TarjetaEvento({ evento }: { evento: EventoDetalle }) {
  const fechaInicio = formatoFecha(new Date(evento.inicio));
  const horaInicio = formatoHora(new Date(evento.inicio));
  const horaFin = evento.fin ? formatoHora(new Date(evento.fin)) : null;

  return (
    <article className="flex flex-col gap-[16px] rounded-m bg-fondo-superficie p-[24px] shadow-sm transition-shadow duration-mov-rapido hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-[8px]">
        <EtiquetaModalidad lugar={evento.lugar} />
        <time
          dateTime={evento.inicio}
          className="text-caption text-texto-secundario"
        >
          {fechaInicio}
        </time>
      </div>

      <h2 className="text-h2 font-medio text-texto-titulo">{evento.titulo}</h2>

      <p className="line-clamp-3 text-p text-texto-principal">
        {evento.descripcion.split("\n")[0]}
      </p>

      <div className="flex flex-col gap-[6px] text-caption text-texto-secundario">
        <p>
          <span className="font-medio">Horario:</span> {horaInicio}
          {horaFin ? ` – ${horaFin}` : ""}
        </p>
        <p>
          <span className="font-medio">Lugar:</span> {evento.lugar}
        </p>
      </div>

      <div className="mt-auto pt-[8px]">
        <Link
          href={`/eventos/${evento.slug}`}
          className="inline-flex min-h-[48px] items-center rounded-pildora bg-accion-fondo px-[24px] text-p font-medio text-accion-texto transition-opacity duration-mov-rapido hover:opacity-90 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center gap-[24px] py-[64px] text-center">
      <span className="text-[48px]" role="img" aria-label="Calendario vacío">
        📅
      </span>
      <div className="flex flex-col gap-[8px]">
        <p className="text-h2 font-medio text-texto-titulo">
          Próximamente nuevos eventos
        </p>
        <p className="text-p text-texto-secundario">
          En este momento no hay eventos programados, pero vuelve pronto. El
          CAPL organiza talleres y charlas a lo largo del año.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex min-h-[48px] items-center rounded-pildora border border-borde-suave px-[24px] text-p font-medio text-texto-principal transition-colors duration-mov-rapido hover:bg-fondo-suave focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export const instant = false;

export default async function PaginaEventos() {
  await connection();
  // Solo publicados y sin terminar, el más próximo primero (lo filtra el servidor).
  const eventosPublicados = datosDePagina(await listarEventosPublicosAccion());

  return (
    <div className="capl-textura-papel min-h-screen bg-fondo-pagina">
      {/* Encabezado de sección */}
      <section className="bg-morado-900 py-[48px] text-center">
        <div className="mx-auto max-w-[800px] px-[16px]">
          <h1 className="text-h1 font-fuerte text-blanco">
            Eventos y talleres
          </h1>
          <p className="mt-[12px] text-p text-blanco opacity-90">
            Espacios abiertos de formación, encuentro y bienestar para toda la
            comunidad Lasallista. Sin inscripción previa salvo que se indique.
          </p>
        </div>
      </section>

      {/* Aviso informativo */}
      <div className="bg-aviso-fondo px-[16px] py-[12px] text-center">
        <p className="mx-auto max-w-[800px] text-caption text-texto-principal">
          <strong>Recuerda:</strong> estos eventos son informativos y de
          acompañamiento, no reemplazan la atención clínica individual.{" "}
          <Link
            href="/pedir-cita"
            className="font-medio text-accion-fondo underline focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
          >
            Pide tu cita aquí
          </Link>{" "}
          si necesitas atención personalizada.
        </p>
      </div>

      {/* Listado de eventos */}
      <main
        id="contenido-principal"
        className="mx-auto max-w-[1200px] px-[16px] py-[48px]"
      >
        {eventosPublicados.length === 0 ? (
          <EstadoVacio />
        ) : (
          <>
            <p className="mb-[32px] text-caption text-texto-secundario">
              {eventosPublicados.length}{" "}
              {eventosPublicados.length === 1
                ? "evento próximo"
                : "eventos próximos"}
            </p>
            <ul
              className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {eventosPublicados.map((evento) => (
                <li key={evento.id}>
                  <TarjetaEvento evento={evento} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
