"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BotonEnlace } from "../atomos/boton";
import { cn } from "../cn";

export type Diapositiva = {
  titulo: string;
  bajada: string;
  accion: { texto: string; href: string };
  fondo: StaticImageData;
};

const CONTROL =
  "flex size-[48px] items-center justify-center rounded-pildora border-[1.5px] border-borde-suave bg-crema/88 font-titulo text-h2 font-fuerte text-accion-suave-texto hover:bg-blanco";

// Figma · Organismos/Hero carrusel: 800 de alto con la ilustración de fondo, esquinas inferiores de 42,
// título de portada 110 y controles abajo. Sin avance automático: la persona decide el ritmo.
export function HeroCarrusel({
  diapositivas,
}: {
  diapositivas: Diapositiva[];
}) {
  const [actual, setActual] = useState(0);
  const movimientoReducido = useReducedMotion();
  const ir = (paso: number) =>
    setActual((a) => (a + paso + diapositivas.length) % diapositivas.length);
  const d = diapositivas[actual];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Bienvenida"
      className="escena-inicial relative isolate grid grid-rows-[auto_1fr_auto] justify-items-center gap-4 overflow-hidden rounded-b-xl px-borde pt-bloque pb-[5.5rem] md:grid-rows-[1fr_auto] md:pb-bloque"
    >
      <div className="relative aspect-video w-full max-w-[30rem] self-end overflow-hidden rounded-l md:absolute md:inset-0 md:-z-10 md:aspect-auto md:h-full md:max-w-none md:rounded-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={actual}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: movimientoReducido ? 0 : 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={d.fondo}
              alt=""
              fill
              priority={actual === 0}
              sizes="(min-width: 900px) 100vw, (min-width: 530px) 480px, calc(100vw - 32px)"
              className="object-contain md:object-cover md:object-top"
            />
            <div className="absolute inset-x-0 bottom-0 hidden h-[45px] bg-linear-to-b from-crema/0 to-crema md:block" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        aria-live="polite"
        className="flex w-full max-w-[36rem] self-center flex-col items-center gap-4 px-2 text-center wrap-anywhere md:px-0"
      >
        <h1 className="font-titulo text-portada font-fuerte text-texto-titulo">
          {d.titulo}
        </h1>
        <p className="max-w-[42ch] text-p leading-texto text-texto-secundario sm:text-h2">
          {d.bajada}
        </p>
        <BotonEnlace href={d.accion.href}>{d.accion.texto}</BotonEnlace>
      </div>

      <div className="flex max-w-full items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Diapositiva anterior"
          className={CONTROL}
          onClick={() => ir(-1)}
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          {diapositivas.map((x, i) => (
            <button
              key={x.titulo}
              type="button"
              aria-label={`Ir a «${x.titulo}»`}
              aria-current={i === actual}
              onClick={() => setActual(i)}
              className={cn(
                "grid size-[44px] shrink-0 place-items-center rounded-pildora before:h-[6px] before:rounded-pildora before:content-['']",
                i === actual
                  ? "before:w-[24px] before:bg-accion-fondo"
                  : "before:w-[6px] before:bg-blanco before:ring-1 before:ring-accion-fondo/60",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Diapositiva siguiente"
          className={CONTROL}
          onClick={() => ir(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
