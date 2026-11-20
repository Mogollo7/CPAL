"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "motion/react";
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
  const ir = (paso: number) =>
    setActual((a) => (a + paso + diapositivas.length) % diapositivas.length);
  const d = diapositivas[actual];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Bienvenida"
      className="relative isolate flex min-h-[560px] flex-col items-center overflow-hidden rounded-b-xl px-4 pb-5 pt-6 md:aspect-[16/9] md:min-h-[712px] md:max-h-[960px] md:pt-[182px]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={actual}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={d.fondo}
            alt=""
            fill
            priority={actual === 0}
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-x-0 bottom-0 h-[45px] bg-linear-to-b from-crema/0 to-crema" />
        </motion.div>
      </AnimatePresence>

      <div
        aria-live="polite"
        className="flex max-w-[600px] flex-col items-center gap-5 text-center"
      >
        <h1 className="font-titulo text-portada font-fuerte text-texto-titulo">
          {d.titulo}
        </h1>
        <p className="text-h2 leading-titulo text-texto-secundario">
          {d.bajada}
        </p>
        <BotonEnlace href={d.accion.href}>{d.accion.texto}</BotonEnlace>
      </div>

      <div className="mt-auto flex items-center gap-5 pt-bloque">
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
                "h-[6px] rounded-pildora transition-all duration-(--mov-medio)",
                i === actual
                  ? "w-[86px] bg-accion-fondo"
                  : "w-[6px] bg-blanco ring-1 ring-accion-fondo/60",
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
