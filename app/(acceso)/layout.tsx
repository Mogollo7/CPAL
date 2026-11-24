import { Suspense, type ReactNode } from "react";
import { EncabezadoPublico } from "@/componentes/organismos/encabezado-publico";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";

export default function LayoutAcceso({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo-pagina">
      <div className="hidden md:contents">
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="min-h-[4.25rem] lg:min-h-encabezado"
            />
          }
        >
          <EncabezadoPublico />
        </Suspense>
      </div>
      <main className="relative isolate flex flex-1 items-center justify-center px-4 py-6 max-md:mx-auto max-md:w-full max-md:max-w-md md:px-borde md:py-seccion">
        <FondoGrano
          tono="lavanda"
          fundido="abajo"
          className="hidden md:block"
        />
        <Suspense fallback={<p role="status">Cargando acceso…</p>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
