import { describe, expect, it } from "vitest";
import {
  desdeBogota,
  diaSemana,
  fechaBogota,
  formatoFechaHora,
  inicioDelDia,
  minutosDelDia,
} from "./fechas";

// 2026-11-24 es martes. 2:30 p. m. en Bogotá = 19:30 UTC.
const martes = new Date("2026-11-24T19:30:00Z");

describe("fechas (America/Bogota)", () => {
  it("día de la semana y minutos del día en hora de Bogotá", () => {
    expect(diaSemana(martes)).toBe(2);
    expect(minutosDelDia(martes)).toBe(14 * 60 + 30);
    expect(diaSemana(new Date("2026-11-22T12:00:00Z"))).toBe(7); // domingo
  });
  it("cerca de medianoche UTC sigue siendo el día anterior en Bogotá", () => {
    const d = new Date("2026-11-25T03:00:00Z"); // 10 p. m. del martes en Bogotá
    expect(fechaBogota(d)).toBe("2026-11-24");
    expect(diaSemana(d)).toBe(2);
  });
  it("desdeBogota es la inversa de minutosDelDia", () => {
    expect(desdeBogota("2026-11-24", 870).toISOString()).toBe(
      martes.toISOString(),
    );
    expect(inicioDelDia(martes).toISOString()).toBe("2026-11-24T05:00:00.000Z");
  });
  it("formato de N08", () => {
    expect(formatoFechaHora(martes)).toBe("martes 24 de noviembre, 2:30 p. m.");
  });
});
