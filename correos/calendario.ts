// Archivo .ics y enlaces a Google Calendar / Outlook web (E06, T-324). Sin librerías: el .ics es texto plano.
import { dominio } from "./centro";

export type EventoCalendario = {
  uid: string; // id de la cita o evento; el .ics añade @dominio
  inicio: Date;
  fin: Date;
  titulo: string; // para citas: "Cita en el CAPL" (sin el servicio, por privacidad en calendarios compartidos)
  lugar: string;
  descripcion: string;
};

const utc = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, ""); // 20261124T193000Z
const escIcs = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** RFC 5545: líneas de máximo 75 octetos; la continuación empieza con un espacio. */
function plegar(linea: string): string {
  const partes: string[] = [];
  let resto = linea;
  while (Buffer.byteLength(resto) > 75) {
    let n = 75;
    while (Buffer.byteLength(resto.slice(0, n)) > 75) n--;
    partes.push(resto.slice(0, n));
    resto = " " + resto.slice(n);
  }
  partes.push(resto);
  return partes.join("\r\n");
}

export function generarIcs(e: EventoCalendario, ahora = new Date()): string {
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CAPL//Citas//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${e.uid}@${dominio()}`,
      `DTSTAMP:${utc(ahora)}`,
      `DTSTART:${utc(e.inicio)}`,
      `DTEND:${utc(e.fin)}`,
      `SUMMARY:${escIcs(e.titulo)}`,
      `LOCATION:${escIcs(e.lugar)}`,
      `DESCRIPTION:${escIcs(e.descripcion)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escIcs(e.titulo)}`,
      "TRIGGER:-PT2H",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(plegar)
      .join("\r\n") + "\r\n"
  );
}

export const enlaceGoogleCalendar = (e: EventoCalendario) =>
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: e.titulo,
    dates: `${utc(e.inicio)}/${utc(e.fin)}`,
    details: e.descripcion,
    location: e.lugar,
  });

export const enlaceOutlookWeb = (e: EventoCalendario) =>
  "https://outlook.live.com/calendar/0/deeplink/compose?" +
  new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.titulo,
    startdt: e.inicio.toISOString(),
    enddt: e.fin.toISOString(),
    location: e.lugar,
    body: e.descripcion,
  });

/** Adjunto listo para `Correo.adjuntos`. */
export const adjuntoIcs = (e: EventoCalendario) => ({
  nombre: "cita.ics",
  contenido: generarIcs(e),
  tipo: "text/calendar; charset=utf-8; method=PUBLISH",
});
