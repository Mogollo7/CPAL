import type { Metadata } from "next";
import Image from "next/image";
import { EnlaceLlamar } from "@/componentes/atomos/enlace-llamar";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { IlustracionSobrePie } from "@/componentes/atomos/ilustracion-sobre-pie";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import { OrientadorCrisis } from "@/componentes/publico/orientador-crisis";
import { EjercicioAnclaje } from "@/componentes/publico/ejercicio-anclaje";
import emergenciasData from "@/contenido/emergencias.json";
import type { Emergencias } from "@/contratos/emergencias";
import telefono from "@/contenido/ilustraciones/ayuda-telefono.webp";
import respiracion from "@/contenido/ilustraciones/ayuda-respiracion.webp";
import abrazo from "@/contenido/ilustraciones/cierre-abrazo.webp";

export const metadata: Metadata = {
  title: "Ayuda inmediata · CAPL",
  description:
    "Si estás en peligro llama al 123. Líneas gratuitas, qué hacer en cada caso y un ejercicio para calmarte.",
};

const datos = emergenciasData as Emergencias;

// El contenido (códigos, líneas, orientador) sale de contenido/*.json, validado por el CAPL; aquí solo el diseño.
export default function AyudaInmediataPage() {
  return (
    <>
      {/* Cabecera · llamar a emergencias */}
      <section
        aria-labelledby="titulo-pagina"
        className="relative isolate grid items-center gap-bloque px-4 py-cabecera sm:px-borde md:min-h-[671px] md:grid-cols-[612px_523px] md:justify-between md:px-[102px]"
      >
        <FondoGrano tono="lavanda" fundido="abajo" />
        <div className="space-y-5">
          <Titulo nivel="h1" tamano="hero" id="titulo-pagina">
            Si estás en peligro
            <br />
            llama
          </Titulo>
          <EnlaceLlamar
            telefono="123"
            className="min-h-[58px] px-5 text-destacado"
          />
          <p className="text-destacado text-texto-secundario">
            Línea gratuita de emergencias en Antioquia.
          </p>
        </div>
        <Image
          src={telefono}
          alt=""
          priority
          sizes="523px"
          className="mx-auto w-full max-w-[523px]"
        />
      </section>

      {/* Orientador · qué está pasando + respirar */}
      <Seccion
        aria-label="Orientador"
        className="mx-auto grid max-w-[1280px] gap-bloque md:grid-cols-[1fr_456px] md:px-[102px]"
      >
        <OrientadorCrisis />
        <aside
          aria-labelledby="titulo-respirar"
          className="h-fit space-y-5 rounded-l bg-fondo-suave p-5 text-center"
        >
          <h2
            id="titulo-respirar"
            className="font-titulo text-tarjeta font-fuerte text-texto-titulo"
          >
            Respira conmigo un minuto
          </h2>
          <Image
            src={respiracion}
            alt=""
            sizes="242px"
            className="mx-auto w-[242px]"
          />
          <a
            href="#anclaje"
            className="inline-flex min-h-[48px] items-center rounded-s bg-accion-fondo px-5 font-medio text-accion-texto hover:bg-accion-fondo-activo"
          >
            Hacer el ejercicio
          </a>
        </aside>
      </Seccion>

      {/* Qué hacer en cada caso */}
      <Seccion
        aria-labelledby="titulo-casos"
        className="mx-auto max-w-[1280px] space-y-bloque md:px-[102px]"
      >
        <EncabezadoSeccion
          id="titulo-casos"
          titulo="Qué hacer en cada caso"
          bajada="Si hay peligro inmediato, llama al 123."
        />
        <ul className="grid gap-5 md:grid-cols-2">
          {datos.codigos.map((c) => {
            const linea =
              c.lineas.find((l) => l.telefono !== "123") ?? c.lineas[0];
            return (
              <li
                key={c.id}
                id={`codigo-${c.id}`}
                className="scroll-mt-[110px] space-y-3 rounded-[13px] bg-blanco p-5 shadow-flotante"
              >
                <span className="inline-block rounded-[7px] bg-fondo-suave px-3 py-1 text-caption font-medio text-texto-titulo">
                  {c.nombre}
                </span>
                <h3 className="font-titulo text-subtitulo font-fuerte text-texto-titulo">
                  {c.situacion}
                </h3>
                <ol className="list-inside list-decimal text-texto-secundario">
                  {c.queHacer.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>
                {linea && <EnlaceLlamar telefono={linea.telefono} />}
              </li>
            );
          })}
        </ul>
      </Seccion>

      {/* Líneas gratuitas */}
      <Seccion
        id="directorio-lineas"
        aria-labelledby="titulo-lineas"
        className="mx-auto max-w-[1280px] space-y-bloque md:px-[102px]"
      >
        <EncabezadoSeccion
          id="titulo-lineas"
          titulo="Líneas gratuitas"
          bajada="Disponibles las 24 horas. Marca el número desde tu teléfono."
        />
        <ul className="space-y-4">
          {datos.directorio.map((l) => (
            <li
              key={l.telefono}
              className="flex flex-wrap items-center gap-5 rounded-m bg-blanco p-4 shadow-flotante"
            >
              <span className="flex h-[52px] min-w-[76px] items-center justify-center rounded-s bg-fondo-suave px-2 font-titulo text-subtitulo font-fuerte text-texto-titulo">
                {l.telefono}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-h2 font-medio text-texto-titulo">
                  {l.nombre}
                </p>
                <p className="text-texto-secundario">
                  {l.porConfirmar ? "Horario por confirmar" : l.horario}
                </p>
              </div>
              <EnlaceLlamar telefono={l.telefono} />
            </li>
          ))}
        </ul>
      </Seccion>

      <div
        id="anclaje"
        className="mx-auto max-w-[1076px] scroll-mt-[110px] px-4"
      >
        <EjercicioAnclaje />
      </div>

      {/* Cierre */}
      <section className="px-4 pt-seccion text-center">
        <Titulo tamano="bloque">
          Pedir ayuda también es un acto de valentía.
        </Titulo>
      </section>
      <IlustracionSobrePie src={abrazo} ancho={360} izquierda={460} />
    </>
  );
}
