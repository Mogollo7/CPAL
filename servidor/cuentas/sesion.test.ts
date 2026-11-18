import { beforeAll, describe, expect, it } from "vitest";
import { hashClave, verificarClave } from "./clave";
import {
  firmar,
  leer,
  MAX_INACTIVIDAD_S,
  nuevaCarga,
  renovada,
} from "./sesion";

const SECRETO = "x".repeat(40);
beforeAll(() => {
  process.env.AUTH_SECRET = SECRETO;
});

describe("sesión firmada", () => {
  it("ida y vuelta; el plazo es 2 h para admin y 8 h para psicólogo", () => {
    const a = nuevaCarga("u1", "ADMIN", 1000);
    const p = nuevaCarga("u2", "PSICOLOGO", 1000);
    expect(a.exp - 1000).toBe(2 * 3600);
    expect(p.exp - 1000).toBe(8 * 3600);
    expect(leer(firmar(a), SECRETO, 1001)).toEqual(a);
  });
  it("rechaza firma alterada, otro secreto, basura y token vencido", () => {
    const t = firmar(nuevaCarga("u1", "PSICOLOGO", 1000));
    const [cuerpo, f] = t.split(".");
    const admin = Buffer.from(
      JSON.stringify({ u: "u1", r: "ADMIN", exp: 9e9 }),
    ).toString("base64url");
    expect(leer(`${admin}.${f}`, SECRETO, 1001)).toBeNull(); // subir de rol con la firma vieja
    expect(leer(`${cuerpo}.${f}x`, SECRETO, 1001)).toBeNull();
    expect(leer(t, "otro".repeat(12), 1001)).toBeNull();
    expect(leer("basura", SECRETO, 1001)).toBeNull();
    expect(leer(undefined, SECRETO, 1001)).toBeNull();
    expect(leer(t, SECRETO, 1000 + MAX_INACTIVIDAD_S.PSICOLOGO)).toBeNull(); // vencida
  });
  it("renovación deslizante: solo cuando pasó la mitad del plazo", () => {
    const c = nuevaCarga("u1", "ADMIN", 0); // vence a las 2 h
    expect(renovada(c, 100)).toBeNull();
    expect(renovada(c, 4000)).toEqual({ ...c, exp: 4000 + 2 * 3600 });
  });
  it("sin AUTH_SECRET válida falla en voz alta, no firma con una vacía", () => {
    const antes = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "corta";
    expect(() => firmar(nuevaCarga("u", "ADMIN"))).toThrow(/AUTH_SECRET/);
    process.env.AUTH_SECRET = antes;
  });
});

describe("contraseñas argon2id", () => {
  it("verifica la correcta, rechaza la incorrecta y nunca guarda texto plano", async () => {
    const h = await hashClave("una-clave-larga-123");
    expect(h).toMatch(/^\$argon2id\$/);
    expect(h).not.toContain("una-clave-larga");
    expect(await verificarClave(h, "una-clave-larga-123")).toBe(true);
    expect(await verificarClave(h, "otra-clave")).toBe(false);
    expect(await verificarClave("no-es-un-hash", "x")).toBe(false);
  });
});
