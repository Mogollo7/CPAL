import Image, { type StaticImageData } from "next/image";
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
    <article className="reticula-capl fila-editorial mx-auto max-w-[988px] items-center gap-y-5 md:gap-x-[clamp(1rem,4.5vw,4.5rem)]">
      <div
        className={cn(
          "col-span-4 min-w-0 space-y-4 max-md:text-center md:col-span-2",
          invertida && "md:order-last",
        )}
      >
        <Titulo nivel={nivel} tamano="bloque">
          {titulo}
        </Titulo>
        <p className="max-w-[52ch] text-p leading-texto text-texto-secundario max-md:mx-auto">
          {texto}
        </p>
      </div>
      <Image
        src={ilustracion}
        alt=""
        sizes="(min-width: 1100px) 420px, (min-width: 900px) 44vw, (min-width: 480px) 420px, calc(100vw - 32px)"
        className={cn(
          "col-span-4 mx-auto h-auto w-full max-w-[420px] md:col-span-2",
          claseIlustracion,
        )}
      />
    </article>
  );
}
