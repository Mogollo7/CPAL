import type { ComponentProps } from "react";
import { cn } from "../cn";

// Ritmo (Figma + duolingo.com): 96 arriba/abajo («seccion»), 68 en cabeceras de página («cabecera»),
// 140 arriba en una sección de transición con fondo nuevo («entrada»); 42 a los lados.
export function Seccion({
  ritmo = "seccion",
  className,
  ...props
}: ComponentProps<"section"> & { ritmo?: "seccion" | "cabecera" | "entrada" }) {
  return (
    <section
      className={cn(
        "relative isolate px-4 sm:px-borde",
        ritmo === "seccion" && "py-cabecera md:py-seccion",
        ritmo === "cabecera" && "py-bloque md:py-cabecera",
        // Duolingo: la sección que trae un fondo nuevo respira 140 arriba.
        ritmo === "entrada" &&
          "pt-seccion pb-cabecera md:pt-entrada md:pb-seccion",
        className,
      )}
      {...props}
    />
  );
}
