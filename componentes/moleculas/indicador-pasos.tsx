import { cn } from "../cn";

// Figma · Moléculas/Indicador de pasos: círculos de 28 unidos por una línea; el actual en morado, los hechos
// en lavanda y los siguientes en blanco con borde.
export function IndicadorPasos({
  pasos,
  actual,
}: {
  pasos: readonly string[];
  actual: number;
}) {
  return (
    <ol aria-label="Progreso de la solicitud" className="flex items-center">
      {pasos.map((nombre, i) => {
        const n = i + 1;
        return (
          <li
            key={nombre}
            className={cn("flex items-center", n < pasos.length && "flex-1")}
          >
            <span
              aria-current={n === actual ? "step" : undefined}
              title={nombre}
              className={cn(
                "flex size-[28px] shrink-0 items-center justify-center rounded-circulo border text-caption font-medio",
                n === actual &&
                  "border-accion-fondo bg-accion-fondo text-accion-texto",
                n < actual &&
                  "border-morado-300 bg-morado-100 text-accion-suave-texto",
                n > actual && "border-borde bg-blanco text-texto-principal",
              )}
            >
              <span className="sr-only">Paso </span>
              {n}
              <span className="sr-only">: {nombre}</span>
            </span>
            {n < pasos.length && (
              <span aria-hidden="true" className="h-px flex-1 bg-morado-300" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
