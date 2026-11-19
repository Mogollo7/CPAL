import type { EventoDetalle } from "@/contratos/evento";
import { listarEventosAccion } from "@/servidor/acciones";
import { GestorEventos } from "@/componentes/panel/admin/gestor-eventos";

const EVENTOS_SIMULADOS: EventoDetalle[] = [
  {
    id: "ev-1",
    slug: "taller-manejo-del-estres",
    titulo: "Taller: Estrategias prácticas para el manejo del estrés académico",
    descripcion:
      "Espacio vivencial enfocado en técnicas de regulación emocional, respiración diafragmática y organización del tiempo para afrontar periodos de exámenes.",
    inicio: new Date(Date.now() + 86400000 * 4).toISOString(),
    fin: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
    lugar: "Bloque 3, auditorio 204",
    enlace: null,
    imagenUrl: null,
    publicado: true,
  },
  {
    id: "ev-2",
    slug: "charla-sueno-saludable",
    titulo: "Conferencia virtual: Higiene del sueño y bienestar cognitivo",
    descripcion:
      "Aprende sobre el impacto del descanso en la consolidación de la memoria y pautas conductuales para combatir el insomnio universitario.",
    inicio: new Date(Date.now() + 86400000 * 10).toISOString(),
    fin: new Date(Date.now() + 86400000 * 10 + 5400000).toISOString(),
    lugar: "Virtual",
    enlace: "https://teams.microsoft.com/capl-sueno-saludable",
    imagenUrl: null,
    publicado: true,
  },
];

export default async function PaginaAdminEventos() {
  let eventos: EventoDetalle[] = [];

  try {
    const res = await listarEventosAccion();
    if (res.ok) {
      eventos = res.datos;
    } else {
      throw new Error(res.mensaje);
    }
  } catch {
    eventos = EVENTOS_SIMULADOS;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Cartelera de Eventos y Talleres
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Publica conferencias, talleres grupales y actividades comunitarias
          visibles en el portal público.
        </p>
      </div>

      <GestorEventos eventosIniciales={eventos} />
    </div>
  );
}
