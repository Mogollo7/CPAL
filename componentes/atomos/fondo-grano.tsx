import { cn } from "../cn";

export type TonoGrano =
  "lavanda" | "lavanda-claro" | "crema" | "menta" | "miel" | "ciruela";

/**
 * Fondo con degradado y ruido (estilos/grano.css). Va dentro de un contenedor `relative isolate`
 * y se pinta detrás del contenido. `abajo`: cabecera de página (solo se funde hacia abajo);
 * `ambos`: fondo en medio de la página (se funde arriba y abajo).
 */
export function FondoGrano({
  tono = "lavanda",
  fundido = "ambos",
  className,
}: {
  tono?: TonoGrano;
  fundido?: "ambos" | "abajo";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("capl-grano", className)}
      data-tono={tono}
      data-fundido={fundido}
    />
  );
}
