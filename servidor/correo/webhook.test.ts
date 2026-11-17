import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { firmaValida } from "./firma";

try {
  process.loadEnvFile();
} catch {}

const secreto = "whsec_" + Buffer.from("secreto-de-prueba").toString("base64");
const ahora = Date.parse("2026-11-20T12:00:00Z");
const firmar = (id: string, marca: number, cuerpo: string) =>
  "v1," +
  createHmac("sha256", Buffer.from("secreto-de-prueba"))
    .update(`${id}.${marca}.${cuerpo}`)
    .digest("base64");

describe("firma del webhook de Resend (T-332)", () => {
  const marca = Math.floor(ahora / 1000);
  const cuerpo = '{"type":"email.delivered"}';
  it("acepta una firma válida (también si hay varias en la cabecera)", () => {
    const f = firmar("msg_1", marca, cuerpo);
    expect(
      firmaValida(
        { id: "msg_1", marca: String(marca), firma: f },
        cuerpo,
        secreto,
        ahora,
      ),
    ).toBe(true);
    expect(
      firmaValida(
        { id: "msg_1", marca: String(marca), firma: `v1,otra ${f}` },
        cuerpo,
        secreto,
        ahora,
      ),
    ).toBe(true);
  });
  it("rechaza cuerpo alterado, firma ajena, sin secreto y avisos de más de 5 minutos", () => {
    const f = firmar("msg_1", marca, cuerpo);
    const c = { id: "msg_1", marca: String(marca), firma: f };
    expect(firmaValida(c, cuerpo + " ", secreto, ahora)).toBe(false);
    expect(
      firmaValida({ ...c, firma: "v1,AAAA" }, cuerpo, secreto, ahora),
    ).toBe(false);
    expect(firmaValida(c, cuerpo, "", ahora)).toBe(false);
    expect(firmaValida(c, cuerpo, secreto, ahora + 6 * 60_000)).toBe(false);
  });
});

describe.skipIf(!process.env.DATABASE_URL)("avisos de entrega (T-332)", () => {
  let bd: typeof import("./../bd").bd;
  let procesarAviso: typeof import("./webhook").procesarAviso;
  let panel: typeof import("./panel");
  const citaId = "t332-cita";
  const llave = "correo:cita-autorizada:t332-cita:1";

  beforeAll(async () => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("./../bd"));
    ({ procesarAviso } = await import("./webhook"));
    panel = await import("./panel");
    await limpiar();
  });
  const limpiar = () =>
    bd.trabajo.deleteMany({
      where: { OR: [{ citaId }, { llave: { startsWith: "webhook:t332" } }] },
    });
  afterAll(async () => {
    await limpiar();
    await bd.$disconnect();
  });

  it("un rebote queda registrado, se ve por cita y un aviso repetido se ignora", async () => {
    const t = await bd.trabajo.create({
      data: {
        tipo: "CORREO",
        llave,
        datos: {},
        estado: "HECHO",
        citaId,
        hechoEn: new Date(),
      },
    });
    expect((await panel.correosDeCita(citaId)).correos[0].estado).toBe(
      "ENVIADO",
    );

    const aviso = {
      type: "email.bounced",
      data: { bounce: { type: "Permanent" }, tags: { trabajo: t.id } },
    };
    expect(await procesarAviso("t332-a", aviso)).toBe("procesado");
    expect(await procesarAviso("t332-a", aviso)).toBe("repetido");

    const r = await panel.correosDeCita(citaId);
    expect(r.hayRebote).toBe(true);
    expect(r.correos[0]).toMatchObject({
      plantilla: "cita-autorizada",
      estado: "NO_ENTREGADO",
    });
  });

  it("un rebote transitorio no marca el correo", async () => {
    const t = await bd.trabajo.create({
      data: {
        tipo: "CORREO",
        llave: llave + "b",
        datos: {},
        estado: "HECHO",
        citaId,
        hechoEn: new Date(),
      },
    });
    const aviso = {
      type: "email.bounced",
      data: {
        bounce: { type: "Transient" },
        tags: [{ name: "trabajo", value: t.id }],
      },
    };
    expect(await procesarAviso("t332-b", aviso)).toBe("ignorado");
    expect(
      (await bd.trabajo.findUniqueOrThrow({ where: { id: t.id } })).entregado,
    ).toBeNull();
  });

  it("reintentar devuelve un trabajo FALLIDO a la cola y deja auditoría", async () => {
    const t = await bd.trabajo.create({
      data: {
        tipo: "CORREO",
        llave: llave + "c",
        datos: {},
        estado: "FALLIDO",
        intentos: 6,
        citaId,
      },
    });
    expect(
      (await panel.trabajosFallidos()).trabajos.some((x) => x.id === t.id),
    ).toBe(true);
    expect(await panel.reintentarTrabajo(t.id, "admin-prueba")).toEqual({
      ok: true,
    });
    const despues = await bd.trabajo.findUniqueOrThrow({ where: { id: t.id } });
    expect(despues).toMatchObject({ estado: "PENDIENTE", intentos: 0 });
    expect(await panel.reintentarTrabajo(t.id, "admin-prueba")).toEqual({
      ok: false,
    }); // ya no está fallido
    await bd.auditoria.deleteMany({ where: { entidadId: t.id } });
  });
});
