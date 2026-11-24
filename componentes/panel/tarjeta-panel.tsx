import type { ReactNode } from "react";
import { cn } from "@/componentes/cn";
export function TarjetaPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-m border border-borde-suave bg-fondo-superficie p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
