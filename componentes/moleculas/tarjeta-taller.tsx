import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

// Figma · Taller / *: foto en gris + tinte de marca (multiplicar 86 %) + capa de contraste (estilos/imagen-taller.css).
export function TarjetaTaller({
  href,
  etiqueta,
  titulo,
  resumen,
  imagen,
  tinte = "morado",
}: {
  href: string;
  etiqueta: string;
  titulo: string;
  resumen?: string | null;
  imagen?: string | StaticImageData | null;
  tinte?: "morado" | "agua" | "amarillo";
}) {
  return (
    <Link
      href={href}
      className="capl-imagen-taller group flex aspect-[350/420] flex-col justify-between rounded-l p-5 text-blanco transition-transform duration-(--mov-medio) ease-entrada hover:-translate-y-1"
      data-tinte={tinte === "morado" ? undefined : tinte}
    >
      {imagen && (
        <Image
          src={imagen}
          alt=""
          fill
          sizes="(min-width: 900px) 350px, 100vw"
        />
      )}
      <span className="text-caption font-medio uppercase tracking-wide">
        {etiqueta}
      </span>
      <span className="space-y-4">
        <span className="block font-titulo font-fuerte text-tarjeta">
          {titulo}
        </span>
        {resumen && <span className="block text-destacado">{resumen}</span>}
      </span>
    </Link>
  );
}
