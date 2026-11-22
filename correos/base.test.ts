import { beforeEach, describe, expect, it } from "vitest";
import { esc, plantillaBase } from "./base";

beforeEach(() => {
  process.env.URL_SITIO = "https://pruebas.ejemplo.test/";
  process.env.CORREO_RESPUESTA = "citas@ejemplo.test";
});

describe("plantilla base de correo (E06)", () => {
  const hacer = () =>
    plantillaBase({
      asunto: "Recibimos tu solicitud de cita",
      parrafos: [
        "Hola, Ana. Tu solicitud está en proceso.",
        "Código: CAPL-7K3F",
      ],
      boton: { texto: "Ver mi solicitud", ruta: "/cita/abc" },
    });

  it("tiene HTML y texto plano, con un solo botón", () => {
    const p = hacer();
    expect(p.html).toContain("Recibimos tu solicitud de cita");
    expect(p.html.match(/border-radius:9999px/g)).toHaveLength(1); // un único botón (píldora)
    expect(p.texto).toContain(
      "Ver mi solicitud: https://pruebas.ejemplo.test/cita/abc",
    );
  });
  it("todos los enlaces salen de URL_SITIO (sin doble barra) y el pie lleva la línea de ayuda", () => {
    const p = hacer();
    expect(p.html).toContain('href="https://pruebas.ejemplo.test/cita/abc"');
    expect(p.html).toContain(
      'href="https://pruebas.ejemplo.test/ayuda-inmediata"',
    );
    expect(p.texto).toContain(
      "Si necesitas ayuda ahora mismo: https://pruebas.ejemplo.test/ayuda-inmediata",
    );
    expect(p.texto).toContain("citas@ejemplo.test");
  });
  it("sin botón no aparece ninguno (p. ej. el código de ingreso)", () => {
    const q = plantillaBase({ asunto: "Tu código", parrafos: ["123456"] });
    expect(q.html).not.toContain("border-radius:9999px");
  });
  it("usa la URL absoluta de la ilustración", () => {
    const correo = plantillaBase({
      asunto: "Hola",
      parrafos: [],
      ilustracion: "gato-saludo",
    });
    expect(correo.html).toContain(
      'src="https://pruebas.ejemplo.test/correos/gato-saludo.png"',
    );
  });
  it("escapa HTML: un nombre malicioso llega como texto, no como código", () => {
    const sucio = plantillaBase({
      asunto: "x",
      parrafos: ['<script>alert(1)</script> "><img src=x onerror=1>'],
      boton: { texto: "<b>", ruta: '/"onmouseover="x' },
    });
    expect(sucio.html).not.toContain("<script>");
    expect(sucio.html).not.toContain("<img src=x");
    expect(sucio.html).not.toContain('"onmouseover="x'); // no rompe el atributo href
    expect(esc(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&#39;");
  });
});
