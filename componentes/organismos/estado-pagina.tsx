import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";

// Figma · /404 y /error: ilustración de 560 × 400, título 42, texto y acciones, centrado.
export function EstadoPagina({
  titulo,
  texto,
  ilustracion,
  children,
}: {
  titulo: string;
  texto: string;
  ilustracion: StaticImageData;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-bloque px-4 py-seccion text-center">
      <Image
        src={ilustracion}
        alt=""
        priority
        sizes="560px"
        className="w-full max-w-[560px]"
      />
      <EncabezadoSeccion
        nivel="h1"
        titulo={titulo}
        bajada={texto}
        centrado
        className="max-w-[640px]"
      />
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </section>
  );
}
