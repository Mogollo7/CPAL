import { ImagenEditorial } from "@/componentes/publico/imagen-editorial";
import Link from "next/link";
import { cn } from "../cn";

const FONDOS = ["bg-menta-100", "bg-ciruela-50", "bg-miel-100"] as const;

// Figma · Tarjeta evento (/eventos): 355 × 390 blanca radio 22, imagen 327 × 205 radio 14, fecha, nombre 24,
// lugar y «Ver evento →». Toda la tarjeta es el enlace.
export function TarjetaEvento({
  href,
  fecha,
  titulo,
  lugar,
  imagenUrl,
  tono = 0,
  tipo,
}: {
  href: string;
  fecha: string;
  titulo: string;
  lugar: string;
  imagenUrl?: string | null;
  tono?: number;
  tipo?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-4 rounded-[22px] bg-blanco p-[14px] shadow-flotante transition-transform duration-(--mov-medio) ease-entrada motion-safe:hover:-translate-y-1"
    >
      <div
        className={cn(
          "relative aspect-[327/205] overflow-hidden rounded-[14px]",
          FONDOS[tono % FONDOS.length],
        )}
      >
        {imagenUrl && (
          <ImagenEditorial
            src={imagenUrl}
            alt=""
            fill
            sizes="327px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-[10px] pb-[10px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption font-medio uppercase text-petroleo-700">
            {fecha}
          </span>
          {tipo && (
            <span className="text-caption font-medio text-texto-secundario">
              {tipo}
            </span>
          )}
        </div>
        <span className="font-titulo text-subtitulo font-fuerte text-texto-titulo">
          {titulo}
        </span>
        <span className="text-destacado text-texto-secundario">{lugar}</span>
        <span className="mt-auto pt-3 font-medio text-destacado text-accion-fondo group-hover:underline">
          Ver evento →
        </span>
      </div>
    </Link>
  );
}
