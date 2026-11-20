import type { ReactNode } from "react";
import { EncabezadoPublico } from "@/componentes/organismos/encabezado-publico";
import { PiePublico } from "@/componentes/organismos/pie-publico";
import { BotonAyudaAhora } from "@/componentes/organismos/boton-ayuda-ahora";
import { AvisoCookies } from "@/componentes/organismos/aviso-cookies";

// Plantilla · Página pública (Figma · Plantillas/Página pública): encabezado, contenido, pie y ayuda flotante.
export default function PlantillaPublica({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#contenido-principal"
        className="sr-only z-50 rounded-pildora bg-accion-fondo px-5 py-3 font-medio text-accion-texto focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido principal
      </a>
      <EncabezadoPublico />
      <main id="contenido-principal" className="flex-1">
        {children}
      </main>
      <PiePublico />
      <BotonAyudaAhora />
      <AvisoCookies />
    </div>
  );
}
