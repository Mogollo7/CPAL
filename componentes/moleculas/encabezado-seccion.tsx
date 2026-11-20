import type { ReactNode } from "react";
import { Titulo } from "../atomos/titulo";
import { cn } from "../cn";

// Figma: título de sección 42 + bajada 20 en texto secundario, separados 24.
export function EncabezadoSeccion({
  titulo,
  bajada,
  id,
  nivel = "h2",
  centrado = false,
  className,
}: {
  titulo: ReactNode;
  bajada?: ReactNode;
  id?: string;
  nivel?: "h1" | "h2";
  centrado?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn("space-y-[24px]", centrado && "text-center", className)}
    >
      <Titulo nivel={nivel} id={id}>
        {titulo}
      </Titulo>
      {bajada && (
        <p className="text-h2 leading-titulo text-texto-secundario text-pretty">
          {bajada}
        </p>
      )}
    </header>
  );
}
