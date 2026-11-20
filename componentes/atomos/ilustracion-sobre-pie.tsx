import Image, { type StaticImageData } from "next/image";

// Figma: en las páginas internas una ilustración «se asoma» sobre la curva del pie (103 px dentro de ella).
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
      className="relative z-10 -mb-[103px] pointer-events-none"
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
