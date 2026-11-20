import type { Metadata } from "next";
import Image from "next/image";
import { BotonEnlace, claseBoton } from "@/componentes/atomos/boton";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { IlustracionSobrePie } from "@/componentes/atomos/ilustracion-sobre-pie";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { CarruselPerfiles } from "@/componentes/organismos/carrusel-perfiles";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import p1 from "@/contenido/ilustraciones/perfiles/perfil-1.webp";
import p2 from "@/contenido/ilustraciones/perfiles/perfil-2.webp";
import p3 from "@/contenido/ilustraciones/perfiles/perfil-3.webp";
import p4 from "@/contenido/ilustraciones/perfiles/perfil-4.webp";
import p5 from "@/contenido/ilustraciones/perfiles/perfil-5.webp";
import p6 from "@/contenido/ilustraciones/perfiles/perfil-6.webp";
import p7 from "@/contenido/ilustraciones/perfiles/perfil-7.webp";
import canales from "@/contenido/ilustraciones/contacto-canales.webp";
import chateando from "@/contenido/ilustraciones/cierre-chateando.webp";

export const metadata: Metadata = {
  title: "Contacto · CAPL",
  description:
    "WhatsApp, correo, horario y cómo llegar a la casa amarilla del CAPL en Caldas (Antioquia).",
};

const WHATSAPP = "https://wa.me/573102096266";
const CORREO = "mailto:capl@unilasallista.edu.co";
const OSM = "https://www.openstreetmap.org";
const MAPA = `${OSM}/?mlat=6.09968&mlon=-75.63854#map=18/6.09968/-75.63854`;
const MAPA_EMBEBIDO = `${OSM}/export/embed.html?bbox=-75.641%2C6.098%2C-75.636%2C6.102&layer=mapnik&marker=6.09968%2C-75.63854`;

const PERFILES = [p1, p2, p3, p4, p5, p6, p7];

const DATOS = [
  ["Dirección", "Carrera 51 # 118 Sur – 57, Caldas (Antioquia)"],
  ["Horario", "De lunes a viernes · 8:00 a. m. a 5:00 p. m."],
  ["Correo", "capl@unilasallista.edu.co"],
] as const;

const TARJETA = "space-y-4 rounded-l bg-blanco/80 p-5";

export default function ContactoPage() {
  return (
    <>
      <section
        aria-labelledby="titulo-pagina"
        className="relative isolate px-4 pt-cabecera sm:px-borde"
      >
        <FondoGrano tono="lavanda" fundido="abajo" className="h-[840px]" />
        <EncabezadoSeccion
          nivel="h1"
          id="titulo-pagina"
          titulo="Contacta con nosotros"
          bajada="Estamos para resolver tus dudas. Respondemos en horario de atención."
        />
        <CarruselPerfiles imagenes={PERFILES} />
      </section>

      {/* Contáctanos */}
      <section
        aria-labelledby="titulo-contactanos"
        className="flex flex-col items-center gap-5 px-4 py-cabecera text-center"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 43 47"
          className="w-[43px] fill-estrella"
        >
          <path d="M21.5 0l5.6 16.2L43 17.9 30.6 28.4 34.3 47 21.5 37.4 8.7 47l3.7-18.6L0 17.9l15.9-1.7Z" />
        </svg>
        <Titulo id="titulo-contactanos" tamano="bloque">
          Contáctanos
        </Titulo>
        <p className="text-h2 text-texto-titulo">
          Estamos aquí para escucharte y acompañarte.
        </p>
        <BotonEnlace href="/pedir-cita" tipo="ayuda" className="font-medio">
          Pedir cita
        </BotonEnlace>
      </section>

      {/* Canales de contacto */}
      <section
        aria-labelledby="titulo-canales"
        className="mx-auto grid max-w-[856px] items-center gap-bloque px-4 py-bloque md:grid-cols-[460px_1fr]"
      >
        <div className="space-y-3">
          <h2
            id="titulo-canales"
            className="font-titulo text-tarjeta font-fuerte text-texto-titulo"
          >
            También puedes escribirnos
          </h2>
          <p className="text-h2 text-texto-titulo">
            Escríbenos por WhatsApp o envíanos un correo.
          </p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="block text-h2 font-medio text-texto-titulo hover:underline"
          >
            WhatsApp · 310 209 6266
          </a>
          <a
            href={CORREO}
            className="block text-h2 font-medio text-texto-titulo hover:underline"
          >
            capl@unilasallista.edu.co
          </a>
        </div>
        <Image
          src={canales}
          alt=""
          sizes="391px"
          className="mx-auto w-full max-w-[391px]"
        />
      </section>

      {/* Datos del centro y cómo llegar */}
      <Seccion
        aria-label="Datos del centro"
        className="mx-auto grid max-w-[1280px] items-start gap-[26px] md:grid-cols-2"
      >
        <div className={TARJETA}>
          <h2 className="font-titulo text-h2 font-fuerte text-texto-titulo">
            Datos del centro
          </h2>
          <dl className="space-y-4">
            {DATOS.map(([dt, dd]) => (
              <div key={dt}>
                <dt className="text-caption font-medio text-texto-secundario">
                  {dt}
                </dt>
                <dd className="text-h2">{dd}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className={claseBoton("suave")}
            >
              Escribir por WhatsApp
            </a>
            <a href={CORREO} className={claseBoton("borde")}>
              Enviar un correo
            </a>
          </div>
        </div>
        <div className={TARJETA}>
          <h2 className="font-titulo text-h2 font-fuerte text-texto-titulo">
            Cómo llegar
          </h2>
          <p className="text-texto-secundario">
            Entra por la portería principal de Unilasallista y sigue hacia la
            casa amarilla, junto al parqueadero.
          </p>
          <a
            href={MAPA}
            target="_blank"
            rel="noreferrer"
            className={claseBoton("suave")}
          >
            Abrir en el mapa
          </a>
          <p className="text-caption text-texto-secundario">
            El mapa señala el campus de Unilasallista.
          </p>
          <iframe
            src={MAPA_EMBEBIDO}
            title="Mapa del campus de Unilasallista en Caldas, Antioquia"
            loading="lazy"
            className="h-[300px] w-full rounded-m border border-borde-suave"
          />
          <a
            href={`${OSM}/copyright`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-caption text-texto-enlace underline"
          >
            © Colaboradores de OpenStreetMap
          </a>
        </div>
      </Seccion>

      <IlustracionSobrePie src={chateando} ancho={506} izquierda={397} />
    </>
  );
}
