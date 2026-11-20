import { Phone } from "lucide-react";
import { cn } from "../cn";

// Figma · «Llamar al N»: radio 10, ícono de teléfono, 18/600. Cada número conserva su color en todo el sitio.
const TONOS: Record<string, string> = {
  "123": "bg-ayuda-fondo text-ayuda-texto hover:bg-amarillo-300",
  "106": "bg-linea-106 text-linea-106-texto",
  "155": "bg-linea-155 text-linea-155-texto",
  "141": "bg-linea-141 text-linea-141-texto",
};

export function EnlaceLlamar({
  telefono,
  className,
}: {
  telefono: string;
  className?: string;
}) {
  return (
    <a
      href={`tel:${telefono.replace(/\s/g, "")}`}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-3 rounded-s px-4 py-2 text-destacado font-medio whitespace-nowrap",
        TONOS[telefono] ?? "bg-accion-fondo text-accion-texto",
        className,
      )}
    >
      <Phone className="size-[18px]" aria-hidden="true" />
      Llamar al {telefono}
    </a>
  );
}
