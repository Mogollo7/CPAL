import { beforeEach, describe, expect, it } from "vitest";
import {
  adjuntoIcs,
  enlaceGoogleCalendar,
  enlaceOutlookWeb,
  generarIcs,
  type EventoCalendario,
} from "./calendario";

const ev: EventoCalendario = {
  uid: "cita123",
  inicio: new Date("2026-11-24T19:30:00Z"), // 2:30 p. m. en Bogotá
  fin: new Date("2026-11-24T20:30:00Z"),
  titulo: "Cita en el CAPL",
  lugar: "Calle 1 #2-3, Medellín",
  descripcion: "Gestiona tu cita: https://capl.ejemplo.test/cita/x",
};

beforeEach(() => {
  process.env.URL_SITIO = "https://capl.ejemplo.test";
});

describe("archivo .ics y enlaces de calendario (T-324)", () => {
  it("campos de E06: UID@dominio, UTC, resumen sin servicio, lugar, enlace y alarma de 2 h", () => {
    const ics = generarIcs(ev, new Date("2026-11-20T00:00:00Z"));
    expect(ics).toContain("UID:cita123@capl.ejemplo.test");
    expect(ics).toContain("DTSTART:20261124T193000Z");
    expect(ics).toContain("DTEND:20261124T203000Z");
    expect(ics).toContain("SUMMARY:Cita en el CAPL");
    expect(ics).toContain("LOCATION:Calle 1 #2-3\\, Medellín"); // la coma se escapa
    expect(ics).toContain("TRIGGER:-PT2H");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("entrega un archivo .ics importable como adjunto independiente", () => {
    expect(adjuntoIcs(ev)).toMatchObject({
      nombre: "cita.ics",
      tipo: "application/octet-stream",
    });
    expect(adjuntoIcs(ev).contenido).toContain("METHOD:PUBLISH\r\n");
  });
  it("ninguna línea supera 75 octetos", () => {
    const ics = generarIcs({ ...ev, descripcion: "x".repeat(300) });
    for (const l of ics.split("\r\n"))
      expect(Buffer.byteLength(l)).toBeLessThanOrEqual(75);
  });
  it("enlaces de Google y Outlook con fecha y lugar", () => {
    const g = new URL(enlaceGoogleCalendar(ev));
    expect(g.searchParams.get("dates")).toBe(
      "20261124T193000Z/20261124T203000Z",
    );
    expect(g.searchParams.get("location")).toBe(ev.lugar);
    const o = new URL(enlaceOutlookWeb(ev));
    expect(o.hostname).toBe("outlook.office.com");
    expect(o.pathname).toBe("/calendar/deeplink/compose");
    expect(new URL(enlaceOutlookWeb(ev, "personal")).hostname).toBe(
      "outlook.live.com",
    );
    expect(o.searchParams.get("startdt")).toBe("2026-11-24T19:30:00.000Z");
  });
});
