import { plantillaBase } from "./base";
import { centro } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = {
  nombre: string;
  inicio: Date;
  psicologo: string;
  rutaGestion: string;
};

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Recordatorio: tu cita es mañana",
    parrafos: [
      `Hola, ${d.nombre}. Te recordamos tu cita de mañana, ${formatoFechaHora(d.inicio)}, con ${d.psicologo}.`,
      `Dónde: casa amarilla del CAPL, ${centro().direccion}.`,
      "Si no puedes asistir, cancela o cambia el horario desde el botón para que otra persona pueda usar ese espacio.",
    ],
    boton: { texto: "Ver mi cita", ruta: d.rutaGestion },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  psicologo: "Laura Gómez",
  rutaGestion: "/cita/ejemplo.firma",
};
