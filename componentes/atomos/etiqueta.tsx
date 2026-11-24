import type { ReactNode } from "react";

// Figma · Átomos/Etiqueta: píldora lavanda 50, 13 px, 4 × 13.
export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pildora bg-fondo-suave px-[13px] py-1 text-caption font-medio text-texto-principal">
      {children}
    </span>
  );
}
