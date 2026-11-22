import Image, { type StaticImageData } from "next/image";

// Figma · Perfiles de Contacto: las ilustraciones pasan de lado a lado en bucle, sin fin y sin cortes.
// Ocupa todo el ancho de la pantalla (no se recorta en una caja angosta). La pista repite el conjunto 6 veces
// y se desplaza uno (estilos/grano.css › .capl-marquesina), por eso el bucle no aparece al alejar el zoom.
const REPETICIONES = 6;
const FORMAS = [
  "fill-forma-lavanda",
  "fill-forma-miel",
  "fill-forma-agua",
] as const;

export function CarruselPerfiles({
  imagenes,
}: {
  imagenes: StaticImageData[];
}) {
  return (
    <div
      aria-hidden="true"
      className="-mx-borde my-bloque overflow-hidden max-[380px]:my-2"
    >
      <ul className="capl-marquesina flex w-max">
        {Array.from({ length: REPETICIONES }, (_, r) =>
          imagenes.map((src, i) => (
            <li
              key={`${r}-${i}`}
              className="relative mr-4 w-[clamp(10rem,48vw,20rem)] shrink-0 max-[380px]:w-[9rem] sm:mr-5"
            >
              <svg
                viewBox="0 0 310 288"
                className={`absolute inset-x-[7%] top-[10%] w-[86%] ${FORMAS[i % 3]}`}
              >
                <path d="M23.8 150C12.5 83.8 52.5 41.3 116.3 26.3c62.5-17.5 147.5 12.5 170 67.5 25 57.5-3.8 133.8-56.3 162.5-51.3 28.8-133.8 21.3-175-17.5C31.3 215 25 187.5 23.8 150Z" />
              </svg>
              <Image
                src={src}
                alt=""
                sizes="(max-width: 379px) 144px, (min-width: 600px) 288px, 48vw"
                loading={r < 2 ? "eager" : "lazy"}
                className="relative mx-auto w-full max-w-[288px]"
              />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
