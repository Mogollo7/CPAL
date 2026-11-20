import Image, { type StaticImageData } from "next/image";
import { Titulo } from "../atomos/titulo";
import { cn } from "../cn";

// Fila de contenido al estilo de duolingo.com: alto mínimo 530, texto de 503 y la ilustración de hasta 530
// separados 101, título 48 y 24 entre título y texto. Las filas van seguidas, sin margen entre ellas, y se
// alternan (texto a la izquierda / a la derecha).
export function FilaIlustrada({
  titulo,
  texto,
  ilustracion,
  invertida = false,
  nivel = "h2",
  claseIlustracion,
}: {
  titulo: string;
  texto: string;
  ilustracion: StaticImageData;
  invertida?: boolean;
  nivel?: "h2" | "h3";
  claseIlustracion?: string;
}) {
  return (
    <article className="mx-auto grid max-w-[988px] items-center gap-bloque md:min-h-[530px] md:grid-cols-[minmax(0,503px)_minmax(0,1fr)] md:gap-fila">
      <div className={cn("space-y-[24px]", invertida && "md:order-last")}>
        <Titulo nivel={nivel} tamano="bloque">
          {titulo}
        </Titulo>
        <p className="text-destacado text-texto-secundario">{texto}</p>
      </div>
      <Image
        src={ilustracion}
        alt=""
        sizes="(min-width: 900px) 384px, 100vw"
        className={cn("mx-auto w-full max-w-[420px]", claseIlustracion)}
      />
    </article>
  );
}
