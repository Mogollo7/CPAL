import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/componentes/cn";

interface EstadoVacioProps {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
  className?: string;
}

export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: EstadoVacioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-circulo bg-morado-50 border border-morado-100 flex items-center justify-center text-morado-600 mb-4 shadow-xs">
        <Icono className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-h2 font-weight-fuerte text-texto-titulo mb-2">
        {titulo}
      </h3>
      <p className="text-p text-texto-secundario max-w-md mb-6 leading-relaxed">
        {descripcion}
      </p>
      {accion && <div className="flex items-center gap-3">{accion}</div>}
    </div>
  );
}
