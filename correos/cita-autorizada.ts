import { plantillaBase, fechaCorreo } from "./base";
import {
  adjuntoIcs,
  enlaceGoogleCalendar,
  enlaceOutlookWeb,
  type EventoCalendario,
} from "./calendario";
import { centro, enlaceAbsoluto } from "./centro";

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
      ilustracion: "gato-aprobacion",
      tono: "#e6f4ee",
      disposicion: "fila",
      asunto: "Tu cita ha sido autorizada",
      titulo: "Tu cita está confirmada",
      fecha: fechaCorreo(d.inicio, "Horario confirmado", minutos),
      datos: [
        { rotulo: "Lugar", valor: centro().direccion },
        { rotulo: "Profesional", valor: d.psicologo },
      ],
      parrafos: [
        `Hola, ${d.nombre}. Te esperamos en la casa amarilla del CAPL.`,
      ],
      nota: {
        titulo: "Antes de venir",
        texto: `Llega unos minutos antes. Puedes cancelar o cambiar el horario desde el botón hasta ${d.cancelacionMinHoras} horas antes de la cita.`,
      },
      archivoCalendario: true,
      enlaces: [
        { texto: "Google Calendar", url: enlaceGoogleCalendar(ev) },
        { texto: "Outlook", url: enlaceOutlookWeb(ev) },
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
