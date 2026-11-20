import type { ComponentProps } from "react";
import { cn } from "../cn";

// Ritmo de Figma: 110 arriba/abajo («seccion») o 68 en cabeceras de página («cabecera»), 42 a los lados.
export function Seccion({
  ritmo = "seccion",
  className,
  ...props
}: ComponentProps<"section"> & { ritmo?: "seccion" | "cabecera" }) {
  return (
    <section
      className={cn(
        "relative isolate px-4 sm:px-borde",
        ritmo === "seccion"
          ? "py-cabecera md:py-seccion"
          : "py-bloque md:py-cabecera",
        className,
      )}
      {...props}
    />
  );
}
