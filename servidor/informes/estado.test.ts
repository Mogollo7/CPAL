import { describe, expect, it } from "vitest";
import { resumirSondeos, ventanaDelInforme } from "./estado";

const MIN = 60_000;
const T0 = new Date("2026-11-18T13:00:00.000Z"); // 08:00 Bogotá
const hasta = new Date(T0.getTime() + 60 * MIN); // ventana de 1 hora = 60 minutos
const latido = (min: number, ms = 10) => ({
  creadoEn: new Date(T0.getTime() + min * MIN + 5_000),
  ms,
  ok: true,
});

describe("resumirSondeos", () => {
  it("sin huecos: 100 % y sin interrupción", () => {
    const l = Array.from({ length: 60 }, (_, i) => latido(i));
    const r = resumirSondeos(l, T0, hasta);
    expect(r).toMatchObject({
      disponibilidad: 100,
      minutosSinServicio: 0,
      incidente: null,
    });
  });
  it("un hueco de 4 minutos: baja la disponibilidad y lo reporta como la interrupción", () => {
    const l = Array.from({ length: 60 }, (_, i) => i)
      .filter((i) => i < 20 || i >= 24)
      .map((i) => latido(i));
    const r = resumirSondeos(l, T0, hasta);
    expect(r.minutosSinServicio).toBe(4);
    expect(r.disponibilidad).toBe(93.33);
    expect(r.incidente).toEqual({
      desde: new Date(T0.getTime() + 20 * MIN).toISOString(),
      hasta: new Date(T0.getTime() + 24 * MIN).toISOString(),
    });
  });
  it("un minuto suelto sin latido cuenta como sin servicio pero no como interrupción (hacen falta 2)", () => {
    const l = Array.from({ length: 60 }, (_, i) => i)
      .filter((i) => i !== 30)
      .map((i) => latido(i));
    const r = resumirSondeos(l, T0, hasta);
    expect(r.minutosSinServicio).toBe(1);
    expect(r.incidente).toBeNull();
  });
  it("el hueco del final de la ventana también es una interrupción", () => {
    const r = resumirSondeos(
      Array.from({ length: 50 }, (_, i) => latido(i)),
      T0,
      hasta,
    );
    expect(r.minutosSinServicio).toBe(10);
    expect(r.incidente?.desde).toBe(
      new Date(T0.getTime() + 50 * MIN).toISOString(),
    );
  });
  it("latencia p95: el valor por debajo del cual queda el 95 %", () => {
    const l = Array.from({ length: 20 }, (_, i) => latido(i, (i + 1) * 10)); // 10…200
    expect(resumirSondeos(l, T0, hasta).latenciaP95Ms).toBe(190);
  });
  it("sin latidos: disponibilidad 0 de 60 minutos y sin latencia", () => {
    const r = resumirSondeos([], T0, hasta);
    expect(r).toMatchObject({ disponibilidad: 0, latenciaP95Ms: null });
  });
});

describe("ventanaDelInforme", () => {
  it("antes de las 08:00 de Bogotá no toca", () => {
    expect(ventanaDelInforme(new Date("2026-11-19T12:59:00.000Z"))).toBeNull();
  });
  it("desde las 08:00: 24 horas, de 08:00 a 08:00, y el día en que se envía", () => {
    const v = ventanaDelInforme(new Date("2026-11-19T13:05:00.000Z"));
    expect(v?.dia).toBe("2026-11-19");
    expect(v?.hasta.toISOString()).toBe("2026-11-19T13:00:00.000Z");
    expect(v?.desde.toISOString()).toBe("2026-11-18T13:00:00.000Z");
  });
});
