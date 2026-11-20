import { Suspense } from "react";
import type { Metadata } from "next";
import { BotonEnlace } from "@/componentes/atomos/boton";
import Image from "next/image";
import { Titulo } from "@/componentes/atomos/titulo";
import enlaceInvalido from "@/contenido/ilustraciones/cita-enlace-invalido.webp";
import { connection } from "next/server";
import { MiCita } from "@/componentes/publico/mi-cita";
import { EsqueletoCalmo } from "@/componentes/atomos/esqueleto-calmo";
import { verCitaAccion } from "@/servidor/acciones";

// El enlace es personal: nunca se indexa (robots.ts también excluye /cita/).
export const metadata: Metadata = {
  title: "Mi cita · CAPL",
  robots: { index: false, follow: false },
};

export const instant = false;

type Props = { params: Promise<{ token: string }> };

async function Contenido({ params }: Props) {
  await connection();
  const token = decodeURIComponent((await params).token);
  const r = await verCitaAccion(token);
  if (r.ok) return <MiCita token={token} cita={r.datos} />;

  // ENLACE_INVALIDO (firma alterada o cita inexistente): misma respuesta, con salida a contacto (E09 §2).
  return (
    <section className="mx-auto flex max-w-lectura flex-col items-center gap-5 text-center">
      <Image
        src={enlaceInvalido}
        alt=""
        priority
        sizes="(max-width: 507px) calc(100vw - 32px), 475px"
        className="w-full max-w-[475px]"
      />
      <Titulo nivel="h1" tamano="pagina">
        No pudimos abrir tu cita
      </Titulo>
      <p className="text-h2 text-texto-secundario">{r.mensaje}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <BotonEnlace href="/contacto">Escribirnos</BotonEnlace>
        <BotonEnlace href="/pedir-cita" tipo="borde">
          Pedir una cita
        </BotonEnlace>
      </div>
    </section>
  );
}

export default function PaginaMiCita(props: Props) {
  return (
    <div className="px-4 py-cabecera sm:px-borde">
      <Suspense
        fallback={
          <EsqueletoCalmo className="mx-auto h-[420px] max-w-[720px] w-full rounded-l" />
        }
      >
        <Contenido {...props} />
      </Suspense>
    </div>
  );
}
