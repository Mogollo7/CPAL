import { beforeEach, describe, expect, it, vi } from "vitest";
import { _reiniciarAgotadas, enviarCorreo, incrustarImagenes } from "./resend";

const c = { para: "a@b.co", asunto: "x", html: "<p>x</p>", texto: "x" };

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockImplementation(() => true); // sin ruido de registros
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
    // llave inválida o sin permiso (401/403) NO es permanente: se reintenta y se avisa
    for (const statusCode of [401, 403, 500]) {
      _reiniciarAgotadas();
      expect(await enviarCorreo(c, async () => ({ statusCode }))).toMatchObject(
        { ok: false, permanente: false },
      );
    }
  });
});

describe("plantillas de Resend", () => {
  const conPlantilla = {
    ...c,
    plantilla: { id: "cita-vencida", variables: { NOMBRE: "Ana" } },
  };
  it("con plantilla publicada se envía con ella", async () => {
    const vistos: unknown[] = [];
    const r = await enviarCorreo(conPlantilla, async (_l, x) => {
      vistos.push(x.plantilla);
      return null;
    });
    expect(r).toEqual({ ok: true, llaveUsada: 0 });
    expect(vistos).toEqual([conPlantilla.plantilla]);
  });
  it("plantilla sin publicar (404/422) → el correo sale con el html propio, sin perderse ni gastar otra llave", async () => {
    const vistos: unknown[] = [];
    const r = await enviarCorreo(conPlantilla, async (_l, x) => {
      vistos.push(x.plantilla);
      return x.plantilla ? { statusCode: 404, name: "not_found" } : null;
    });
    expect(r).toEqual({ ok: true, llaveUsada: 0 });
    expect(vistos).toEqual([conPlantilla.plantilla, undefined]);
  });
});

describe("imágenes inline", () => {
  it("convierte las imágenes del CAPL a CID y conserva el resto del HTML", async () => {
    const r = await incrustarImagenes(
      '<img src="https://capl.juanlabs.me/correos/logo-capl.png"><img src="/correos/gato-aprobacion.png"><img src="/correos/logo-capl.png"><img data-src="/correos/gato-saludo.png" src="https://otro.test/imagen.png">',
    );
    expect(r.html).toContain('src="cid:capl-logo-capl-png"');
    expect(r.html).toContain('src="cid:capl-gato-aprobacion-png"');
    expect(r.html).toContain('data-src="/correos/gato-saludo.png"');
    expect(r.html).toContain("https://otro.test/imagen.png");
    expect(r.adjuntos.map((a) => a.contentId)).toEqual([
      "capl-logo-capl-png",
      "capl-gato-aprobacion-png",
    ]);
  });
});
