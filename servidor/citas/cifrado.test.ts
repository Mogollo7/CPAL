import { afterEach, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { cifrar, descifrar } from "./cifrado";

const llave = () => randomBytes(32).toString("base64");
const original = process.env.CLAVE_CIFRADO;
afterEach(() => {
  process.env.CLAVE_CIFRADO = original;
});

describe("cifrado del motivo (T-336)", () => {
  it("ida y vuelta; el valor guardado no contiene el texto y lleva la versión", () => {
    process.env.CLAVE_CIFRADO = `1:${llave()}`;
    const c = cifrar("Me siento muy ansiosa por los exámenes");
    expect(c).toMatch(/^v1\./);
    expect(c).not.toContain("ansiosa");
    expect(descifrar(c)).toBe("Me siento muy ansiosa por los exámenes");
    expect(cifrar("x")).not.toBe(cifrar("x")); // IV distinto cada vez
  });
  it("tras rotar, lo viejo se sigue leyendo y lo nuevo usa la versión 2", () => {
    const v1 = llave();
    process.env.CLAVE_CIFRADO = v1; // sin prefijo = versión 1
    const viejo = cifrar("antes");
    process.env.CLAVE_CIFRADO = `2:${llave()},1:${v1}`;
    expect(descifrar(viejo)).toBe("antes");
    expect(cifrar("ahora")).toMatch(/^v2\./);
  });
  it("detecta alteración, llave equivocada, llave faltante o de tamaño incorrecto", () => {
    process.env.CLAVE_CIFRADO = `1:${llave()}`;
    const c = cifrar("secreto");
    const partes = c.split(".");
    partes[3] = Buffer.from("otro texto").toString("base64url");
    expect(() => descifrar(partes.join("."))).toThrow();
    process.env.CLAVE_CIFRADO = `1:${llave()}`;
    expect(() => descifrar(c)).toThrow();
    process.env.CLAVE_CIFRADO = "";
    expect(() => cifrar("x")).toThrow("Falta CLAVE_CIFRADO");
    process.env.CLAVE_CIFRADO = "1:abc";
    expect(() => cifrar("x")).toThrow("32 bytes");
  });
});
