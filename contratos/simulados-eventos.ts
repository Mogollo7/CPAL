// Datos simulados de la cartelera de eventos (E05): misma forma que `servidor/eventos/`.
import type { EventoDetalle } from "./evento";
import { fallo, ok, type Resultado } from "./resultado";

const eventos: EventoDetalle[] = [
  {
    id: "ev-1",
    slug: "taller-manejo-del-estres",
    titulo: "Taller de manejo del estrés",
    descripcion: "Técnicas breves para la semana de parciales.",
    inicio: "2026-11-26T14:00:00-05:00",
    fin: "2026-11-26T16:00:00-05:00",
    lugar: "Bloque 3, sala 204",
    enlace: null,
    imagenUrl: null,
    publicado: true,
  },
  {
    id: "ev-2",
    slug: "charla-sueno-saludable",
    titulo: "Charla: sueño saludable",
    descripcion: "Hábitos para dormir mejor.",
    inicio: "2026-12-02T10:00:00-05:00",
    fin: null,
    lugar: "Virtual",
    enlace: "https://meet.example.com/capl-sueno",
    imagenUrl: null,
    publicado: true,
  },
];

export async function listarEventosPublicos(): Promise<
  Resultado<EventoDetalle[]>
> {
  return ok(eventos);
}

export async function verEventoPublico(
  slug: string,
): Promise<Resultado<EventoDetalle>> {
  const e = eventos.find((x) => x.slug === slug);
  return e ? ok(e) : fallo("NO_ENCONTRADO", "No encontramos ese evento.");
}

export const listarEventos = listarEventosPublicos;
