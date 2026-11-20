import Image, { type StaticImageData } from "next/image";
import { BotonEnlace } from "../atomos/boton";
import { IlustracionSobrePie } from "../atomos/ilustracion-sobre-pie";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";

function Llamado({ titulo, bajada }: { titulo: string; bajada?: string }) {
  return (
    <div className="flex flex-col items-center gap-bloque px-4 text-center">
      <EncabezadoSeccion
        id="titulo-cierre"
        titulo={titulo}
        bajada={bajada}
        centrado
      />
      <BotonEnlace href="/pedir-cita">Pedir mi cita</BotonEnlace>
    </div>
  );
}

// Figma · Cierre · pedir cita. Dos composiciones:
// «curva» (Inicio): curva morada que abraza la ilustración y se une al pie (se monta 103 px sobre él);
// «asomada» (páginas internas): la ilustración se apoya sobre la curva del pie, a la izquierda.
export function CierrePedirCita({
  titulo = "da el primer paso a tu ritmo",
  bajada,
  ilustracion,
  composicion = "curva",
}: {
  titulo?: string;
  bajada?: string;
  ilustracion: StaticImageData;
  composicion?: "curva" | "asomada";
}) {
  if (composicion === "asomada")
    return (
      <section aria-labelledby="titulo-cierre" className="pt-[90px]">
        <Llamado titulo={titulo} bajada={bajada} />
        <div className="mt-seccion">
          <IlustracionSobrePie src={ilustracion} ancho={640} izquierda={48} />
        </div>
      </section>
    );

  return (
    <section
      aria-labelledby="titulo-cierre"
      className="relative z-10 -mb-[103px] pt-[80px]"
    >
      <Llamado titulo={titulo} bajada={bajada} />
      <div className="relative mt-[93px] h-[500px] w-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 1280 500"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full fill-morado-600"
        >
          <path d="M0 20c250 0 265 240 640 240S1030 20 1280 20v480H0Z" />
        </svg>
        <Image
          src={ilustracion}
          alt=""
          sizes="440px"
          className="relative mx-auto -mt-5 w-[440px]"
        />
      </div>
    </section>
  );
}
