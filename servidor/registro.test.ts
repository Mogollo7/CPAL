import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enviarCorreo } from "./externos/resend";
import {
  conPeticion,
  conRegistro,
  redTruncada,
  registrar,
  rutaLimpia,
} from "./registro";

let salida: string[];
beforeEach(() => {
  salida = [];
  vi.spyOn(process.stdout, "write").mockImplementation(
    (x) => (salida.push(String(x)), true),
  );
  process.env.CORREO_MODO = "consola";
});
afterEach(() => vi.restoreAllMocks());

const lineas = () =>
  salida
    .join("")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));

describe("registrar()", () => {
  it("escribe una línea JSON con t, nivel, evento y campos", () => {
    registrar("cita.creada", {
      entidad: "cita:ckx1",
      rol: "publico",
      resultado: "ok",
    });
    expect(lineas()).toEqual([
      expect.objectContaining({
        nivel: "info",
        evento: "cita.creada",
        entidad: "cita:ckx1",
        rol: "publico",
        resultado: "ok",
      }),
    ]);
    expect(new Date(lineas()[0].t).toString()).not.toBe("Invalid Date");
  });
  it("el mismo identificador de petición en todas las líneas de una petición", () => {
    conPeticion("abc12345", () => {
      registrar("cita.creada");
      registrar("cola.encolado");
    });
    registrar("tarea.latido"); // fuera de petición: sin identificador
    expect(lineas().map((l) => l.peticion)).toEqual([
      "abc12345",
      "abc12345",
      undefined,
    ]);
  });
  it("rutas sin tokens ni identificadores; redes truncadas", () => {
    expect(rutaLimpia("/cita/Zx9-token-secreto")).toBe("/cita/[token]");
    expect(rutaLimpia("/crear-clave/otro-token")).toBe("/crear-clave/[token]");
    expect(rutaLimpia("/eventos/taller-estres")).toBe("/eventos/[slug]");
    expect(rutaLimpia("/pedir-cita")).toBe("/pedir-cita");
    expect(redTruncada("203.0.113.77")).toBe("203.0.113.0");
    expect(redTruncada("2001:db8:85a3:8d3:1319:8a2e:370:7348")).toBe(
      "2001:db8:85a3::",
    );
  });
  it("conRegistro: una línea http.peticion por petición y cabecera x-peticion", async () => {
    const res = await conRegistro(() => Response.json({ estado: "ok" }))(
      new Request("http://x/api/salud"),
    );
    const [l] = lineas();
    expect(l).toMatchObject({
      evento: "http.peticion",
      ruta: "/api/salud",
      estado: 200,
      resultado: "ok",
    });
    expect(res.headers.get("x-peticion")).toBe(l.peticion);
  });
  it("conRegistro: un fallo interno queda como http.error y responde 500", async () => {
    const res = await conRegistro(() => {
      throw new Error("paciente.secreto@ejemplo.test");
    })(new Request("http://x/api/algo"));
    expect(res.status).toBe(500);
    expect(salida.join("")).not.toContain("paciente.secreto"); // ni el mensaje del error
    expect(lineas()[0]).toMatchObject({ evento: "http.error", nivel: "error" });
  });
});

describe("sin datos personales en registros (S06)", () => {
  it("el flujo de envío de correo no deja destinatario, asunto ni cuerpo en la salida", async () => {
    const SIEMBRA = [
      "paciente.secreto@ejemplo.test",
      "Juana Pérez Reservada",
      "1020304050",
      "motivo-confidencial",
    ];
    await conPeticion("p1", () =>
      enviarCorreo({
        para: SIEMBRA[0],
        asunto: `Hola ${SIEMBRA[1]}`,
        html: `<p>${SIEMBRA[2]} ${SIEMBRA[3]}</p>`,
        texto: SIEMBRA[3],
      }),
    );
    const todo = salida.join("");
    expect(todo.length).toBeGreaterThan(0); // sí registró algo…
    for (const dato of SIEMBRA) expect(todo).not.toContain(dato); // …pero nada sensible
  });
});
