import React from "react";
import { EncabezadoPublico } from "@/componentes/ui/EncabezadoPublico";
import { PiePublico } from "@/componentes/ui/PiePublico";
import { BotonAyudaAhora } from "@/componentes/ui/BotonAyudaAhora";

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-fondo-pagina text-texto-principal">
      {/* Enlace accesible para saltar directo al contenido */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-accion-fondo text-accion-texto px-4 py-2.5 rounded-m font-medio focus-visible:outline-3 focus-visible:outline-foco shadow-md"
      >
        Saltar al contenido principal
      </a>

      {/* Cabecera con banner de urgencias integrado y navegación accesible */}
      <EncabezadoPublico />

      {/* Contenedor principal de vistas públicas */}
      <main id="contenido-principal" className="flex-1">
        {children}
      </main>

      {/* Pie de página oficial */}
      <PiePublico />

      {/* Botón flotante accesible "Necesito ayuda ahora" (se oculta en /ayuda-inmediata) */}
      <BotonAyudaAhora />
    </div>
  );
}
