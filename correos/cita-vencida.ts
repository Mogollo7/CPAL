import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = { nombre: string; inicio: Date };

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "No alcanzamos a confirmar tu cita",
    parrafos: [
      `Hola, ${d.nombre}. No alcanzamos a confirmar el horario del ${formatoFechaHora(d.inicio)} a tiempo y lo sentimos.`,
      "Puedes elegir otro horario cuando quieras.",
    ],
    boton: { texto: "Elegir otro horario", ruta: RUTAS.pedirCita },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
};
