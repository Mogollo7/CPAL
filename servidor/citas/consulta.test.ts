import { describe, expect, it } from "vitest";
import { consultarCitaPorCodigo, MENSAJE_CONSULTA } from "./consulta";

// Sin BD: solo la parte que no la toca (formato del código y límite por red).
describe("consultarCitaPorCodigo", () => {
  it("un código con formato malo se rechaza sin tocar la BD", async () => {
    for (const malo of ["", "CAPL-12", "hola", "CAPL-12345", 42])
      expect(
        await consultarCitaPorCodigo(malo, { ip: "t-formato" }),
      ).toMatchObject({
        ok: false,
        codigo: "VALIDACION",
      });
  });

  it("limita los intentos por dirección de red", async () => {
    const ip = "t-limite";
    const r = [];
    for (let i = 0; i < 6; i++)
      r.push(await consultarCitaPorCodigo("x", { ip, ahora: new Date(1e12) }));
    expect(r[5]).toMatchObject({ ok: false, codigo: "DEMASIADOS_INTENTOS" });
  });

  it("el mensaje no revela si la cita existe", () => {
    expect(MENSAJE_CONSULTA).toMatch(/^Si el código/);
  });
});
