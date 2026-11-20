import { beforeEach, describe, expect, it } from "vitest";
import { ejemplo, render } from "./estado-servidor";

beforeEach(() => {
  process.env.URL_SITIO = "https://pruebas.ejemplo.test";
  process.env.CORREO_RESPUESTA = "citas@ejemplo.test";
});

describe("correo estado-servidor", () => {
  it("muestra las cifras con formato colombiano y las imágenes del sitio", () => {
    const c = render(ejemplo);
    expect(c.asunto).toBe("Informe diario del servidor · CAPL");
    expect(c.html).toContain("99,72 %");
    expect(c.html).toContain("185 ms");
    expect(c.html).toContain(
      "https://pruebas.ejemplo.test/correos/gato-soporte.png",
    );
    expect(c.html).toContain("Interrupción resuelta");
    expect(c.html).toContain("/panel/admin/correos");
    expect(c.texto).toContain("248 enviados");
  });
  it("sin interrupciones ni datos no inventa nada", () => {
    const c = render({
      ...ejemplo,
      disponibilidad: null,
      latenciaP95Ms: null,
      ultimoSondeo: null,
      incidente: null,
    });
    expect(c.html).toContain("Sin datos todavía");
    expect(c.html).toContain("Sin interrupciones");
    expect(c.html).not.toContain("Interrupción resuelta");
  });
  it("sin respuesta reciente avisa que el servidor no responde", () => {
    const c = render({ ...ejemplo, ultimoSondeo: "2026-11-19T11:00:00.000Z" });
    expect(c.html).toContain("Servidor sin respuesta");
  });
});
