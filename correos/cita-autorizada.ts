import { plantillaBase } from "./base";
import {
  adjuntoIcs,
  enlaceGoogleCalendar,
  enlaceOutlookWeb,
  type EventoCalendario,
} from "./calendario";
import { centro, enlaceAbsoluto } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = {
  citaId: string;
  nombre: string;
  inicio: Date;
  fin: Date;
  psicologo: string;
  rutaGestion: string;
  cancelacionMinHoras: number;
};

/** Evento de calendario de la cita. SUMMARY sin el servicio (privacidad en calendarios compartidos). */
export const eventoDeCita = (d: Datos): EventoCalendario => ({
  uid: d.citaId,
  inicio: d.inicio,
  fin: d.fin,
  titulo: "Cita en el CAPL",
  lugar: centro().direccion,
  descripcion: `Gestiona tu cita: ${enlaceAbsoluto(d.rutaGestion)}`,
});

export function render(d: Datos) {
  const ev = eventoDeCita(d);
  const minutos = Math.round((d.fin.getTime() - d.inicio.getTime()) / 60_000);
  return {
    ...plantillaBase({
      asunto: "Tu cita ha sido autorizada",
      parrafos: [
        `Hola, ${d.nombre}. Tu cita ha sido autorizada.`,
        `${formatoFechaHora(d.inicio)} · ${minutos} minutos · con ${d.psicologo}`,
        `Dónde: casa amarilla del CAPL, ${centro().direccion}.`,
        "Qué llevar: tu documento de identidad. Llega unos minutos antes.",
        `Si no puedes asistir, cancela o cambia el horario desde el botón, hasta ${d.cancelacionMinHoras} horas antes de la cita.`,
      ],
      enlaces: [
        { texto: "Añadir a Google Calendar", url: enlaceGoogleCalendar(ev) },
        { texto: "Añadir a Outlook", url: enlaceOutlookWeb(ev) },
      ],
      boton: { texto: "Ver mi cita", ruta: d.rutaGestion },
    }),
    adjuntos: [adjuntoIcs(ev)],
  };
}

export const ejemplo: Datos = {
  citaId: "ejemplo",
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  fin: new Date("2026-11-24T20:30:00Z"),
  psicologo: "Laura Gómez",
  rutaGestion: "/cita/ejemplo.firma",
  cancelacionMinHoras: 12,
};
