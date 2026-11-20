import { beforeEach, describe, expect, it } from "vitest";
import { NOMBRES, esPlantilla, plantillas, renderizar } from "./indice";

// Los 14 identificadores de E06 y los 2 añadidos después. Otros módulos encolan con estos nombres exactos.
const E06 = [
  "solicitud-recibida",
  "nueva-solicitud",
  "cita-autorizada",
  "cita-no-autorizada",
  "cita-vencida",
  "cita-cancelada",
  "cita-cancelada-psicologo",
  "cita-nueva-psicologo",
  "recordatorio",
  "invitacion",
  "recuperar-clave",
  "inscripcion-evento",
  "codigo-ingreso",
  "aviso-ingreso",
  "aviso-acceso-emergencia",
  "cita-reasignada",
];

beforeEach(() => {
  process.env.URL_SITIO = "https://pruebas.ejemplo.test";
  process.env.CORREO_RESPUESTA = "citas@ejemplo.test";
});

describe("registro de plantillas (E06)", () => {
  it("tiene exactamente las plantillas de E06 más las añadidas", () => {
    expect([...NOMBRES].sort()).toEqual([...E06, "estado-servidor"].sort());
    expect(esPlantilla("recordatorio")).toBe(true);
    expect(esPlantilla("otra")).toBe(false);
  });

  it.each(E06)(
    "%s: HTML y texto con la línea de ayuda, sin datos sensibles",
    (n) => {
      const c = renderizar(
        n as never,
        plantillas[n as keyof typeof plantillas].ejemplo,
      );
      expect(c.asunto.length).toBeGreaterThan(5);
      expect(c.html).toContain("/ayuda-inmediata");
      expect(c.texto).toContain("Si necesitas ayuda ahora mismo");
      expect(
        c.html.match(/border-radius:9999px/g)?.length ?? 0,
      ).toBeLessThanOrEqual(1); // un solo botón
      expect(c.html + c.texto).not.toMatch(
        /documento de la persona|motivo de consulta|\bedad\b/i,
      );
    },
  );

  it("cita-autorizada adjunta el .ics y ofrece Google Calendar; recordatorio y vencida usan el tono de E06", () => {
    const a = renderizar(
      "cita-autorizada",
      plantillas["cita-autorizada"].ejemplo,
    );
    expect(a.adjuntos?.[0].nombre).toBe("cita.ics");
    expect(a.html).toContain("calendar.google.com");
    expect(a.texto).toContain(
      "Ver mi cita: https://pruebas.ejemplo.test/cita/",
    );
    expect(
      renderizar("cita-vencida", plantillas["cita-vencida"].ejemplo).texto,
    ).toContain("No alcanzamos a confirmar");
    expect(a.texto).not.toMatch(/rechazad/i);
  });

  it("el código de ingreso sale en grande y no lleva botón", () => {
    const c = renderizar("codigo-ingreso", {
      nombre: "Laura",
      codigo: "482915",
    });
    expect(c.html).toContain("482915");
    expect(c.html).not.toContain("border-radius:9999px");
  });

  it("un nombre con HTML llega como texto, no como código", () => {
    const c = renderizar("cita-vencida", {
      nombre: "<script>x</script>",
      inicio: new Date(),
    });
    expect(c.html).not.toContain("<script>");
  });
});
