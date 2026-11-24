import { ImagenEditorial } from "@/componentes/publico/imagen-editorial";
import type { StaticImageData } from "next/image";
import { Titulo } from "../atomos/titulo";
import { cn } from "../cn";

// La imagen y el texto comparten una fila en escritorio y tienen espacio propio en móvil.
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
    <article className="max-md:reticula-capl max-md:fila-editorial grid mx-auto max-w-[988px] items-center gap-y-5 md:min-h-[530px] md:grid-cols-[minmax(0,503px)_minmax(0,1fr)] md:gap-fila">
      <div
        className={cn(
          "col-span-4 min-w-0 space-y-4 max-md:text-center md:col-span-1 md:space-y-[24px]",
          invertida && "md:order-last",
        )}
      >
        <Titulo nivel={nivel} tamano="bloque">
          {titulo}
        </Titulo>
        <p className="max-w-[52ch] text-p leading-texto text-texto-secundario max-md:mx-auto md:max-w-none md:text-destacado">
          {texto}
        </p>
      </div>
      <ImagenEditorial
        src={ilustracion}
        alt=""
        sizes="(min-width: 1100px) 420px, (min-width: 900px) 44vw, (min-width: 480px) 420px, calc(100vw - 32px)"
        className={cn(
          "col-span-4 mx-auto h-auto w-full max-w-[420px] md:col-span-1",
          claseIlustracion,
        )}
      />
    </article>
  );
}
