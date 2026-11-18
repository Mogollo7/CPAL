import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = {
  nombre: string;
  inicio: Date;
  canceladaPor: "persona" | "capl";
  motivo?: string | null; // solo si canceló el CAPL
};

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Tu cita fue cancelada",
    parrafos: [
      d.canceladaPor === "persona"
        ? `Hola, ${d.nombre}. Cancelaste tu cita del ${formatoFechaHora(d.inicio)}.`
        : `Hola, ${d.nombre}. El CAPL canceló tu cita del ${formatoFechaHora(d.inicio)} y lo sentimos.`,
      ...(d.canceladaPor === "capl" && d.motivo
        ? [`Mensaje del equipo: ${d.motivo}`]
        : []),
      "Cuando quieras, puedes pedir otra cita.",
    ],
    boton: { texto: "Pedir otra cita", ruta: RUTAS.pedirCita },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  canceladaPor: "capl",
  motivo: "La psicóloga tuvo un imprevisto.",
};
