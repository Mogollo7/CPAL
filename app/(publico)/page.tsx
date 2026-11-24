import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { HeroCarrusel } from "@/componentes/organismos/hero-carrusel";
import { PasosCita } from "@/componentes/organismos/pasos-cita";
import { ProximosEventos } from "@/componentes/organismos/proximos-eventos";
import { PreguntasFrecuentes } from "@/componentes/organismos/preguntas-frecuentes";
import { CierrePedirCita } from "@/componentes/organismos/cierre-pedir-cita";
import { listarEventosPublicosAccion } from "@/servidor/acciones";
import fondo1 from "@/contenido/ilustraciones/hero-fondo-1.webp";
import fondo2 from "@/contenido/ilustraciones/hero-fondo-2.webp";
import fondo3 from "@/contenido/ilustraciones/hero-fondo-3.webp";
import mujerTablet from "@/contenido/ilustraciones/cierre-mujer-tablet.webp";

export const metadata: Metadata = {
  title: "CAPL · Centro de Atención Psicológica Lasallista",
  description:
    "Atención psicológica y neuropsicológica sin costo en la casa amarilla de Unilasallista, en Caldas (Antioquia).",
};

const DIAPOSITIVAS = [
  {
    titulo: "Respira",
    bajada: "Aquí te escuchamos con calma y sin costo, en la casa amarilla.",
    accion: { texto: "Pedir mi cita", href: "/pedir-cita" },
    fondo: fondo1,
  },
  {
    titulo: "Tu cita",
    bajada: "La pides en línea y te la confirmamos en máximo 48 horas.",
    accion: { texto: "Ver cómo funciona", href: "/como-funciona" },
    fondo: fondo2,
  },
  {
    titulo: "En grupo",
    bajada: "Talleres y charlas abiertas para la comunidad lasallista.",
    accion: { texto: "Ver eventos", href: "/eventos" },
    fondo: fondo3,
  },
];

const PREGUNTAS_INICIO = [
  "faq-gratuidad",
  "faq-como-pedir-cita",
  "faq-quienes-atienden",
  "faq-horarios-centro",
  "faq-cancelar-reprogramar",
  "faq-urgencias",
];

// Si la agenda no responde, el inicio sigue en pie: la sección de eventos simplemente no aparece.
async function Eventos() {
  await connection();
  const r = await listarEventosPublicosAccion().catch(() => null);
  return <ProximosEventos eventos={r?.ok ? r.datos : []} />;
}

export default function Inicio() {
  return (
    <>
      <HeroCarrusel diapositivas={DIAPOSITIVAS} />
      <PasosCita />
      <Suspense>
        <Eventos />
      </Suspense>
      <PreguntasFrecuentes ids={PREGUNTAS_INICIO} />
      <CierrePedirCita ilustracion={mujerTablet} />
    </>
  );
}
