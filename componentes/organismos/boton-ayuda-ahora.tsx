import { LifeBuoy } from "lucide-react";
import { BotonEnlace } from "../atomos/boton";

// Figma · Moléculas/Botón flotante de ayuda: amarillo, 26 × 21, a 34 de la esquina. Siempre visible,
// también en /ayuda-inmediata (N01). Sin movimiento en reposo.
export function BotonAyudaAhora() {
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
