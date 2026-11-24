import type { Metadata } from "next";
import Image from "next/image";
import { BotonEnlace } from "@/componentes/atomos/boton";
import { EnlaceLlamar } from "@/componentes/atomos/enlace-llamar";
import { Seccion } from "@/componentes/atomos/seccion";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import anclajeData from "@/contenido/anclaje.json";
import type { AnclajeContenido } from "@/contratos/orientador";
import acompanamiento from "@/contenido/ilustraciones/primeros-auxilios-acompanamiento.webp";

export const metadata: Metadata = {
  title: "Primeros auxilios emocionales · CAPL",
  description:
    "Un ejercicio para volver al presente (5-4-3-2-1) y una guía para acompañar a alguien que siente mucha angustia.",
};

const anclaje = anclajeData as AnclajeContenido;
const guia = anclaje.guiaAcompanante;

// Figma · /ayuda-inmediata/primeros-auxilios: introducción lavanda, pasos 5-4-3-2-1 y guía para acompañantes
// sobre agua. El texto sale de contenido/anclaje.json (validado por el CAPL).
export default function PrimerosAuxiliosPage() {
  return (
    <>
      <div className="bg-morado-100 px-4 py-cabecera sm:px-borde">
        <div className="mx-auto flex max-w-[1076px] flex-wrap items-center justify-between gap-5">
          <BotonEnlace href="/ayuda-inmediata" tipo="borde">
            ← Ayuda inmediata
          </BotonEnlace>
          <EnlaceLlamar telefono="123" />
        </div>
        <EncabezadoSeccion
          nivel="h1"
          titulo="Primeros auxilios emocionales"
          bajada="Un ejercicio para volver al presente y una guía para acompañar a alguien que siente mucha angustia."
          className="mx-auto mt-bloque max-w-[1076px]"
        />
      </div>

      <Seccion
        aria-labelledby="titulo-anclaje"
        className="mx-auto max-w-[1076px] space-y-bloque md:px-0"
      >
        <EncabezadoSeccion
          id="titulo-anclaje"
          titulo={anclaje.titulo}
          bajada={anclaje.introduccion}
        />
        <ol className="space-y-4">
          {anclaje.pasos.map((p) => (
            <li
              key={p.numero}
              className="flex gap-5 rounded-l bg-blanco p-5 shadow-flotante"
            >
              <span
                aria-hidden="true"
                className="flex size-[56px] shrink-0 items-center justify-center rounded-circulo bg-morado-100 font-titulo text-h1 font-fuerte text-accion-suave-texto"
              >
                {p.numero}
              </span>
              <div className="space-y-2">
                <h3 className="font-titulo text-subtitulo font-fuerte text-texto-titulo">
                  {p.titulo}
                </h3>
                <p className="text-destacado text-texto-secundario">
                  {p.instruccion}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-destacado text-texto-secundario">
          {anclaje.cierre.mensaje}
        </p>
      </Seccion>

      {guia && (
        <section
          aria-labelledby="titulo-acompanar"
          className="bg-agua-100 px-4 py-seccion sm:px-borde"
        >
          <div className="mx-auto grid max-w-[1076px] items-center gap-bloque md:grid-cols-[minmax(0,1fr)_minmax(0,min(44%,455px))]">
            <div className="space-y-5">
              <h2
                id="titulo-acompanar"
                className="font-titulo text-bloque font-fuerte text-texto-titulo"
              >
                {guia.titulo}
              </h2>
              <ul className="list-disc space-y-3 pl-5 text-destacado">
                {guia.pautas.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <BotonEnlace href="/ayuda-inmediata">
                  Volver a Ayuda inmediata
                </BotonEnlace>
                <a
                  href="https://www.who.int/publications/i/item/9789241548205"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center rounded-pildora px-5 font-medio text-texto-enlace hover:underline"
                >
                  Consultar la guía de la OMS
                </a>
              </div>
            </div>
            <Image
              src={acompanamiento}
              alt=""
              sizes="455px"
              className="mx-auto w-full max-w-[455px]"
            />
          </div>
        </section>
      )}
    </>
  );
}
