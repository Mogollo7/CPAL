import { plantillaBase } from "./base";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = {
  nombre: string;
  servicio: string;
  inicio: Date;
  psicologo: string;
  codigo: string;
  plazoHoras: number;
  rutaGestion: string; // /cita/{id}.{firma}
  reprogramada?: boolean;
};

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Recibimos tu solicitud de cita",
    parrafos: [
      d.reprogramada
        ? `Hola, ${d.nombre}. Recibimos el cambio de horario de tu cita y está en proceso de autorización.`
        : `Hola, ${d.nombre}. Recibimos tu solicitud de cita y está en proceso de autorización.`,
      `${d.servicio} · ${formatoFechaHora(d.inicio)} · con ${d.psicologo}`,
      `Te escribiremos a este correo en máximo ${d.plazoHoras} horas para confirmarla. Código de tu solicitud: ${d.codigo}.`,
      "Si cambian tus planes, puedes cancelar o cambiar el horario desde el botón.",
    ],
    boton: { texto: "Ver mi solicitud", ruta: d.rutaGestion },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  psicologo: "Laura Gómez",
  codigo: "CAPL-7K3F",
  plazoHoras: 48,
  rutaGestion: "/cita/ejemplo.firma",
};
