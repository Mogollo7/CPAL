import type { Metadata } from "next";
import Image from "next/image";
import { BotonEnlace, claseBoton } from "@/componentes/atomos/boton";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import { CierrePedirCita } from "@/componentes/organismos/cierre-pedir-cita";
import casaAmarilla from "@/contenido/ilustraciones/casa-amarilla.webp";
import habilitacion from "@/contenido/ilustraciones/habilitacion.webp";
import formacion from "@/contenido/ilustraciones/formacion-supervision.webp";
import comunidad from "@/contenido/ilustraciones/comunidad-psicologia.webp";
import personaRecostada from "@/contenido/ilustraciones/cierre-persona-recostada.webp";
import fotoEstudiante from "@/contenido/fotos/estudiante-capl-fhd.webp";
import p1 from "@/contenido/ilustraciones/particulas/p1.webp";
import p2 from "@/contenido/ilustraciones/particulas/p2.webp";
import p3 from "@/contenido/ilustraciones/particulas/p3.webp";
import p4 from "@/contenido/ilustraciones/particulas/p4.webp";
import p5 from "@/contenido/ilustraciones/particulas/p5.webp";
import p6 from "@/contenido/ilustraciones/particulas/p6.webp";
import p7 from "@/contenido/ilustraciones/particulas/p7.webp";
import p8 from "@/contenido/ilustraciones/particulas/p8.webp";
import p9 from "@/contenido/ilustraciones/particulas/p9.webp";
import p10 from "@/contenido/ilustraciones/particulas/p10.webp";
import p11 from "@/contenido/ilustraciones/particulas/p11.webp";
import p12 from "@/contenido/ilustraciones/particulas/p12.webp";
import p13 from "@/contenido/ilustraciones/particulas/p13.webp";
import p14 from "@/contenido/ilustraciones/particulas/p14.webp";
import p15 from "@/contenido/ilustraciones/particulas/p15.webp";

export const metadata: Metadata = {
  title: "Qué es el CAPL · Cómo funciona",
  description:
    "El Centro de Atención Psicológica Lasallista: habilitado por el Ministerio de Salud, sin costo y con supervisión docente.",
};

const ESENCIAL = [
  ["Atención sin costo", "Acompañamiento psicológico para la comunidad."],
  [
    "Población atendida",
    "Personas de Caldas, el Valle de Aburrá y el suroccidente antioqueño.",
  ],
  [
    "Acompañamiento profesional",
    "Las prácticas cuentan con supervisión docente.",
  ],
] as const;

// Figma · Partículas de cuadrícula alrededor de «Formación con supervisión» (x, y, tamaño en px del frame 1280).
const PARTICULAS = [
  [p1, 1080, 0, 40],
  [p2, 628, 11, 40],
  [p3, 165, 464, 40],
  [p4, 165, 220, 36],
  [p5, 1080, 220, 36],
  [p6, 387, 317, 36],
  [p7, 957, 401, 36],
  [p8, 112, 650, 38],
  [p9, 1042, 550, 38],
  [p10, 450, 762, 34],
  [p11, 881, 688, 34],
  [p12, 355, 75, 44],
  [p13, 885, 75, 44],
  [p14, 313, 588, 44],
  [p15, 1116, 705, 44],
] as const;

