import { plantillaBase } from "./base";
import { centro } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

// No está en E06: se añadió para que administración no mueva una cita sin que la persona se entere (RF-ADM-05).
export type Datos = {
  nombre: string;
  inicio: Date;
  fin: Date;
  psicologo: string;
  rutaGestion: string;
  autorizada: boolean;
};

export function render(d: Datos) {
  const minutos = Math.round((d.fin.getTime() - d.inicio.getTime()) / 60_000);
  return plantillaBase({
    asunto: "Cambiamos el horario de tu cita",
    parrafos: [
      `Hola, ${d.nombre}. El CAPL cambió tu cita. Estos son los datos nuevos:`,
      `${formatoFechaHora(d.inicio)} · ${minutos} minutos · con ${d.psicologo}`,
      `Dónde: casa amarilla del CAPL, ${centro().direccion}.`,
      d.autorizada
        ? "Tu cita sigue autorizada. Si ese horario no te sirve, puedes cambiarlo o cancelar desde el botón."
        : "Tu solicitud sigue en revisión; te escribiremos cuando esté autorizada. Si ese horario no te sirve, puedes cambiarlo o cancelar desde el botón.",
    ],
    boton: { texto: "Ver mi cita", ruta: d.rutaGestion },
  });
}

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-25T15:00:00Z"),
  fin: new Date("2026-11-25T16:00:00Z"),
  psicologo: "Laura Gómez",
  rutaGestion: "/cita/ejemplo.firma",
  autorizada: true,
};
