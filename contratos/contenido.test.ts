import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { emergenciasSchema } from "./emergencias";
import { serviciosSchema } from "./servicio-contenido";

const leer = (ruta: string) => JSON.parse(readFileSync(ruta, "utf8"));

describe("contenido/*.json", () => {
  it("emergencias.json cumple su esquema y trae los cuatro códigos", () => {
    const e = emergenciasSchema.parse(leer("contenido/emergencias.json"));
    expect(e.codigos.map((c) => c.id)).toEqual([
      "dorado",
      "fucsia",
      "blanco",
      "rosa",
    ]);
  });

  it("toda línea de emergencias existe en el directorio y el 123 va en todos los códigos", () => {
    const e = emergenciasSchema.parse(leer("contenido/emergencias.json"));
    const dir = new Set(e.directorio.map((l) => l.telefono));
    for (const c of e.codigos) {
      expect(c.lineas.map((l) => l.telefono)).toContain("123");
      for (const l of c.lineas) expect(dir.has(l.telefono)).toBe(true);
    }
  });

  it("nada sin verificar queda sin marcar: todo número lleva porConfirmar hasta que el CAPL lo apruebe", () => {
    const e = emergenciasSchema.parse(leer("contenido/emergencias.json"));
    if (e.porConfirmar)
      for (const l of [...e.directorio, ...e.codigos.flatMap((c) => c.lineas)])
        expect(l.porConfirmar).toBe(true);
  });

  it("servicios.json cumple su esquema", () => {
    const s = serviciosSchema.parse(leer("contenido/servicios.json"));
    expect(s.servicios).toHaveLength(6);
    expect(s.servicios.filter((x) => x.agendableEnLinea)).toHaveLength(3);
  });

  it("el esquema rechaza un código con menos de tres señales", () => {
    const e = leer("contenido/emergencias.json");
    e.codigos[0].senales = ["una"];
    expect(emergenciasSchema.safeParse(e).success).toBe(false);
  });
});
