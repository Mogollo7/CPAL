import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

// Sin datos del paciente: se ven en el panel.
export type Datos = {
  citaId: string;
  codigo: string;
  servicio: string;
  inicio: Date;
  psicologo: string;
  venceEn: Date | null;
};

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Nueva solicitud de cita por revisar",
    parrafos: [
      `Hay una solicitud nueva: ${d.codigo}.`,
      `${d.servicio} · ${formatoFechaHora(d.inicio)} · con ${d.psicologo}`,
      ...(d.venceEn
        ? [`Responder antes de: ${formatoFechaHora(d.venceEn)}.`]
        : []),
    ],
    boton: { texto: "Revisar en el panel", ruta: RUTAS.panelCita(d.citaId) },
  });

export const ejemplo: Datos = {
  citaId: "ejemplo",
  codigo: "CAPL-7K3F",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  psicologo: "Laura Gómez",
  venceEn: new Date("2026-11-22T19:30:00Z"),
};
