import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-[600px] rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-10 space-y-4 text-center">
      <h1 className="text-h1 font-fuerte text-texto-titulo">
        No pudimos abrir tu cita
      </h1>
      <p className="text-p text-texto-secundario">{r.mensaje}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href="/contacto"
          className="min-h-[48px] px-6 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center"
        >
          Escribirnos
        </Link>
        <Link
          href="/pedir-cita"
          className="min-h-[48px] px-6 py-3 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 font-medio text-p inline-flex items-center"
        >
          Pedir una cita
        </Link>
      </div>
    </div>
  );
}

export default function PaginaMiCita(props: Props) {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
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
