import type { ReactNode } from "react";
import { EncabezadoPublico } from "@/componentes/organismos/encabezado-publico";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";

export const instant = false;

export default function LayoutAcceso({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo-pagina">
      <EncabezadoPublico />
      <main className="relative isolate flex flex-1 items-center justify-center px-borde py-cabecera">
        <FondoGrano tono="lavanda" fundido="abajo" />
        {children}
      </main>
    </div>
  );
}
