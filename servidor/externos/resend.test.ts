import { beforeEach, describe, expect, it } from "vitest";
import { _reiniciarAgotadas, enviarCorreo } from "./resend";

const c = { para: "a@b.co", asunto: "x", html: "<p>x</p>", texto: "x" };

beforeEach(() => {
  _reiniciarAgotadas();
  process.env.CORREO_MODO = "resend";
  process.env.ENTORNO = "local";
  process.env.RESEND_API_KEYS = "re_a, re_b";
});

describe("rotación de llaves Resend", () => {
  it("usa la principal si responde bien", async () => {
    const r = await enviarCorreo(c, async () => null);
    expect(r).toEqual({ ok: true, llaveUsada: 0 });
  });
  it("429 en la principal → pasa a la de respaldo y la recuerda", async () => {
    const usadas: string[] = [];
    const enviar = async (llave: string) => {
      usadas.push(llave);
      return llave === "re_a"
        ? { statusCode: 429, name: "daily_quota_exceeded" }
        : null;
    };
    expect(await enviarCorreo(c, enviar)).toEqual({ ok: true, llaveUsada: 1 });
    await enviarCorreo(c, enviar); // segunda vez: ya no toca re_a
    expect(usadas).toEqual(["re_a", "re_b", "re_b"]);
  });
  it("al día siguiente vuelve a intentar la principal", async () => {
    const enviar = async (llave: string) =>
      llave === "re_a" ? { statusCode: 429 } : null;
    await enviarCorreo(c, enviar, 0);
    const usadas: string[] = [];
    await enviarCorreo(
      c,
      async (l) => (usadas.push(l), null),
      25 * 3600 * 1000,
    );
    expect(usadas).toEqual(["re_a"]);
  });
  it("todas agotadas → fallo temporal; 422 → permanente", async () => {
    expect(
      await enviarCorreo(c, async () => ({ statusCode: 429 })),
    ).toMatchObject({ ok: false, permanente: false });
    _reiniciarAgotadas();
    expect(
      await enviarCorreo(c, async () => ({
        statusCode: 422,
        name: "validation_error",
      })),
    ).toMatchObject({ ok: false, permanente: true });
  });
});
