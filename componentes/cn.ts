import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge no conoce los tokens de estilos/tokens.css: sin esto confunde `text-seccion` (tamaño)
// con `text-blanco` (color) y borra uno de los dos. Mantener en sincronía con --text-* y --spacing-*.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "portada",
        "hero",
        "titulo-pagina",
        "seccion",
        "bloque",
        "h1",
        "tarjeta",
        "subtitulo",
        "h2",
        "destacado",
        "p",
        "caption",
      ],
      spacing: ["seccion", "cabecera", "bloque", "borde", "encabezado"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
