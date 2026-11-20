import type { ReactNode } from "react";

// Figma · Pregunta frecuente: fila de 76, pregunta 20/600, «+» a la derecha, separador lavanda al 40 %.
// <details> nativo: teclado, lector de pantalla y estado abierto sin JavaScript.
export function PreguntaFrecuente({
  pregunta,
  children,
}: {
  pregunta: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-morado-300/40">
      <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-5 py-4 text-h2 font-medio text-texto-titulo [&::-webkit-details-marker]:hidden">
        {pregunta}
        <span
          aria-hidden="true"
          className="text-[26px] leading-none transition-transform duration-(--mov-medio) group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-5 pr-7 text-destacado text-texto-secundario">
        {children}
      </div>
    </details>
  );
}
