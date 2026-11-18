import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

// Tono: nunca "rechazada". El motivo lo escribe administración.
export type Datos = { nombre: string; inicio: Date; motivo?: string | null };

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "No pudimos confirmar tu cita",
    parrafos: [
      `Hola, ${d.nombre}. No pudimos confirmar tu cita del ${formatoFechaHora(d.inicio)} y lo sentimos.`,
      ...(d.motivo ? [`Mensaje del equipo: ${d.motivo}`] : []),
      "Puedes elegir otro horario cuando quieras.",
    ],
    boton: { texto: "Elegir otro horario", ruta: RUTAS.pedirCita },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  motivo: "Ese día la psicóloga no podrá atender.",
};
