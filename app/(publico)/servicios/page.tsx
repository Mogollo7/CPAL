import { ImagenEditorial } from "@/componentes/publico/imagen-editorial";
import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import { BotonEnlace } from "@/componentes/atomos/boton";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { IlustracionSobrePie } from "@/componentes/atomos/ilustracion-sobre-pie";
import { Titulo } from "@/componentes/atomos/titulo";
import { CabeceraIlustrada } from "@/componentes/organismos/cabecera-ilustrada";
import { PreguntasFrecuentes } from "@/componentes/organismos/preguntas-frecuentes";
import { ResumenPasos } from "@/componentes/organismos/resumen-pasos";
import serviciosData from "@/contenido/servicios.json";
import type { Servicios } from "@/contratos/servicio-contenido";
import hero from "@/contenido/ilustraciones/servicios-hero.webp";
import formacion from "@/contenido/ilustraciones/formacion-supervision.webp";
import habilitacion from "@/contenido/ilustraciones/habilitacion.webp";
import pasoPedir from "@/contenido/ilustraciones/paso-pedir-cita.webp";
import pasoConfirmar from "@/contenido/ilustraciones/paso-confirmacion.webp";
import mascotas from "@/contenido/ilustraciones/servicio-mascotas.webp";
import charlas from "@/contenido/ilustraciones/servicio-charlas.webp";
import acompanamiento from "@/contenido/ilustraciones/acompanamiento-individual.webp";
import cierre from "@/contenido/ilustraciones/cierre-servicios.webp";

export const metadata: Metadata = {
  title: "Servicios · CAPL",
  description:
    "Atención psicológica individual, evaluación neuropsicológica, orientación vocacional y más. Todos sin costo y presenciales.",
};

// Figma marca estas ilustraciones como provisionales: cuando lleguen las definitivas, se cambia solo aquí.
const ILUSTRACIONES: Record<string, StaticImageData> = {
  "atencion-psicologica-individual": formacion,
  "evaluacion-neuropsicologica": habilitacion,
  "orientacion-vocacional": pasoPedir,
  "certificacion-mascotas-apoyo-emocional": mascotas,
  "pruebas-psicometricas": pasoConfirmar,
  "charlas-empresariales-y-educativas": charlas,
};

const servicios = (serviciosData as Servicios).servicios.toSorted(
  (a, b) => a.orden - b.orden,
);

export default function ServiciosPage() {
  return (
    <>
      <CabeceraIlustrada
        tono="menta"
        titulo="Servicios"
        bajada="Todos nuestros servicios son gratuitos y presenciales. Elige el que mejor se ajuste a lo que buscas."
        ilustracion={hero}
      />

      <div className="px-4 sm:px-borde">
        {servicios.map((s, i) => (
          // Figma: la tercera fila va sobre fondo miel con grano.
          <div key={s.slug} className="relative isolate py-bloque md:py-0">
            {i === 2 && (
              <FondoGrano
                tono="miel"
                fundido="ambos"
                className="-inset-x-borde"
              />
            )}
            <article className="mx-auto grid max-w-[988px] items-center gap-bloque md:min-h-[530px] md:grid-cols-[minmax(0,503px)_minmax(0,1fr)] md:gap-fila">
              <div
                className={
                  i % 2 === 1
                    ? "space-y-[24px] md:order-last"
                    : "space-y-[24px]"
                }
              >
                <Titulo tamano="bloque">{s.nombre}</Titulo>
                <p className="text-destacado text-texto-secundario">
                  {s.descripcion}
                </p>
              </div>
              <ImagenEditorial
                src={ILUSTRACIONES[s.slug] ?? formacion}
                alt=""
                sizes="(min-width: 900px) 384px, (min-width: 480px) 420px, calc(100vw - 32px)"
                className="mx-auto w-full max-w-[420px]"
              />
            </article>
          </div>
        ))}
      </div>

      {/* ¿No sabes qué elegir? · orientación */}
      <section
        aria-labelledby="titulo-orientacion"
        className="mt-[120px] grid items-center gap-bloque bg-petroleo-700 px-4 py-seccion text-blanco sm:px-borde md:min-h-[800px] md:grid-cols-[minmax(0,522px)_minmax(0,470px)] md:justify-center md:gap-[64px]"
      >
        <ImagenEditorial
          src={acompanamiento}
          alt=""
          sizes="(min-width: 1200px) 522px, (min-width: 900px) 44vw, (min-width: 600px) 522px, calc(100vw - 32px)"
          className="mx-auto w-full max-w-[522px]"
        />
        <div className="space-y-5">
          <Titulo id="titulo-orientacion" className="text-blanco">
            ¿No sabes qué elegir?
          </Titulo>
          <p className="text-h2 leading-titulo">
            Puedes empezar con atención psicológica individual. En tu primera
            sesión te ayudamos a encontrar el acompañamiento que necesitas.
          </p>
          <BotonEnlace href="/pedir-cita" tipo="claro">
            Agendar cita
          </BotonEnlace>
        </div>
      </section>

      <ResumenPasos />
      <PreguntasFrecuentes
        ids={[
          "faq-gratuidad",
          "faq-servicios-disponibles",
          "faq-quienes-atienden",
          "faq-horarios-centro",
          "faq-elegir-psicologo",
          "faq-urgencias",
        ]}
      />
      <IlustracionSobrePie src={cierre} ancho={296} izquierda={449} />
    </>
  );
}
