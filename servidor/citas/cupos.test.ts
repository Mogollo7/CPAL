// Contra la BD local; se omite sin DATABASE_URL (CI). Cubre T-302: obtenerCupos, listarPsicologosDeServicio y GET /api/cupos.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { crearEscenario } from "./_escenario";

describe.skipIf(!process.env.DATABASE_URL)("cupos públicos (T-302)", () => {
  let e: Awaited<ReturnType<typeof crearEscenario>>;
  let c: typeof import("./cupos");
  let GET: typeof import("../../app/api/cupos/route").GET;
  let reiniciar: () => void;
  const consulta = (extra: object = {}) => ({
    servicioId: e.servicio.id,
    desde: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    hasta: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    ...extra,
  });

  beforeAll(async () => {
    e = await crearEscenario("cup", 2);
    c = await import("./cupos");
    ({ GET } = await import("../../app/api/cupos/route"));
    reiniciar = (await import("../limites"))._reiniciarLimites;
  });
  beforeEach(() => reiniciar());
  afterAll(async () => {
    await e?.limpiar();
    await e?.bd.$disconnect();
  });

  it("devuelve cupos con la forma del contrato; con un psicólogo concreto, solo ese", async () => {
    const r = await c.obtenerCupos(consulta(), { ip: "10.4.0.1" });
    expect(r.ok && r.datos.length).toBeGreaterThan(0);
    if (!r.ok) return;
    expect(r.datos[0]).toEqual({
      inicio: expect.any(String),
      fin: expect.any(String),
      psicologoIds: expect.arrayContaining([
        e.psicologos[0].id,
        e.psicologos[1].id,
      ]),
    });
    const uno = await c.obtenerCupos(
      consulta({ psicologoId: e.psicologos[1].id }),
      { ip: "10.4.0.1" },
    );
    expect(
      uno.ok &&
        uno.datos.every(
          (x) =>
            x.psicologoIds.length === 1 &&
            x.psicologoIds[0] === e.psicologos[1].id,
        ),
    ).toBe(true);
  });
  it("VALIDACION (ventana > 14 días), SERVICIO_NO_DISPONIBLE y DEMASIADOS_INTENTOS (61.ª consulta por minuto)", async () => {
    const larga = consulta({
      hasta: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });
    expect(await c.obtenerCupos(larga, { ip: "10.4.0.2" })).toMatchObject({
      ok: false,
      codigo: "VALIDACION",
    });
    expect(
      await c.obtenerCupos(consulta({ servicioId: "no-existe" }), {
        ip: "10.4.0.2",
      }),
    ).toMatchObject({ ok: false, codigo: "SERVICIO_NO_DISPONIBLE" });
    reiniciar();
    for (let i = 0; i < 60; i++) await c.obtenerCupos({}, { ip: "10.4.0.3" });
    expect(await c.obtenerCupos(consulta(), { ip: "10.4.0.3" })).toMatchObject({
      ok: false,
      codigo: "DEMASIADOS_INTENTOS",
    });
  });
  it("listarPsicologosDeServicio: solo activos y con horario", async () => {
    const [a, b] = e.psicologos;
    await e.bd.usuario.update({ where: { id: b.id }, data: { activo: false } });
    const r = await c.listarPsicologosDeServicio(e.servicio.id);
    expect(r).toEqual({
      ok: true,
      datos: [
        { id: a.id, nombre: a.nombre, presentacion: "prueba", fotoUrl: null },
      ],
    });
    await e.bd.usuario.update({ where: { id: b.id }, data: { activo: true } });
    await e.bd.disponibilidad.deleteMany({ where: { psicologoId: b.id } });
    expect(
      (await c.listarPsicologosDeServicio(e.servicio.id)) as {
        datos: unknown[];
      },
    ).toMatchObject({ datos: [{ id: a.id }] });
  });
  it("GET /api/cupos: 200 con cupos, 400 sin parámetros, 429 al pasarse del límite", async () => {
    const q = (p: Record<string, string>, ip: string) =>
      GET(
        new Request("http://localhost/api/cupos?" + new URLSearchParams(p), {
          headers: { "x-forwarded-for": ip },
        }),
      );
    const ok = await q(
      {
        servicioId: e.servicio.id,
        desde: consulta().desde,
        hasta: consulta().hasta,
      },
      "10.4.1.1",
    );
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { ok: boolean }).ok).toBe(true);
    expect((await q({}, "10.4.1.2")).status).toBe(400);
    for (let i = 0; i < 60; i++) await q({}, "10.4.1.3");
    expect((await q({}, "10.4.1.3")).status).toBe(429);
  });
});
