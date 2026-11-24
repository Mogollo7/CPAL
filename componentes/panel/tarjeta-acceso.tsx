import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

export function TarjetaAcceso({
  ilustracion,
  titulo,
  children,
}: {
  ilustracion: StaticImageData;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="grid w-full max-w-md gap-4 rounded-l border border-borde-suave bg-fondo-superficie p-5 shadow-flotante sm:p-6 md:max-w-[1080px] md:grid-cols-2 md:gap-5 md:rounded-xl md:border-0 md:p-5">
      <div className="grid min-w-0 content-center gap-4 md:mx-auto md:w-full md:max-w-[464px] md:p-6">
        <h1 className="font-titulo text-h1 font-fuerte text-texto-titulo md:text-seccion">
          {titulo}
        </h1>
        {children}
      </div>
      <div className="hidden items-center justify-center rounded-l bg-morado-100 p-5 md:flex">
        <Image
          src={ilustracion}
          alt=""
          sizes="(min-width: 1164px) 420px, (min-width: 900px) 38vw, 0px"
          className="h-auto w-full max-w-[420px] object-contain"
        />
      </div>
    </div>
  );
}
