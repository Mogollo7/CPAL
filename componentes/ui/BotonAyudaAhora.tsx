"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { cn } from "./cn";

export interface BotonAyudaAhoraProps {
  /** Clases CSS opcionales */
  className?: string;
  /** Modo de posición: fijo en pantalla (esquina inferior) o en línea */
  posicion?: "fijo" | "en-linea";
}

/**
 * Botón accesible "Necesito ayuda ahora" (RF-EMG-04)
 *
 * Conduce a la Guía de Emergencias (/ayuda-inmediata).
 * Diseñado con el color distintivo oficial de Unilasallista (amarillo-500 / tinta),
 * con área táctil mínima de 48px, forma de píldora y sombra flotante suave.
 *
 * Se oculta automáticamente cuando el usuario ya se encuentra en /ayuda-inmediata.
 */
export function BotonAyudaAhora({
  className,
  posicion = "fijo",
}: BotonAyudaAhoraProps) {
  const pathname = usePathname();

  // Ocultar automáticamente si el usuario ya está en la guía de ayuda inmediata
  if (pathname === "/ayuda-inmediata") {
    return null;
  }

  const estilosPosicion =
    posicion === "fijo"
      ? "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      : "inline-flex";

  return (
    <Link
      href="/ayuda-inmediata"
      className={cn(
        estilosPosicion,
        "min-h-[48px] px-5 py-3 rounded-pildora shadow-flotante",
        "bg-ayuda-fondo text-ayuda-texto font-medio text-p",
        "hover:bg-amarillo-300 active:bg-amarillo-700 active:text-blanco",
        "transition-colors duration-mov-rapido items-center gap-3",
        "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
        "select-none",
        className,
      )}
      aria-label="Necesito ayuda ahora: Ir a la guía de líneas y emergencias psicológicas"
    >
      <LifeBuoy className="w-5 h-5 shrink-0 text-tinta" aria-hidden="true" />
      <span className="font-medio leading-titulo whitespace-nowrap">
        Necesito ayuda ahora
      </span>
    </Link>
  );
}
