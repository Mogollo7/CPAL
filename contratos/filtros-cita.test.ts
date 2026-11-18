import { describe, expect, it } from "vitest";
import { filtrosCitaSchema } from "./filtros-cita";

describe("filtros-cita", () => {
  it("pagina por defecto = 1; todo lo demás es opcional", () => {
    expect(filtrosCitaSchema.parse({})).toEqual({ pagina: 1 });
  });
  it("rechaza estado desconocido, página 0 y búsqueda larga", () => {
    expect(filtrosCitaSchema.safeParse({ estado: "XX" }).success).toBe(false);
    expect(filtrosCitaSchema.safeParse({ pagina: 0 }).success).toBe(false);
    expect(
      filtrosCitaSchema.safeParse({ busqueda: "a".repeat(81) }).success,
    ).toBe(false);
  });
});
