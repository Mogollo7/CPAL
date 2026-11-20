import Image, { type StaticImageData } from "next/image";
import { cn } from "../cn";

// Figma: en las páginas internas una ilustración «se asoma» sobre la curva del pie. `izquierda` es la posición en px
// del frame de 1280.
// Por defecto va ENCIMA de la curva (103 px dentro de ella). Solo Eventos la lleva DETRÁS: el pie la tapa y queda
// 13 px más arriba (medido por superposición con la captura de Figma). El pie no fija z-index: gana el orden del DOM.
export function IlustracionSobrePie({
  src,
  ancho,
  izquierda,
  detras = false,
}: {
  src: StaticImageData;
  ancho: number;
  izquierda: number;
  detras?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative pointer-events-none",
        detras ? "z-0 -mb-[90px]" : "z-10 -mb-[103px]",
      )}
    >
      <Image
        src={src}
        alt=""
        sizes={`${ancho}px`}
        style={{ width: ancho, marginLeft: `${(izquierda / 1280) * 100}%` }}
        className="max-w-[80%]"
      />
    </div>
  );
}
