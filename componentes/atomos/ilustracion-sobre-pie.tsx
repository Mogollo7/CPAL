import Image, { type StaticImageData } from "next/image";

// Figma: en las páginas internas una ilustración «se asoma» por detrás de la curva del pie (90 px dentro de ella, medido por superposición con Figma):
// el pie (z-10) la tapa, no al revés.
// `izquierda` es la posición en px del frame de 1280.
export function IlustracionSobrePie({
  src,
  ancho,
  izquierda,
}: {
  src: StaticImageData;
  ancho: number;
  izquierda: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative z-0 -mb-[90px] pointer-events-none"
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
