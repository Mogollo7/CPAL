import Image, { type StaticImageData } from "next/image";
import { FondoGrano, type TonoGrano } from "../atomos/fondo-grano";
import { Titulo } from "../atomos/titulo";

// Figma · «<Página> · hero» (Servicios, Equipo, Eventos): ilustración a un lado, título 64 y presentación
// al otro, sobre un fondo con grano que se funde hacia abajo. Alto 650.
export function CabeceraIlustrada({
  titulo,
  bajada,
  ilustracion,
  tono,
}: {
  titulo: string;
  bajada: string;
  ilustracion: StaticImageData;
  tono: TonoGrano;
}) {
  return (
    <section
      aria-labelledby="titulo-pagina"
      className="relative isolate grid items-center gap-bloque px-4 py-cabecera sm:px-borde md:min-h-[650px] md:grid-cols-[minmax(0,595px)_minmax(0,450px)] md:justify-center md:gap-[70px]"
    >
      <FondoGrano tono={tono} fundido="abajo" />
      <Image
        src={ilustracion}
        alt=""
        sizes="525px"
        priority
        className="mx-auto w-full max-w-[525px]"
      />
      <div className="space-y-5">
        <Titulo nivel="h1" tamano="hero">
          {titulo}
        </Titulo>
        <p className="text-subtitulo leading-titulo text-texto-secundario">
          {bajada}
        </p>
      </div>
    </section>
  );
}
