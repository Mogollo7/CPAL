import type { ReactNode } from "react";
import { cn } from "../cn";

// Escala de Figma: portada 110 · hero 64 · página 48 · sección 42 · bloque 36 · h1 32 · tarjeta 28.
// Títulos en Nunito 800, en minúscula salvo la portada. El nivel (h1…h3) es semántico; el tamaño es visual.
const TAMANOS = {
  portada: "text-portada",
  hero: "text-hero",
  pagina: "text-seccion md:text-titulo-pagina",
  seccion: "text-seccion",
  bloque: "text-h1 leading-titulo md:text-bloque",
  h1: "text-h1 leading-titulo",
  tarjeta: "text-tarjeta",
} as const;

export function Titulo({
  nivel = "h2",
  tamano = "seccion",
  id,
  className,
  children,
}: {
  nivel?: "h1" | "h2" | "h3";
  tamano?: keyof typeof TAMANOS;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const Etiqueta = nivel;
  return (
    <Etiqueta
      id={id}
      className={cn(
        "font-titulo font-fuerte text-texto-titulo text-balance",
        TAMANOS[tamano],
        className,
      )}
    >
      {children}
    </Etiqueta>
  );
}
