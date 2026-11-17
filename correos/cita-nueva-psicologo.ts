import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

// Sin datos del paciente: se consultan en el panel.
export type Datos = {
  nombrePsicologo: string;
  servicio: string;
  inicio: Date;
  codigo: string;
};

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Tienes una nueva cita",
    parrafos: [
      `Hola, ${d.nombrePsicologo}. Se autorizó una nueva cita en tu agenda.`,
      `${d.servicio} · ${formatoFechaHora(d.inicio)} · código ${d.codigo}`,
      "Los datos de la persona están en el panel.",
    ],
    boton: { texto: "Ver mi agenda", ruta: RUTAS.agenda },
  });

export const ejemplo: Datos = {
  nombrePsicologo: "Laura",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  codigo: "CAPL-7K3F",
};
