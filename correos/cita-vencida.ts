import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = { nombre: string; inicio: Date };

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-recordatorio",
    tono: "#fdf3dc",
    disposicion: "centrada",
    asunto: "No alcanzamos a confirmar tu cita",
    titulo: "Tu solicitud venció",
    parrafos: [
      `Hola, ${d.nombre}. No alcanzamos a confirmar el horario del ${formatoFechaHora(d.inicio)} a tiempo. Puedes elegir otro horario cuando quieras.`,
    ],
    boton: { texto: "Elegir otro horario", ruta: RUTAS.pedirCita },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
};
