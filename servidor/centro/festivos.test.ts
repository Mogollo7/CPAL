import { describe, expect, it } from "vitest";
import { esFestivo, festivosColombia } from "./festivos";

const fechas = (a: number) => festivosColombia(a).map((f) => f.fecha);

describe("festivos de Colombia (RF-ADM-13)", () => {
  it("2026: coincide con el calendario oficial", () => {
    expect(fechas(2026)).toEqual([
      "2026-01-01",
      "2026-01-12",
      "2026-03-23",
      "2026-04-02",
      "2026-04-03",
      "2026-05-01",
      "2026-05-18",
      "2026-06-08",
      "2026-06-15",
      "2026-06-29",
      "2026-07-20",
      "2026-08-07",
      "2026-08-17",
      "2026-10-12",
      "2026-11-02",
      "2026-11-16",
      "2026-12-08",
      "2026-12-25",
    ]);
  });
  it("2027: Semana Santa y festivos movidos al lunes", () => {
    const f = fechas(2027);
    expect(f).toContain("2027-03-25"); // Jueves Santo (Pascua 28-mar)
    expect(f).toContain("2027-03-26"); // Viernes Santo
    expect(f).toContain("2027-05-10"); // Ascensión
    expect(f).toContain("2027-03-22"); // San José (19-mar es viernes → lunes 22)
    expect(f).toHaveLength(18);
  });
  it("esFestivo distingue días", () => {
    expect(esFestivo("2026-12-25")).toBe(true);
    expect(esFestivo("2026-11-17")).toBe(false);
  });
});
