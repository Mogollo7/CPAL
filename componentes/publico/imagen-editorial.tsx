"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { waapi } from "animejs/waapi";
import { useMovimientoReducido } from "./movimiento-reducido";

/** El HTML inicial ya muestra el contenido. Solo animamos una entrada posterior por scroll. */
function useAparicion<T extends HTMLElement>(conTexto = false) {
  const ref = useRef<T>(null);
  const vista = useRef(false);
  const reducir = useMovimientoReducido();

  useEffect(() => {
    const elemento = ref.current;
    if (
      reducir ||
      vista.current ||
      !elemento ||
      !window.IntersectionObserver ||
      !elemento.animate
    )
      return;

    let primeraMedicion = true;
    let animacion: ReturnType<typeof waapi.animate> | undefined;
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          vista.current = true;
          observador.disconnect();
          if (!primeraMedicion && !document.hidden) {
            animacion = waapi.animate(elemento, {
              opacity: [conTexto ? 0.9 : 0.65, 1],
              translate: [conTexto ? "0 3px" : "0 6px", "0 0px"],
              duration: conTexto ? 260 : 420,
              ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            });
          }
          break;
        }
        primeraMedicion = false;
      }
    });
    observador.observe(elemento);
    return () => {
      observador.disconnect();
      animacion?.revert();
    };
  }, [conTexto, reducir]);
  return ref;
}

export function ImagenEditorial({ alt, ...props }: ImageProps) {
  const ref = useAparicion<HTMLImageElement>();

  return <Image {...props} alt={alt} ref={ref} />;
}

export function PasoEditorial({ children }: { children: ReactNode }) {
  const ref = useAparicion<HTMLLIElement>(true);
  return (
    <li ref={ref} className="relative space-y-2">
      {children}
    </li>
  );
}
