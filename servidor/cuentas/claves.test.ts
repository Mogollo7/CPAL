// Contra la BD local; se omite sin DATABASE_URL (CI).
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

try {
  process.loadEnvFile();
} catch {}

const correo = (n: string) => `t203-${n}@ejemplo.test`;
const NUEVA = "una-clave-bien-larga-1";
const ACTUAL = "clave-actual-larga";

describe.skipIf(!process.env.DATABASE_URL)("contraseñas (T-203)", () => {
  let bd: typeof import("../bd").bd;
  let c: typeof import("./claves");
  let en: typeof import("./enlaces");
  let leer: typeof import("./sesion").leer;
  let limites: typeof import("../limites");
  const ids: Record<string, string> = {};

  beforeAll(async () => {
    process.env.AUTH_SECRET ||= "x".repeat(40);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("../bd"));
    c = await import("./claves");
    en = await import("./enlaces");
    ({ leer } = await import("./sesion"));
    limites = await import("../limites");
    const { hashClave } = await import("./clave");
    const claveHash = await hashClave(ACTUAL);
    for (const [n, rol, h] of [
      ["nueva", "PSICOLOGO", undefined],
      ["activa", "PSICOLOGO", claveHash],
      ["admin", "ADMIN", claveHash],
    ] as const)
      ids[n] = (
        await bd.usuario.create({
          data: { correo: correo(n), nombre: n, rol, claveHash: h },
        })
      ).id;
  });
  beforeEach(() => limites._reiniciarLimites());
  afterAll(async () => {
    const donde = { correo: { startsWith: "t203-" } };
    const todos = Object.values(ids);
    const tk = await bd.tokenAcceso.findMany({
      where: { usuarioId: { in: todos } },
    });
    await bd.trabajo.deleteMany({
      where: { OR: tk.map((x) => ({ llave: { contains: x.id } })) },
    });
    await bd.auditoria.deleteMany({ where: { usuarioId: { in: todos } } });
    await bd.dispositivoConfiable.deleteMany({
      where: { usuarioId: { in: todos } },
    });
    await bd.tokenAcceso.deleteMany({ where: { usuario: donde } });
    await bd.usuario.deleteMany({ where: donde });
    await bd.$disconnect();
  });

  // La llave del correo lleva el id del enlace emitido: se cuenta por los tokens del usuario.
  async function correosDe(usuarioId: string, plantilla: string) {
    const tk = await bd.tokenAcceso.findMany({ where: { usuarioId } });
    return bd.trabajo.count({
      where: {
        OR: tk.map((x) => ({
          llave: { startsWith: `correo:${plantilla}:${x.id}:` },
        })),
      },
    });
  }

  const entrada = (token: string, clave = NUEVA, confirmacion = clave) => ({
    token,
    clave,
    confirmacion,
  });

  it("crearClave: con enlace vigente fija la contraseña, abre sesión y gasta el enlace", async () => {
    const g = await en.generarEnlace(ids.nueva, "INVITACION");
    const r = await c.crearClave(entrada(g.token));
    if (!r.ok) throw new Error(r.mensaje);
    expect(leer(r.datos.token)).toMatchObject({
      u: ids.nueva,
      r: "PSICOLOGO",
    });
    const u = await bd.usuario.findUniqueOrThrow({ where: { id: ids.nueva } });
    expect(u.claveHash).toMatch(/^\$argon2id/);
    expect(await c.crearClave(entrada(g.token))).toMatchObject({
      ok: false,
      codigo: "ENLACE_INVALIDO",
    });
  });
  it("crearClave: validación (no coincide, corta, igual al correo, común) y enlaces malos", async () => {
    const g = await en.generarEnlace(ids.nueva, "RECUPERACION");
    expect(await c.crearClave(entrada(g.token, NUEVA, "otra"))).toMatchObject({
      ok: false,
      codigo: "VALIDACION",
      campos: { confirmacion: expect.any(String) },
    });
    for (const mala of ["corta", correo("nueva"), "1234567890"])
      expect(await c.crearClave(entrada(g.token, mala))).toMatchObject({
        ok: false,
        codigo: "VALIDACION",
      });
    expect((await c.crearClave(entrada(g.token))).ok).toBe(true); // los intentos fallidos no gastaron el enlace
    expect(await c.crearClave(entrada("inventado"))).toMatchObject({
      ok: false,
      codigo: "ENLACE_INVALIDO",
    });
    const v = await en.generarEnlace(
      ids.nueva,
      "RECUPERACION",
      new Date(Date.now() - 100 * 3_600_000),
    );
    expect(await c.crearClave(entrada(v.token))).toMatchObject({
      ok: false,
      codigo: "ENLACE_VENCIDO",
    });
  });
  it("solicitarEnlace: responde IGUAL exista o no el correo; solo la cuenta real recibe correo (en la cola)", async () => {
    const real = await c.solicitarEnlace({
      correo: ` ${correo("activa").toUpperCase()} `,
    });
    const falso = await c.solicitarEnlace({ correo: correo("no-existe") });
    expect(real).toEqual(falso);
    expect(real).toEqual({ ok: true, datos: { ok: true } });
    expect(await correosDe(ids.activa, "recuperar-clave")).toBe(1);
    expect(
      await bd.trabajo.count({ where: { llave: { contains: "no-existe" } } }),
    ).toBe(0);
    expect(
      await bd.tokenAcceso.count({
        where: { usuarioId: ids.activa, tipo: "RECUPERACION", usadoEn: null },
      }),
    ).toBe(1);
  });
  it("solicitarEnlace: quien aún no creó contraseña recibe la invitación; reemitir invalida el enlace anterior", async () => {
    const p = await bd.usuario.create({
      data: { correo: correo("pendiente"), nombre: "P", rol: "PSICOLOGO" },
    });
    ids.pendiente = p.id;
    await c.solicitarEnlace({ correo: correo("pendiente") });
    await c.solicitarEnlace({ correo: correo("pendiente") });
    expect(
      await bd.tokenAcceso.count({
        where: { usuarioId: p.id, tipo: "INVITACION", usadoEn: null },
      }),
    ).toBe(1);
    expect(await correosDe(p.id, "invitacion")).toBe(2); // uno por enlace emitido
  });
  it("solicitarEnlace: 3 por hora y por correo, con o sin cuenta; correo mal escrito → VALIDACION", async () => {
    for (let i = 0; i < 3; i++)
      await c.solicitarEnlace({ correo: correo("nadie") });
    expect(await c.solicitarEnlace({ correo: correo("nadie") })).toMatchObject({
      ok: false,
      codigo: "DEMASIADOS_INTENTOS",
    });
    expect(await c.solicitarEnlace({ correo: "x" })).toMatchObject({
      ok: false,
      codigo: "VALIDACION",
    });
  });
  it("cambiarClave: pide sesión, la actual correcta y política; olvida dispositivos; el admin deja auditoría", async () => {
    const admin = { usuarioId: ids.admin, rol: "ADMIN" as const, activo: true };
    expect(await c.cambiarClave(null, {})).toMatchObject({
      ok: false,
      codigo: "NO_AUTENTICADO",
    });
    expect(
      await c.cambiarClave(admin, { claveActual: "mala", claveNueva: NUEVA }),
    ).toMatchObject({ ok: false, codigo: "CREDENCIALES" });
    expect(
      await c.cambiarClave(admin, { claveActual: ACTUAL, claveNueva: "corta" }),
    ).toMatchObject({ ok: false, codigo: "VALIDACION" });
    await bd.dispositivoConfiable.create({
      data: {
        usuarioId: ids.admin,
        tokenHash: "t203-h",
        venceEn: new Date(Date.now() + 1e9),
        navegador: "x",
      },
    });
    expect(
      (await c.cambiarClave(admin, { claveActual: ACTUAL, claveNueva: NUEVA }))
        .ok,
    ).toBe(true);
    const { verificarClave } = await import("./clave");
    const u = await bd.usuario.findUniqueOrThrow({ where: { id: ids.admin } });
    expect(await verificarClave(u.claveHash!, NUEVA)).toBe(true);
    expect(
      await bd.dispositivoConfiable.count({ where: { usuarioId: ids.admin } }),
    ).toBe(0);
    expect(
      await bd.auditoria.count({
        where: { usuarioId: ids.admin, accion: "CLAVE_CAMBIADA" },
      }),
    ).toBe(1);
  });
});
