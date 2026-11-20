import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { BotonEnlace, claseBoton } from "@/componentes/atomos/boton";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { IlustracionSobrePie } from "@/componentes/atomos/ilustracion-sobre-pie";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import { TarjetaEvento } from "@/componentes/moleculas/tarjeta-evento";
import type { EventoDetalle } from "@/contratos/evento";
import { formatoFecha, formatoHora } from "@/servidor/fechas";
import { datosDePagina } from "@/servidor/pagina";
import { listarEventosPublicosAccion } from "@/servidor/acciones";
import comunidad from "@/contenido/ilustraciones/cierre-comunidad-eventos.webp";

export const metadata: Metadata = {
  title: "Eventos y talleres · CAPL",
  description:
    "Talleres, charlas y encuentros del Centro de Atención Psicológica Lasallista, abiertos a la comunidad.",
};

export const instant = false;

const cuando = (e: EventoDetalle) =>
  `${formatoFecha(new Date(e.inicio))} · ${formatoHora(new Date(e.inicio))}`;

// Figma · Eventos · destacado editable: el evento más próximo, sobre menta con grano.
function Destacado({ evento }: { evento: EventoDetalle }) {
  return (
    <section
      aria-labelledby="titulo-destacado"
      className="relative isolate grid items-center gap-bloque px-4 py-cabecera sm:px-borde md:min-h-[670px] md:grid-cols-[490px_525px] md:justify-between md:px-[90px]"
    >
      <FondoGrano tono="menta" fundido="abajo" />
      <div className="space-y-5">
        <p className="font-medio uppercase tracking-wide text-petroleo-700">
          Próximo evento
        </p>
        <Titulo nivel="h1" tamano="pagina" id="titulo-destacado">
          {evento.titulo}
        </Titulo>
        <p className="line-clamp-3 text-h2 leading-titulo text-texto-secundario">
          {evento.descripcion.split("\n")[0]}
        </p>
        <p className="text-destacado font-medio text-texto-titulo">
          {cuando(evento)} · {evento.lugar}
        </p>
        <BotonEnlace href={`/eventos/${evento.slug}`}>Ver evento</BotonEnlace>
      </div>
      <div className="relative aspect-[525/500] overflow-hidden rounded-[28px] bg-menta-100">
        {evento.imagenUrl && (
          <Image
            src={evento.imagenUrl}
            alt=""
            fill
            priority
            sizes="525px"
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}

async function Agenda() {
  await connection();
  // Solo publicados y sin terminar, el más próximo primero (lo filtra el servidor).
  const eventos = datosDePagina(await listarEventosPublicosAccion());
  const [primero, ...resto] = eventos;
  return (
    <>
      {primero && <Destacado evento={primero} />}
      <Seccion
        aria-labelledby="titulo-agenda"
        className="mx-auto max-w-[1196px] space-y-bloque md:px-[80px]"
      >
        <EncabezadoSeccion
          id="titulo-agenda"
          titulo="próximos eventos"
          bajada="Talleres, charlas y encuentros para cuidar de ti y compartir con otras personas."
        />
        {resto.length === 0 ? (
          <p className="text-h2 text-texto-secundario">
            {primero
              ? "Por ahora este es el único evento en la agenda."
              : "Pronto publicaremos nuevos encuentros."}
          </p>
        ) : (
          <ul className="grid gap-[25px] sm:grid-cols-2 md:grid-cols-3">
            {resto.map((e, i) => (
              <li key={e.id}>
                <TarjetaEvento
                  href={`/eventos/${e.slug}`}
                  fecha={cuando(e)}
                  titulo={e.titulo}
                  lugar={e.lugar}
                  imagenUrl={e.imagenUrl}
                  tono={i}
                />
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </>
  );
}

export default function PaginaEventos() {
  return (
    <>
      <Suspense fallback={<div className="h-[670px]" />}>
        <Agenda />
      </Suspense>

      {/* Instagram · comunidad CAPL */}
      <section
        aria-labelledby="titulo-instagram"
        className="flex flex-col items-center gap-bloque px-4 pt-[157px] text-center"
      >
        <EncabezadoSeccion
          id="titulo-instagram"
          titulo="conoce más de nuestros eventos"
          bajada="Encuentra novedades y próximos encuentros en nuestro Instagram."
          centrado
          className="max-w-[800px]"
        />
        <a
          href="https://www.instagram.com/cap_unilasallista/"
          target="_blank"
          rel="noreferrer"
          className={claseBoton("principal", "w-[240px]")}
        >
          Seguir en Instagram
        </a>
      </section>
      <IlustracionSobrePie src={comunidad} ancho={980} izquierda={175} detras />
    </>
  );
}
