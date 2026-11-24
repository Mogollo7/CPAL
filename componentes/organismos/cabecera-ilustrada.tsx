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
      className="reticula-capl relative isolate items-center px-borde py-cabecera md:min-h-[32rem]"
    >
      <FondoGrano tono={tono} fundido="abajo" />
      <Image
        src={ilustracion}
        alt=""
        sizes="(min-width: 1200px) 525px, (min-width: 900px) 44vw, (min-width: 600px) 525px, calc(100vw - 32px)"
        priority
        className="order-last col-span-4 mx-auto h-auto w-full max-w-[525px] md:order-none md:col-span-2"
      />
      <div className="col-span-4 min-w-0 space-y-4 md:col-span-2">
        <Titulo id="titulo-pagina" nivel="h1" tamano="hero">
          {titulo}
        </Titulo>
        <p className="text-subtitulo leading-titulo text-texto-secundario">
          {bajada}
        </p>
      </div>
    </section>
  );
}
