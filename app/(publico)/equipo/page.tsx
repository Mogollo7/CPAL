import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { FondoGrano } from "@/componentes/atomos/fondo-grano";
import { IlustracionSobrePie } from "@/componentes/atomos/ilustracion-sobre-pie";
import { Seccion } from "@/componentes/atomos/seccion";
import { Titulo } from "@/componentes/atomos/titulo";
import { EncabezadoSeccion } from "@/componentes/moleculas/encabezado-seccion";
import { TarjetaPerfil } from "@/componentes/moleculas/tarjeta-perfil";
import { listarEquipoPublicoAccion } from "@/servidor/acciones";
import rostro from "@/contenido/ilustraciones/equipo-rostro.webp";
import equipoDiverso from "@/contenido/ilustraciones/equipo-diverso.webp";
import librosBirrete from "@/contenido/ilustraciones/cierre-libros-birrete.webp";

export const metadata: Metadata = {
  title: "Equipo · CAPL",
  description:
    "Psicólogas y psicólogos en formación de Unilasallista, acompañados por docentes supervisores.",
};

export const instant = false;

async function Perfiles() {
  await connection();
  const r = await listarEquipoPublicoAccion().catch(() => null);
  const equipo = r?.ok ? r.datos : [];
  if (equipo.length === 0)
    return (
      <p className="text-h2 text-texto-secundario">
        Pronto presentaremos aquí al equipo.
      </p>
    );
  return (
    <>
      {/* Carrusel nativo: desplazamiento horizontal con imán (scroll-snap), teclado y lector sin JavaScript. */}
      <ul
        aria-label="Equipo en formación"
        tabIndex={0}
        className="-mx-4 flex snap-x gap-[32px] overflow-x-auto px-4 pb-5 sm:-mx-borde sm:px-borde md:mx-0 md:px-0"
      >
        {equipo.map((p, i) => (
          <li key={p.id}>
            <TarjetaPerfil nombre={p.nombre} fotoUrl={p.fotoUrl} tono={i} />
          </li>
        ))}
      </ul>
      <p className="font-medio text-destacado text-accion-fondo">
        Desliza para conocer al equipo →
      </p>
    </>
  );
}

export default function EquipoPage() {
  return (
    <>
      {/* Equipo · hero: retrato que se funde hacia abajo sobre lavanda con grano */}
      <section
        aria-labelledby="titulo-pagina"
        className="relative isolate h-[560px] overflow-hidden md:h-[980px]"
      >
        <FondoGrano tono="lavanda" fundido="abajo" />
        <Image
          src={rostro}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-top-[150px]! object-cover [mask-image:linear-gradient(#000_86%,#000000f0_90%,#000000a6_94%,#0000002b_98%,#0000)]"
        />
        <Titulo
          nivel="h1"
          tamano="pagina"
          id="titulo-pagina"
          className="relative mx-auto max-w-[880px] px-4 pt-[65px] text-center"
        >
          Personas que están aquí para escucharte
        </Titulo>
      </section>

      {/* Equipo · presentación */}
      <Seccion
        aria-labelledby="titulo-presentacion"
        className="mx-auto grid max-w-[1180px] items-center gap-bloque md:grid-cols-[490px_550px] md:justify-between"
      >
        <div className="space-y-5">
          <Titulo id="titulo-presentacion">
            Conoce a quienes te acompañan
          </Titulo>
          <p className="text-h2 leading-titulo text-texto-secundario">
            Nuestros psicólogos y psicólogas en formación te escuchan y
            acompañan con respeto. Su trabajo cuenta con la orientación de
            docentes supervisores.
          </p>
        </div>
        <Image
          src={equipoDiverso}
          alt=""
          sizes="550px"
          className="mx-auto w-full max-w-[550px]"
        />
      </Seccion>

      {/* Equipo · psicólogos en formación */}
      <Seccion
        ritmo="entrada"
        aria-labelledby="titulo-equipo"
        className="space-y-bloque md:px-[100px]"
      >
        <FondoGrano tono="lavanda-claro" fundido="ambos" />
        <EncabezadoSeccion
          id="titulo-equipo"
          titulo="Psicólogas y psicólogos en formación"
          bajada="Conoce a las personas que hacen parte del CAPL."
        />
        <Suspense fallback={<div className="h-[570px]" />}>
          <Perfiles />
        </Suspense>
      </Seccion>

      <IlustracionSobrePie src={librosBirrete} ancho={220} izquierda={6} />
    </>
  );
}
