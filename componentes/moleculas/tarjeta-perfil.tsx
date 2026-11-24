import Image from "next/image";
import { cn } from "../cn";

const FONDOS = ["bg-morado-100", "bg-menta-100", "bg-miel-100"] as const;

// Figma · Moléculas/Tarjeta de psicólogo: 328 × 570, blanca con radio 24, foto 296 × 330 (radio 16).
// Sin foto, el hueco toma uno de los tres tonos del sitio para que la fila no se vea vacía.
export function TarjetaPerfil({
  nombre,
  rol = "Psicología · en formación",
  fotoUrl,
  tono = 0,
}: {
  nombre: string;
  rol?: string;
  fotoUrl?: string | null;
  tono?: number;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-4 rounded-l bg-blanco p-4 shadow-flotante wrap-anywhere md:gap-5 md:rounded-[24px]">
      <div
        className={cn(
          "relative aspect-[296/330] overflow-hidden rounded-m",
          FONDOS[tono % FONDOS.length],
        )}
      >
        {fotoUrl && (
          <Image
            src={fotoUrl}
            alt=""
            fill
            sizes="(min-width: 1200px) 22vw, (min-width: 600px) 42vw, calc(100vw - 64px)"
            className="object-cover"
          />
        )}
      </div>
      <div className="space-y-2 px-2 pb-4">
        <h3 className="font-titulo text-subtitulo font-fuerte text-texto-titulo">
          {nombre}
        </h3>
        <p className="text-destacado text-texto-secundario">{rol}</p>
      </div>
    </article>
  );
}
