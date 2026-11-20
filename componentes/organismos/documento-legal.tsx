import type { ReactNode } from "react";
import Link from "next/link";
import { claseBoton } from "../atomos/boton";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";

// Figma · /privacidad y /terminos: banda lavanda de introducción (336), índice blanco fijo de 264 a la
// izquierda y columna de lectura de 742. El índice enlaza a los <h2 id> del documento.
export function DocumentoLegal({
  titulo,
  bajada,
  indice,
  otro,
  children,
}: {
  titulo: string;
  bajada: string;
  indice: { id: string; titulo: string }[];
  otro: { href: string; texto: string };
  children: ReactNode;
}) {
  return (
    <>
      <div className="bg-morado-100 px-4 py-cabecera sm:px-borde">
        <EncabezadoSeccion
          nivel="h1"
          titulo={titulo}
          bajada={bajada}
          className="mx-auto max-w-[1030px]"
        />
      </div>
      <div className="mx-auto grid max-w-[1030px] gap-bloque px-4 py-bloque md:grid-cols-[264px_742px]">
        <nav
          aria-label="Índice"
          className="h-fit space-y-4 md:sticky md:top-[110px]"
        >
          <ol className="space-y-2 rounded-l bg-blanco p-5 text-p shadow-flotante">
            {indice.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-texto-enlace hover:underline"
                >
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
          <a
            href="#contenido-principal"
            className={claseBoton("borde", "w-full")}
          >
            Ir al inicio de la página
          </a>
        </nav>
        <article className="space-y-8 [&_h2[id]]:scroll-mt-[110px] [&_h2[id]]:font-titulo [&_h2[id]]:text-subtitulo [&_h2[id]]:font-fuerte [&_h2[id]]:text-texto-titulo">
          {children}
          <Link href={otro.href} className={claseBoton("borde")}>
            {otro.texto}
          </Link>
        </article>
      </div>
    </>
  );
}