export default function ComoFunciona() {
  return (
    <>
      {/* Portada · casa amarilla */}
      <section
        aria-labelledby="titulo-pagina"
        className="escena-inicial relative isolate grid content-center gap-bloque overflow-hidden py-bloque"
      >
        <FondoGrano tono="lavanda" fundido="abajo" />
        <div className="mx-auto max-w-[40rem] space-y-4 px-borde text-center">
          <Titulo nivel="h1" tamano="pagina" id="titulo-pagina">
            un espacio para escucharte
          </Titulo>
          <p className="text-h2 leading-titulo text-texto-secundario">
            El Centro de Atención Psicológica Lasallista acompaña el bienestar
            psicológico de nuestra comunidad.
          </p>
        </div>
        <Image
          src={casaAmarilla}
          alt="La casa amarilla del CAPL"
          sizes="(min-width: 1200px) 1120px, 100vw"
          className="mx-auto h-auto max-h-[min(58svh,32rem)] w-full max-w-[70rem] object-contain"
        />
      </section>

      {/* Habilitación · Ministerio de Salud */}
      <Seccion
        aria-labelledby="titulo-habilitacion"
        ritmo="editorial"
        className="mx-auto grid max-w-[1130px] items-center gap-bloque md:grid-cols-[minmax(0,1fr)_minmax(0,1.23fr)]"
      >
        <div className="mx-auto max-w-[52ch] space-y-5 max-md:text-center">
          <Titulo id="titulo-habilitacion" tamano="bloque">
            un espacio habilitado para cuidarte
          </Titulo>
          <p className="text-p leading-texto text-texto-secundario">
            El CAPL está habilitado por el Ministerio de Salud y Protección
            Social con el número único DHS803177. Inició su atención el 29 de
            julio de 2019.
          </p>
        </div>
        <Image
          src={habilitacion}
          alt=""
          sizes="(min-width: 1280px) 613px, (min-width: 900px) 48vw, (min-width: 650px) 613px, calc(100vw - 32px)"
          className="w-full max-w-[613px]"
        />
      </Seccion>

      {/* Lo esencial · información rápida */}
      <Seccion
        aria-label="Lo esencial"
        ritmo="editorial"
        className="mx-auto grid max-w-[1112px] items-center gap-bloque md:grid-cols-[minmax(0,1fr)_minmax(0,1.18fr)]"
      >
        <div className="space-y-bloque">
          <p className="text-h2 leading-titulo text-texto-secundario">
            El CAPL es el centro de atención psicológica de Unilasallista, en la
            casa amarilla de Caldas.
          </p>
          <ul className="space-y-bloque">
            {ESENCIAL.map(([titulo, texto]) => (
              <li
                key={titulo}
                className="flex gap-5 text-h2 font-medio leading-titulo text-texto-titulo"
              >
                <span aria-hidden="true" className="text-h2 text-accion-fondo">
                  ✓
                </span>
                <span>
                  {titulo}
                  <br />
                  {texto}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src={fotoEstudiante}
          alt="Estudiante en la casa amarilla del CAPL"
          sizes="(min-width: 1100px) 483px, (min-width: 900px) 44vw, (min-width: 540px) 483px, calc(100vw - 32px)"
          quality={95}
          className="aspect-[483/432] w-full max-w-[483px] rounded-l object-cover"
        />
      </Seccion>

      {/* Únetenos · estudia Psicología */}
      <section
        aria-labelledby="titulo-unete"
        className="bloque-editorial grid content-start justify-items-center gap-bloque px-borde text-center max-md:min-h-[min(90svh,48rem)]"
      >
        <EncabezadoSeccion
          id="titulo-unete"
          titulo="aprendemos a acompañar, juntos"
          bajada="Conoce el programa de Psicología de Unilasallista y forma parte de una comunidad que cuida."
          centrado
          className="mx-auto max-w-[900px]"
        />
        <Image
          src={comunidad}
          alt=""
          sizes="(min-width: 900px) 900px, 94vw"
          className="h-auto w-full max-w-[56rem]"
        />
        <a
          href="https://www.unilasallista.edu.co/carreras_profesionales/estudia-psicologia-en-medellin/"
          target="_blank"
          rel="noreferrer"
          className={claseBoton("principal", "min-w-[10rem]")}
        >
          Únetenos
        </a>
      </section>

      {/* Formación con supervisión */}
      <section
        aria-labelledby="titulo-formacion"
        className="bloque-editorial relative isolate mx-auto grid max-w-[1280px] content-center overflow-hidden md:min-h-[min(78svh,47rem)]"
      >
        {PARTICULAS.map(([src, x, y, t], i) => (
          <Image
            key={i}
            src={src}
            alt=""
            sizes="44px"
            className="pointer-events-none absolute -z-10 max-md:hidden"
            style={{
              left: `${(x / 1280) * 100}%`,
              top: `${(y / 928) * 100}%`,
              width: t,
              height: t,
            }}
          />
        ))}
        <div className="flex flex-col items-center gap-bloque px-borde text-center">
          <Titulo
            id="titulo-formacion"
            tamano="bloque"
            className="max-w-[534px]"
          >
            atención y formación con supervisión
          </Titulo>
          <Image
            src={formacion}
            alt=""
            sizes="541px"
            className="w-full max-w-[541px]"
          />
          <BotonEnlace href="/servicios">
            Ver todos nuestros servicios
          </BotonEnlace>
        </div>
      </section>

      <CierrePedirCita
        composicion="asomada"
        titulo="un espacio para ti, cuando lo necesites"
        bajada="Da el primer paso y solicita una cita para recibir acompañamiento."
        ilustracion={personaRecostada}
      />
    </>
  );
}
