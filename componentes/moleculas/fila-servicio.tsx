import Image, { type StaticImageData } from "next/image";
import { Titulo } from "../atomos/titulo";
import { cn } from "../cn";

// Figma · Servicio · <nombre>: fila de 570 con título 36 + descripción y la ilustración de 420 × 360;
// las filas se alternan (texto a la izquierda / a la derecha).
export function FilaServicio({
  titulo,
  descripcion,
  ilustracion,
  invertida = false,
}: {
  titulo: string;
  descripcion: string;
  ilustracion: StaticImageData;
  invertida?: boolean;
}) {
  return (
    <article className="mx-auto grid max-w-[995px] items-center gap-bloque md:min-h-[570px] md:grid-cols-2 md:gap-[105px]">
      <div className={cn("space-y-5", invertida && "md:order-last")}>
        <Titulo nivel="h2" tamano="bloque">
          {titulo}
        </Titulo>
        <p className="text-h2 leading-titulo text-texto-secundario">
          {descripcion}
        </p>
      </div>
      <Image
        src={ilustracion}
        alt=""
        sizes="420px"
        className="mx-auto w-full max-w-[420px]"
      />
    </article>
  );
}
