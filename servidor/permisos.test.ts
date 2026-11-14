import { describe, expect, it } from "vitest";
import { exigir, type Sesion } from "./permisos";

const admin: Sesion = { usuarioId: "a", rol: "ADMIN", activo: true };
const psi: Sesion = { usuarioId: "p", rol: "PSICOLOGO", activo: true };

describe("exigir(rol)", () => {
  it("sin sesión → NO_AUTENTICADO", () => {
    expect(exigir(null, "ADMIN")).toMatchObject({
      ok: false,
      codigo: "NO_AUTENTICADO",
    });
    expect(exigir(undefined, "PSICOLOGO")).toMatchObject({
      ok: false,
      codigo: "NO_AUTENTICADO",
    });
  });
  it("usuario desactivado → NO_AUTENTICADO aunque tenga el rol", () => {
    expect(exigir({ ...admin, activo: false }, "ADMIN")).toMatchObject({
      ok: false,
      codigo: "NO_AUTENTICADO",
    });
  });
  it("psicólogo en ruta de admin → SIN_PERMISO", () => {
    expect(exigir(psi, "ADMIN")).toMatchObject({
      ok: false,
      codigo: "SIN_PERMISO",
    });
  });
  it("rol correcto o lista de roles → ok y devuelve la sesión", () => {
    expect(exigir(admin, "ADMIN")).toEqual({ ok: true, datos: admin });
    expect(exigir(psi, ["PSICOLOGO", "ADMIN"])).toEqual({
      ok: true,
      datos: psi,
    });
  });
});
