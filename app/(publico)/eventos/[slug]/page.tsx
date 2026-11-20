import { Suspense, cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { BotonEnlace, claseBoton } from "@/componentes/atomos/boton";
import { Etiqueta } from "@/componentes/atomos/etiqueta";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { formatoFecha, formatoHora } from "@/servidor/fechas";
import { verEventoPublicoAccion } from "@/servidor/acciones";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

// Una sola consulta aunque la pidan los metadatos y la página.
const cargarEvento = cache(async (slug: string) => {
  await connection();
  return verEventoPublicoAccion(slug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await cargarEvento((await params).slug);
  return r.ok
    ? {
        title: `${r.datos.titulo} · Eventos CAPL`,
        description: r.datos.descripcion.slice(0, 160),
      }
    : { title: "Evento no encontrado · CAPL" };
}

function duracion(inicio: Date, fin: Date) {
  const min = Math.round((fin.getTime() - inicio.getTime()) / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h && `${h} ${h === 1 ? "hora" : "horas"}`, m && `${m} minutos`]
    .filter(Boolean)
    .join(" ");
}

// Figma · /eventos/[slug]: columna 61,8 % (imagen, etiquetas, título, contenido) y 38,2 % (inscripción).
async function Detalle({ params }: Props) {
  const r = await cargarEvento((await params).slug);
  if (!r.ok) notFound();
  const e = r.datos;
  const inicio = new Date(e.inicio);
  const fin = e.fin ? new Date(e.fin) : null;
  const [primero, ...resto] = e.descripcion.split("\n").filter((p) => p.trim());

  return (
    <div className="grid gap-bloque md:grid-cols-[1.618fr_1fr]">
      <div className="space-y-5">
        <div className="relative aspect-[714/420] overflow-hidden rounded-xl bg-fondo-suave">
          {e.imagenUrl && (
            <Image
              src={e.imagenUrl}
              alt=""
              fill
              priority
              sizes="714px"
              className="object-cover"
            />
          )}
        </div>
        <ul className="flex flex-wrap gap-3">
          <li>
            <Etiqueta>
              {formatoFecha(inicio)} · {formatoHora(inicio)}
            </Etiqueta>
          </li>
          <li>
            <Etiqueta>{e.lugar}</Etiqueta>
          </li>
          {fin && (
            <li>
              <Etiqueta>{duracion(inicio, fin)}</Etiqueta>
            </li>
          )}
        </ul>
        <Titulo nivel="h1">{e.titulo}</Titulo>
        {primero && (
          <p className="text-destacado text-texto-secundario">{primero}</p>
        )}
        {resto.length > 0 && (
          <>
            <h2 className="font-titulo text-h2 font-fuerte text-texto-titulo">
              Qué vamos a ver
            </h2>
            <ul className="space-y-5">
              {resto.map((p) => (
                <li key={p} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[8px] size-[10px] shrink-0 rounded-circulo bg-agua-500"
                  />
                  {p.replace(/^[-•]\s*/, "")}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <aside
        aria-labelledby="titulo-inscripcion"
        className="h-fit space-y-4 rounded-l bg-blanco p-5 shadow-flotante"
      >
        <h2
          id="titulo-inscripcion"
          className="font-titulo text-h2 font-fuerte text-texto-titulo"
        >
          Inscríbete
        </h2>
        {/* ponytail: la inscripción propia (correos/inscripcion-evento.ts) sigue pendiente (C-01); por ahora
            el evento lleva su enlace de inscripción. */}
        {e.enlace ? (
          <>
            <p className="rounded-m bg-agua-100 px-5 py-4 text-texto-principal">
              Hay cupos disponibles.
            </p>
            <a
              href={e.enlace}
              target="_blank"
              rel="noreferrer"
              className={claseBoton("principal", "w-full")}
            >
              Completar inscripción
            </a>
          </>
        ) : (
          <p className="rounded-m bg-agua-100 px-5 py-4 text-texto-principal">
            Entrada libre: no necesitas inscribirte. Te esperamos.
          </p>
        )}
      </aside>
    </div>
  );
}

export default function PaginaDetalleEvento(props: Props) {
  return (
    <Seccion className="mx-auto max-w-[1280px] space-y-bloque">
      <BotonEnlace href="/eventos" tipo="borde">
        ← Volver a eventos
      </BotonEnlace>
      <Suspense fallback={<div className="h-[834px]" />}>
        <Detalle {...props} />
      </Suspense>
    </Seccion>
  );
}
