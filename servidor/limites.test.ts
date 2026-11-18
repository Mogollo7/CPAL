import { beforeEach, describe, expect, it } from "vitest";
import { _reiniciarLimites, limitar } from "./limites";

beforeEach(_reiniciarLimites);

describe("límites de intentos", () => {
  it("5 citas por hora por dirección; la 6.ª espera hasta que salga la primera", () => {
    for (let i = 0; i < 5; i++)
      expect(limitar("pedirCita", "1.1.1.1", i * 1000).permitido).toBe(true);
    const v = limitar("pedirCita", "1.1.1.1", 10_000);
    expect(v).toEqual({ permitido: false, esperaSeg: 3590 });
  });
  it("cada dirección y cada acción cuentan aparte", () => {
    for (let i = 0; i < 5; i++) limitar("pedirCita", "1.1.1.1", 0);
    expect(limitar("pedirCita", "2.2.2.2", 0).permitido).toBe(true);
    expect(limitar("inscribirseEvento", "1.1.1.1", 0).permitido).toBe(true);
  });
  it("pasada la ventana vuelve a permitir", () => {
    for (let i = 0; i < 3; i++) limitar("solicitarEnlace", "a@b.co", 0);
    expect(limitar("solicitarEnlace", "a@b.co", 1000).permitido).toBe(false);
    expect(limitar("solicitarEnlace", "a@b.co", 3_600_001).permitido).toBe(
      true,
    );
  });
  it("un intento rechazado no extiende el castigo", () => {
    for (let i = 0; i < 60; i++) limitar("consultarCupos", "x", 0);
    for (let i = 0; i < 30; i++) limitar("consultarCupos", "x", 30_000); // rechazados
    expect(limitar("consultarCupos", "x", 60_001).permitido).toBe(true);
  });
});
