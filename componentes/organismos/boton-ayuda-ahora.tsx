"use client";

import { usePathname } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { BotonEnlace } from "../atomos/boton";

// La página de ayuda ya muestra sus propios accesos de llamada en el contenido.
export function BotonAyudaAhora() {
  const ruta = usePathname();
  if (ruta === "/ayuda-inmediata") return null;

  return (
    <BotonEnlace
      href="/ayuda-inmediata"
      tipo="ayuda"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 max-w-[calc(100%-2rem)] px-4 py-2 lg:right-[34px] lg:bottom-[34px] lg:px-5 lg:py-5"
    >
      <LifeBuoy className="size-[22px]" aria-hidden="true" />
      Necesito ayuda ahora
    </BotonEnlace>
  );
}
