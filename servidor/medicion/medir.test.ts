import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _reiniciarMedicion, procesarMedicion } from "./medir";

let salida: string[];
beforeEach(() => {
  salida = [];
  _reiniciarMedicion();
  vi.spyOn(process.stdout, "write").mockImplementation(
    (x) => (salida.push(String(x)), true),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const lineas = () =>
  salida
    .join("")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

const UA = { "user-agent": "Mozilla/5.0 (Android 14) Chrome/130" };
const cab = (extra: Record<string, string> = {}) =>
  new Headers({ ...UA, ...extra });
const lote = (r: string, e: unknown[], v = "abcdefgh12") =>
  JSON.stringify({ r, v, e });
const vista = { t: "vista", pantalla: "movil", origen: "directo" };
const medir = (
  texto: string,
  extra: Record<string, string> = {},
  activo = true,
) => procesarMedicion({ activo, texto, cabeceras: cab(extra) });

describe("procesarMedicion", () => {
  it("registra un evento válido como uso.* sin dirección de red", () => {
    expect(medir(lote("/servicios", [vista]))).toBe(1);
    const [l] = lineas();
    expect(l).toMatchObject({
      evento: "uso.vista",
      ruta: "/servicios",
      operacion: "movil",
      resultado: "directo",
    });
    expect(JSON.stringify(l)).not.toMatch(/red"|ip/);
  });

  it("MEDICION=no lo apaga por completo", () => {
    expect(medir(lote("/", [vista]), {}, false)).toBe(0);
    expect(salida).toHaveLength(0);
  });

  it("respeta 'no rastrear' (DNT y GPC)", () => {
    expect(medir(lote("/", [vista]), { dnt: "1" })).toBe(0);
    expect(medir(lote("/", [vista]), { "sec-gpc": "1" })).toBe(0);
    expect(salida).toHaveLength(0);
  });

  it("descarta robots y peticiones sin agente", () => {
    const texto = lote("/", [vista]);
    expect(
      procesarMedicion({
        activo: true,
        texto,
        cabeceras: new Headers({ "user-agent": "Googlebot/2.1" }),
      }),
    ).toBe(0);
    expect(
      procesarMedicion({ activo: true, texto, cabeceras: new Headers() }),
    ).toBe(0);
  });

  it.each([
    "/ingresar",
    "/crear-clave/abc123",
    "/recuperar-clave",
    "/panel",
    "/panel/citas/42",
  ])("nada en %s", (ruta) => {
    expect(medir(lote(ruta, [vista]))).toBe(0);
    expect(salida).toHaveLength(0);
  });

  it("/cita/[token]: solo la vista y con la ruta sin el token", () => {
    const n = medir(
      lote("/cita/SECRETO123", [vista, { t: "toque", zona: "cancelar" }]),
    );
    expect(n).toBe(1);
    expect(lineas()[0].ruta).toBe("/cita/[token]");
    expect(salida.join("")).not.toContain("SECRETO123");
  });

  it("/ayuda-inmediata: solo vistas y toques en 'llamar', sin identificador de visita", () => {
    const n = medir(
      lote("/ayuda-inmediata", [
        vista,
        { t: "toque", zona: "llamar-123" },
        { t: "toque", zona: "tarjeta-dorado" },
        { t: "permanencia", rango: "0-10" },
        { t: "desplazamiento", profundidad: 50 },
      ]),
    );
    expect(n).toBe(2);
    for (const l of lineas()) expect(l.entidad).toBeUndefined();
  });

  it("descarta lo que no reconoce: eventos y campos desconocidos, contenido de campos", () => {
    const n = medir(
      lote("/pedir-cita", [
        { t: "toque", zona: "Zona Con Espacios" },
        { t: "valor_campo", valor: "Ana Pérez" },
        { t: "error_formulario", paso: 9, campo: "correo" },
        { t: "paso", paso: 3, enviado: false },
        "basura",
      ]),
    );
    expect(n).toBe(1);
    expect(lineas()[0]).toMatchObject({
      evento: "uso.paso",
      operacion: "3",
      resultado: "alcanzado",
    });
  });

  it("rechaza lotes de más de 30 eventos, JSON inválido y cuerpos enormes", () => {
    expect(medir(lote("/", Array(31).fill(vista)))).toBe(0);
    expect(medir("{no es json")).toBe(0);
    expect(medir(lote("/", [vista]) + " ".repeat(9000))).toBe(0);
  });

  it("limita a 60 eventos por minuto por visita", () => {
    const ahora = 1_000_000;
    const enviar = (n: number, t: number) =>
      procesarMedicion({
        activo: true,
        texto: lote("/", Array(n).fill(vista)),
        cabeceras: cab(),
        ahora: t,
      });
    expect(enviar(30, ahora)).toBe(30);
    expect(enviar(30, ahora + 1000)).toBe(30);
    expect(enviar(1, ahora + 2000)).toBe(0);
    expect(enviar(1, ahora + 61_000)).toBe(1);
  });
});

describe("public/medir.js", () => {
  const js = readFileSync("public/medir.js", "utf8");
  it("pesa menos de 2 KB", () => {
    expect(Buffer.byteLength(js)).toBeLessThan(2048);
  });
  it("sale sin hacer nada con 'no rastrear' y excluye /ingresar y el panel", () => {
    expect(js).toContain("doNotTrack");
    expect(js).toContain("globalPrivacyControl");
    expect(js).toMatch(/ingresar\|crear-clave\|recuperar-clave\|panel/);
  });
  it("no usa cookies ni almacenamiento", () => {
    expect(js).not.toMatch(/cookie|localStorage|sessionStorage|fetch|XMLHttp/);
  });
});
