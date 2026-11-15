"use client";

import React, { useEffect, useRef } from "react";
import { animate, type JSAnimation } from "animejs";
import { cn } from "./cn";

export interface IlustracionBiofilicaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tipo de micro-movimiento relajante */
  tipo?: "respiracion-lenta" | "flotar-hoja" | "ronroneo-suave";
  /** Duración del ciclo en milisegundos (mínimo 6000ms según N07) */
  cicloMs?: number;
}

/**
 * Envoltorio para ilustraciones del CAPL con micro-movimiento biofílico
 * impulsado por Anime.js.
 *
 * Principios psicológicos:
 * 1. Frecuencia ultrasuave (0.1 Hz – 0.16 Hz): Ciclos de 6s o más que emulan
 *    la respiración coherente en reposo e inducen desaceleración parasimpática.
 * 2. Amplitud mínima (2px a 4px o escala al 101.5%): Acompaña visualmente sin distraer.
 * 3. Se desactiva inmediatamente si el usuario prefiere movimiento reducido.
 */
export function IlustracionBiofilica({
  children,
  className,
  tipo = "respiracion-lenta",
  cicloMs = 6400,
  ...props
}: IlustracionBiofilicaProps) {
  const elementoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Si el usuario tiene activo prefers-reduced-motion, no iniciamos la animación
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;
    }

    const el = elementoRef.current;
    if (!el) return;

    let animacion: JSAnimation | null = null;

    if (tipo === "respiracion-lenta") {
      // Pulso orgánico senoidal que expande 1.5% y relaja
      animacion = animate(el, {
        scale: [1, 1.015, 1],
        duration: cicloMs,
        ease: "inOutSine",
        loop: true,
      });
    } else if (tipo === "flotar-hoja") {
      // Mecida suave de hoja o nube (±3px y ±1.2deg)
      animacion = animate(el, {
        translateY: [-3, 3, -3],
        rotate: [-1.2, 1.2, -1.2],
        duration: cicloMs,
        ease: "inOutQuad",
        loop: true,
      });
    } else if (tipo === "ronroneo-suave") {
      // Vibración cálida casi imperceptible (±0.6px) para mascotas de apoyo
      animacion = animate(el, {
        translateY: [-0.6, 0.6, -0.6],
        scale: [1, 1.008, 1],
        duration: cicloMs / 2,
        ease: "inOutSine",
        loop: true,
      });
    }

    return () => {
      if (animacion) {
        animacion.revert();
      }
    };
  }, [tipo, cicloMs]);

  return (
    <div ref={elementoRef} className={cn("inline-block", className)} {...props}>
      {children}
    </div>
  );
}
