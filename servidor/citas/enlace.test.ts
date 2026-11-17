import { afterEach, describe, expect, it } from "vitest";
import { enlaceDeCita, idDeToken, tokenDeCita } from "./enlace";

process.env.AUTH_SECRET = "secreto-de-prueba-de-enlaces";
afterEach(() => {
  process.env.AUTH_SECRET = "secreto-de-prueba-de-enlaces";
});

describe("enlace firmado de la cita (T-305)", () => {
  it("el token de una cita se regenera igual y vuelve a su id", () => {
    expect(tokenDeCita("cita123")).toBe(tokenDeCita("cita123"));
    expect(idDeToken(tokenDeCita("cita123"))).toBe("cita123");
    expect(enlaceDeCita("cita123")).toBe(`/cita/${tokenDeCita("cita123")}`);
  });
  it("firma alterada, id cambiado, vacío o mal formado → null", () => {
    const t = tokenDeCita("cita123");
    const [id, firma] = t.split(".");
    expect(
      idDeToken(
        `${id}.${firma.slice(0, -1)}${firma.endsWith("A") ? "B" : "A"}`,
      ),
    ).toBeNull();
    expect(idDeToken(`otra.${firma}`)).toBeNull();
    expect(idDeToken(`${id}.`)).toBeNull();
    expect(idDeToken(id)).toBeNull();
    expect(idDeToken("")).toBeNull();
    expect(idDeToken(`${id}.${firma}x`)).toBeNull();
  });
  it("otra AUTH_SECRET invalida los enlaces anteriores", () => {
    const t = tokenDeCita("cita123");
    process.env.AUTH_SECRET = "otro-secreto-distinto";
    expect(idDeToken(t)).toBeNull();
  });
});
