// Contra la BD local; se omite sin DATABASE_URL (CI). Crea su propio servicio y psicólogos y los borra al final.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { crearEscenario } from "./_escenario";

describe.skipIf(!process.env.DATABASE_URL)("crearCita (T-303)", () => {
  let e: Awaited<ReturnType<typeof crearEscenario>>;
  let crearCita: typeof import("./crear").crearCita;
  let cifrado: typeof import("./cifrado");
  let reiniciar: () => void;
  let n = 0;
  const ip = () => `10.1.0.${++n}`; // una dirección distinta por llamada: el límite por red no interviene
  let cupos: Awaited<ReturnType<typeof e.cupos>>;
  // Cada prueba usa cupos propios (índices distintos) para no pisarse con las demás.
  const cupo = (i: number) => cupos[i].inicio;

  beforeAll(async () => {
    e = await crearEscenario("crear", 2);
    ({ crearCita } = await import("./crear"));
    cifrado = await import("./cifrado");
    reiniciar = (await import("../limites"))._reiniciarLimites;
    cupos = await e.cupos();
  });
  beforeEach(() => reiniciar());
  afterAll(async () => {
    await e?.limpiar();
    await e?.bd.$disconnect();
  });

  it("crea la cita PENDIENTE, con motivo cifrado, auditoría y correos encolados", async () => {
    const motivo = "Estoy pasando por una situación difícil";
    const r = await crearCita(
      e.solicitud(cupo(0), e.correo("ok"), { motivo }),
      {
        ip: ip(),
      },
    );
    expect(r).toMatchObject({ ok: true, datos: { estado: "PENDIENTE" } });
    if (!r.ok) return;
    expect(r.datos.codigo).toMatch(/^CAPL-[A-Z2-9]{4}$/);
    expect(r.datos.enlaceGestion).toMatch(/^\/cita\/[^.]+\.[\w-]{43}$/);

    const c = await e.bd.cita.findUniqueOrThrow({
      where: { codigo: r.datos.codigo },
    });
    expect(c.pacienteNombre).toBe("Ana Prueba"); // PROPIA: el paciente es quien solicita
    expect(c.fin.getTime() - c.inicio.getTime()).toBe(3_600_000);
    expect(c.venceEn!.getTime()).toBeLessThanOrEqual(
      c.inicio.getTime() - 2 * 3_600_000,
    );
    expect(c.motivo).not.toContain("situación"); // ilegible en la BD
    expect(cifrado.descifrar(c.motivo!)).toBe(motivo);
    const crudo = await e.bd.$queryRaw<
      { motivo: string }[]
    >`SELECT "motivo" FROM "Cita" WHERE "id" = ${c.id}`;
    expect(crudo[0].motivo).toMatch(/^v1\./);

    const trabajos = await e.bd.trabajo.findMany({ where: { citaId: c.id } });
    expect(trabajos.map((t) => t.llave).sort()).toEqual([
      `correo:nueva-solicitud:${c.id}:1`,
      `correo:solicitud-recibida:${c.id}:1`,
    ]);
    expect(trabajos[0]).toMatchObject({ tipo: "CORREO", estado: "PENDIENTE" });
    expect(trabajos.find((t) => t.llave.includes("recibida"))!.datos).toEqual({
      plantilla: "solicitud-recibida",
      citaId: c.id,
    });
    expect(
      await e.bd.auditoria.count({
        where: { entidad: "Cita", entidadId: c.id, accion: "CITA_CREADA" },
      }),
    ).toBe(1);
  });

  it("con «cualquiera», asigna al psicólogo con menos citas ese día", async () => {
    const [a, b] = e.psicologos;
    const dia = cupos[8].inicio.slice(0, 10);
    const mismoDia = cupos.filter((c) => c.inicio.slice(0, 10) === dia);
    expect(mismoDia.length).toBeGreaterThanOrEqual(3);
    // A ya tiene una cita ese día (pedida a él directamente)
    const previa = await crearCita(
      e.solicitud(mismoDia[0].inicio, e.correo("carga1"), {
        psicologoId: a.id,
      }),
      { ip: ip() },
    );
    expect(previa.ok).toBe(true);
    const r = await crearCita(
      e.solicitud(mismoDia[2].inicio, e.correo("carga2")),
      {
        ip: ip(),
      },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const c = await e.bd.cita.findUniqueOrThrow({
      where: { codigo: r.datos.codigo },
    });
    expect(c.psicologoId).toBe(b.id);
  });

  it("dos envíos simultáneos al mismo cupo de un psicólogo: uno entra y el otro recibe CUPO_OCUPADO", async () => {
    const inicio = cupo(10);
    const psicologoId = e.psicologos[0].id;
    const rs = await Promise.all(
      [1, 2].map((i) =>
        crearCita(e.solicitud(inicio, e.correo(`par${i}`), { psicologoId }), {
          ip: ip(),
        }),
      ),
    );
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect(rs.find((r) => !r.ok)).toMatchObject({
      ok: false,
      codigo: "CUPO_OCUPADO",
    });
    expect(
      await e.bd.cita.count({
        where: {
          servicioId: e.servicio.id,
          psicologoId,
          inicio: new Date(inicio),
        },
      }),
    ).toBe(1);
  });

  it("varios envíos simultáneos con «cualquiera»: se reparten entre psicólogos y el que sobra recibe CUPO_OCUPADO", async () => {
    const inicio = cupo(12);
    const rs = await Promise.all(
      [1, 2, 3, 4].map((i) =>
        crearCita(e.solicitud(inicio, e.correo(`var${i}`)), { ip: ip() }),
      ),
    );
    expect(rs.filter((r) => r.ok)).toHaveLength(2); // hay dos psicólogos libres
    expect(
      rs
        .filter((r) => !r.ok)
        .every((r) => !r.ok && r.codigo === "CUPO_OCUPADO"),
    ).toBe(true);
    const citas = await e.bd.cita.findMany({
      where: { servicioId: e.servicio.id, inicio: new Date(inicio) },
    });
    expect(new Set(citas.map((c) => c.psicologoId)).size).toBe(2); // uno por psicólogo
  });

  it("un cupo ya tomado responde CUPO_OCUPADO; uno que nunca existió, FUERA_DE_RANGO", async () => {
    const inicio = cupo(14);
    const psicologoId = e.psicologos[0].id;
    expect(
      (
        await crearCita(e.solicitud(inicio, e.correo("o1"), { psicologoId }), {
          ip: ip(),
        })
      ).ok,
    ).toBe(true);
    expect(
      await crearCita(e.solicitud(inicio, e.correo("o2"), { psicologoId }), {
        ip: ip(),
      }),
    ).toMatchObject({ ok: false, codigo: "CUPO_OCUPADO" });
    const mediaHora = new Date(
      Date.parse(cupo(16)) + 30 * 60_000,
    ).toISOString();
    expect(
      await crearCita(e.solicitud(mediaHora, e.correo("o3")), { ip: ip() }),
    ).toMatchObject({ ok: false, codigo: "FUERA_DE_RANGO" });
    const pronto = new Date(Date.now() + 3_600_000).toISOString(); // dentro de la anticipación mínima
    expect(
      await crearCita(e.solicitud(pronto, e.correo("o4")), { ip: ip() }),
    ).toMatchObject({ ok: false, codigo: "FUERA_DE_RANGO" });
  });

  it("LIMITE_CITAS por correo y por documento", async () => {
    const doc = "D12345678";
    expect(
      (
        await crearCita(
          e.solicitud(cupo(18), e.correo("lim"), { pacienteDocumento: doc }),
          { ip: ip() },
        )
      ).ok,
    ).toBe(true);
    // mismo correo, otro documento
    expect(
      await crearCita(e.solicitud(cupo(20), e.correo("lim")), { ip: ip() }),
    ).toMatchObject({ ok: false, codigo: "LIMITE_CITAS" });
    // otro correo, mismo documento
    expect(
      await crearCita(
        e.solicitud(cupo(20), e.correo("lim2"), { pacienteDocumento: doc }),
        { ip: ip() },
      ),
    ).toMatchObject({ ok: false, codigo: "LIMITE_CITAS" });
  });

  it("SERVICIO_NO_DISPONIBLE si no existe o no es agendable en línea", async () => {
    expect(
      await crearCita(
        { ...e.solicitud(cupo(22), e.correo("s1")), servicioId: "no-existe" },
        { ip: ip() },
      ),
    ).toMatchObject({ ok: false, codigo: "SERVICIO_NO_DISPONIBLE" });
    await e.bd.servicio.update({
      where: { id: e.servicio.id },
      data: { agendableEnLinea: false },
    });
    expect(
      await crearCita(e.solicitud(cupo(22), e.correo("s2")), { ip: ip() }),
    ).toMatchObject({ ok: false, codigo: "SERVICIO_NO_DISPONIBLE" });
    await e.bd.servicio.update({
      where: { id: e.servicio.id },
      data: { agendableEnLinea: true },
    });
  });

  it("VALIDACION con el error de cada campo; el campo trampa responde éxito sin guardar", async () => {
    const r = await crearCita(
      { ...e.solicitud(cupo(24), "no-es-correo"), solicitanteNombre: "A" },
      { ip: ip() },
    );
    expect(r).toMatchObject({ ok: false, codigo: "VALIDACION" });
    expect(!r.ok && Object.keys(r.campos!)).toEqual(
      expect.arrayContaining(["solicitanteCorreo", "solicitanteNombre"]),
    );
    const antes = await e.bd.cita.count({
      where: { servicioId: e.servicio.id },
    });
    expect(
      (
        await crearCita(
          e.solicitud(cupo(24), e.correo("bot"), { sitioWeb: "http://spam" }),
          { ip: ip() },
        )
      ).ok,
    ).toBe(true);
    expect(
      await e.bd.cita.count({ where: { servicioId: e.servicio.id } }),
    ).toBe(antes);
  });

  it("DEMASIADOS_INTENTOS: la sexta petición de la misma dirección en una hora", async () => {
    const misma = "10.9.9.9";
    const rs = [];
    for (let i = 0; i < 6; i++)
      rs.push(
        await crearCita(
          e.solicitud("2020-01-01T10:00:00-05:00", e.correo("rate")),
          { ip: misma },
        ),
      );
    expect(
      rs.slice(0, 5).every((r) => !r.ok && r.codigo === "FUERA_DE_RANGO"),
    ).toBe(true);
    expect(rs[5]).toMatchObject({ ok: false, codigo: "DEMASIADOS_INTENTOS" });
  });
});
