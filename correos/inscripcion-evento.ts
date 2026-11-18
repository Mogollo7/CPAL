import { plantillaBase } from "./base";
import { adjuntoIcs, type EventoCalendario } from "./calendario";
import { RUTAS, enlaceAbsoluto } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = {
  nombre: string;
  eventoId: string;
  slug: string;
  evento: string;
  inicio: Date;
  fin?: Date | null;
  lugar: string;
  enlace?: string | null;
  descripcion: string;
};

export function render(d: Datos) {
  const ev: EventoCalendario = {
    uid: `evento-${d.eventoId}`,
    inicio: d.inicio,
    fin: d.fin ?? new Date(d.inicio.getTime() + 3_600_000),
    titulo: d.evento,
    lugar: d.lugar,
    descripcion: enlaceAbsoluto(RUTAS.evento(d.slug)),
  };
  return {
    ...plantillaBase({
      asunto: `Tu inscripción a ${d.evento}`,
      parrafos: [
        `Hola, ${d.nombre}. Quedaste inscrito/a en ${d.evento}.`,
        `${formatoFechaHora(d.inicio)} · ${d.lugar}`,
        ...(d.enlace ? [`Enlace: ${d.enlace}`] : []),
        d.descripcion,
      ],
      boton: { texto: "Ver el evento", ruta: RUTAS.evento(d.slug) },
    }),
    adjuntos: [{ ...adjuntoIcs(ev), nombre: "evento.ics" }],
  };
}

export const ejemplo: Datos = {
  nombre: "Ana",
  eventoId: "ejemplo",
  slug: "taller-de-descanso",
  evento: "Taller de descanso",
  inicio: new Date("2026-12-02T19:00:00Z"),
  fin: new Date("2026-12-02T20:30:00Z"),
  lugar: "Casa amarilla del CAPL",
  descripcion: "Un espacio para aprender a descansar mejor.",
};
