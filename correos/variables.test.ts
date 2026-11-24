import { beforeEach, describe, expect, it } from "vitest";
import { plantillas, renderizar, type NombrePlantilla } from "./indice";
import { aPlantilla, paraEnvio, sustituir } from "./plantilla-resend";
import { mapaVariables } from "./variables";

beforeEach(() => {
  process.env.URL_SITIO = "https://pruebas.ejemplo.test";
  process.env.CORREO_RESPUESTA = "citas@ejemplo.test";
});

type Cualquiera = {
  variables: (d: unknown) => Record<string, string> | null;
  otros: unknown;
};
const mapas = Object.entries(mapaVariables) as [NombrePlantilla, Cualquiera][];

describe("variables de las plantillas de Resend", () => {
  it("cubre todas las plantillas (las que no, deben justificarse aquí)", () => {
    const sin = (Object.keys(plantillas) as NombrePlantilla[]).filter(
      (n) => !(n in mapaVariables),
    );
    expect(sin).toEqual([]);
  });

  it.each(mapas)(
    "%s: la plantilla con otros datos reproduce el HTML de la app",
    (n, m) => {
      const ej = plantillas[n].ejemplo;
      const v1 = m.variables(ej);
      const v2 = m.variables(m.otros);
      expect(v1, "el ejemplo debe poder usar plantilla").not.toBeNull();
      expect(
        v2,
        "`otros` debe ser de la misma rama que el ejemplo",
      ).not.toBeNull();
      expect(Object.keys(v2!).sort()).toEqual(Object.keys(v1!).sort());

      const plantilla = aPlantilla(renderizar(n, ej).html, v1!);
      for (const k of Object.keys(v1!))
        expect(plantilla, `falta {{{${k}}}} en la plantilla`).toContain(
          `{{{${k}}}}`,
        );

      const reconstruido = sustituir(plantilla, v2!);
      expect(reconstruido).toBe(renderizar(n, m.otros).html);
      // lo que viaja a Resend: sin llaves sobrantes ni valores sin escapar
      expect(Object.values(paraEnvio(v2!)).join("")).not.toMatch(/[<>"]/);
    },
  );
});
