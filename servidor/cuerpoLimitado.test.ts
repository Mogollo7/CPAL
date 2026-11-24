import { describe, expect, it } from "vitest";
import { textoLimitado } from "./cuerpoLimitado";

describe("lectura acotada de peticiones", () => {
  const peticion = () =>
    new Request("http://localhost", { method: "POST", body: "café" });
  it("acepta el tamaño exacto en bytes", async () => {
    expect(await textoLimitado(peticion(), 5)).toBe("café");
  });
  it("aplica el límite aunque no se declare la longitud", async () => {
    expect(await textoLimitado(peticion(), 4)).toBeNull();
  });
});
