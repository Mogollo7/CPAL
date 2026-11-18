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
    asunto: "Se canceló una cita de tu agenda",
    parrafos: [
      `Hola, ${d.nombrePsicologo}. Se canceló una cita que estaba en tu agenda.`,
      `${d.servicio} · ${formatoFechaHora(d.inicio)} · código ${d.codigo}`,
      "El horario quedó libre.",
    ],
    boton: { texto: "Ver mi agenda", ruta: RUTAS.agenda },
  });

export const ejemplo: Datos = {
  nombrePsicologo: "Laura",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  codigo: "CAPL-7K3F",
};
