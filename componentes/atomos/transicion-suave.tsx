import type { CSSProperties, ReactNode } from "react";
import { cn } from "../cn";

export interface TransicionSuaveProps {
  children: ReactNode;
  className?: string;
  direccion?: "arriba" | "abajo" | "ninguna";
  retraso?: number;
  duracion?: number;
}

export function TransicionSuave({
  children,
  className,
  direccion = "ninguna",
  retraso = 0,
  duracion,
}: TransicionSuaveProps) {
  const estilo = {
    "--entrada-y": { arriba: "4px", abajo: "-4px", ninguna: "0px" }[direccion],
    "--paso-retraso": `${retraso}s`,
    "--paso-duracion": duracion === undefined ? undefined : `${duracion}s`,
  } as CSSProperties;
  return (
    <div className={cn("capl-entrada-paso w-full", className)} style={estilo}>
      {children}
    </div>
  );
}
