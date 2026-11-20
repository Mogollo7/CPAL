import { LifeBuoy } from "lucide-react";
import { BotonEnlace } from "../atomos/boton";

// Figma · Moléculas/Botón flotante de ayuda: amarillo, 26 × 21, a 34 de la esquina. Siempre visible,
// también en /ayuda-inmediata (N01). Sin movimiento en reposo.
export function BotonAyudaAhora() {
  return (
    <BotonEnlace
      href="/ayuda-inmediata"
      tipo="ayuda"
      className="fixed bottom-4 right-4 z-50 py-5 sm:bottom-[34px] sm:right-[34px]"
    >
      <LifeBuoy className="size-[22px]" aria-hidden="true" />
      Necesito ayuda ahora
    </BotonEnlace>
  );
}
