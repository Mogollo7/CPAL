import faqData from "@/contenido/faq.json";
import type { Faq } from "@/contratos/faq";
import { Seccion } from "../atomos/seccion";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";
import { PreguntaFrecuente } from "../moleculas/pregunta-frecuente";

const { preguntas } = faqData as Faq;

// Figma · Preguntas frecuentes · desplegables: ancho de lectura 920, 90 arriba / 110 abajo, 32 entre bloques.
export function PreguntasFrecuentes({
  ids,
  bajada = "Lo que necesitas saber antes de pedir tu cita.",
}: {
  ids?: string[];
  bajada?: string;
}) {
  const lista = ids
    ? ids.flatMap((id) => preguntas.filter((p) => p.id === id))
    : preguntas;
  return (
    <Seccion aria-labelledby="titulo-faq">
      <div className="mx-auto max-w-lectura space-y-[32px]">
        <EncabezadoSeccion
          id="titulo-faq"
          titulo="preguntas frecuentes"
          bajada={bajada}
          centrado
        />
        <div>
          {lista.map((p) => (
            <PreguntaFrecuente key={p.id} pregunta={p.pregunta}>
              {p.respuesta}
            </PreguntaFrecuente>
          ))}
        </div>
      </div>
    </Seccion>
  );
}
