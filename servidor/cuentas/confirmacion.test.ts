import { beforeAll, describe, expect, it } from "vitest";
import {
  CONFIRMACION_VIGENCIA_S,
  confirmacionVigente,
  firmarConfirmacion,
} from "./confirmacion";
import { firmarPaso, leerPaso } from "./segundoPaso";
import { firmarDatos } from "./sesion";

beforeAll(() => {
  process.env.AUTH_SECRET = "x".repeat(40);
});

describe("confirmación de contraseña reciente (T-218)", () => {
  it("vale 10 minutos y solo para el mismo usuario", () => {
    const t = firmarConfirmacion("u1", 1000);
    expect(confirmacionVigente(t, "u1", 1000 + 599)).toBe(true);
    expect(confirmacionVigente(t, "u1", 1000 + CONFIRMACION_VIGENCIA_S)).toBe(
      false,
    );
    expect(confirmacionVigente(t, "u2", 1100)).toBe(false);
  });
  it("sin cookie, alterada o de otro tipo no sirve", () => {
    expect(confirmacionVigente(undefined, "u1")).toBe(false);
    const t = firmarConfirmacion("u1");
    expect(confirmacionVigente(t.slice(0, -2) + "xx", "u1")).toBe(false);
    // un token del paso 2 del ingreso no se acepta como confirmación
    expect(confirmacionVigente(firmarPaso("u1"), "u1")).toBe(false);
    expect(
      confirmacionVigente(firmarDatos({ t: "otro", u: "u1", exp: 9e9 }), "u1"),
    ).toBe(false);
  });
});

describe("cookie del paso 2", () => {
  it("devuelve el usuario mientras no venza (10 min) y rechaza una confirmación", () => {
    const t = firmarPaso("u1", 1000);
    expect(leerPaso(t, 1500)).toBe("u1");
    expect(leerPaso(t, 1600)).toBeNull();
    expect(leerPaso(firmarConfirmacion("u1"))).toBeNull();
    expect(leerPaso(undefined)).toBeNull();
  });
});
