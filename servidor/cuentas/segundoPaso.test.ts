// Contra la BD local; se omite sin DATABASE_URL (CI). T-217 (segundo paso), T-218 (último admin) y T-219 (emergencia).
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

// El código sale por Resend al instante: se intercepta ese envío y se lee el código real que se habría mandado.
const enviados: { plantilla: string; codigo?: string }[] = [];
vi.mock("../correo/enviar", async (original) => ({
  ...(await original<typeof import("../correo/enviar")>()),
  enviarYa: vi.fn(async (plantilla: string, p: { codigo?: string }) => {
    enviados.push({ plantilla, codigo: p.codigo });
    return { ok: true };
  }),
}));

const CLAVE = "clave-de-prueba-larga";
const correo = (n: string) => `t217-${n}@ejemplo.test`;

describe.skipIf(!process.env.DATABASE_URL)("acceso de administradores", () => {
  let bd: typeof import("../bd").bd;
  let ingresar: typeof import("./ingresar").ingresar;
  let sp: typeof import("./segundoPaso");
  let limites: typeof import("../limites");
  let admin: { id: string; correo: string };
  let psi: { id: string };

  // El código viaja por correo (cola): para la prueba se pone uno conocido sobre la fila vigente.
  async function fijarCodigo(codigo: string) {
    const { createHmac } = await import("node:crypto");
    const h = createHmac("sha256", process.env.AUTH_SECRET!)
      .update(`${admin.id}:${codigo}`)
      .digest("hex");
    await bd.codigoAcceso.updateMany({
      where: { usuarioId: admin.id, usadoEn: null },
      data: { codigoHash: h },
    });
  }
  const paso = () => sp.firmarPaso(admin.id);
  const jobs = (p: string) =>
    bd.trabajo.count({
      where: { llave: { startsWith: `correo:${p}:${admin.id}` } },
    });

  beforeAll(async () => {
    process.env.AUTH_SECRET ||= "x".repeat(40);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("../bd"));
    ({ ingresar } = await import("./ingresar"));
    sp = await import("./segundoPaso");
    limites = await import("../limites");
    const { hashClave } = await import("./clave");
    const claveHash = await hashClave(CLAVE);
    admin = await bd.usuario.create({
      data: { correo: correo("admin"), nombre: "Ad", rol: "ADMIN", claveHash },
    });
    psi = await bd.usuario.create({
      data: {
        correo: correo("psi"),
        nombre: "Ps",
        rol: "PSICOLOGO",
        claveHash,
      },
    });
  });
  beforeEach(async () => {
    limites._reiniciarLimites();
    await bd.codigoAcceso.deleteMany({ where: { usuarioId: admin.id } });
  });
  afterAll(async () => {
    const ids = [admin.id, psi.id];
    // Las llaves de los correos llevan el id del código o del enlace: se borran por esos ids.
    const propios = (
      await bd.usuario.findMany({ where: { correo: { startsWith: "t217-" } } })
    ).map((u) => u.id);
    const refs = [
      ...ids,
      ...propios,
      ...(
        await bd.codigoAcceso.findMany({ where: { usuarioId: { in: ids } } })
      ).map((c) => c.id),
      ...(
        await bd.tokenAcceso.findMany({ where: { usuarioId: { in: propios } } })
      ).map((x) => x.id),
    ];
    await bd.trabajo.deleteMany({
      where: { OR: refs.map((i) => ({ llave: { contains: i } })) },
    });
    await bd.codigoAcceso.deleteMany({ where: { usuarioId: { in: ids } } });
    await bd.dispositivoConfiable.deleteMany({
      where: { usuarioId: { in: ids } },
    });
    await bd.auditoria.deleteMany({ where: { entidadId: { in: ids } } });
    await bd.tokenAcceso.deleteMany({ where: { usuarioId: { in: ids } } });
    await bd.usuario.deleteMany({ where: { correo: { startsWith: "t217-" } } });
    await bd.$disconnect();
  });

  it("ingresar: admin con clave correcta en dispositivo nuevo → CODIGO_REQUERIDO, código guardado como hash y correo en cola", async () => {
    const r = await ingresar(
      { correo: correo("admin"), clave: CLAVE },
      "7.7.7.1",
    );
    expect(r).toMatchObject({ ok: false, codigo: "CODIGO_REQUERIDO" });
    if (r.ok) return;
    expect(sp.leerPaso(r.campos?.paso)).toBe(admin.id);
    const c = await bd.codigoAcceso.findFirstOrThrow({
      where: { usuarioId: admin.id },
    });
    expect(c.codigoHash).toMatch(/^[0-9a-f]{64}$/);
    expect(c.venceEn.getTime() - c.creadoEn.getTime()).toBeLessThanOrEqual(
      600_000,
    );
    expect(enviados.at(-1)).toMatchObject({
      plantilla: "codigo-ingreso",
      codigo: expect.stringMatching(/^\d{6}$/),
    });
  });
  it("psicólogo no pide código", async () => {
    expect(
      (await ingresar({ correo: correo("psi"), clave: CLAVE }, "7.7.7.2")).ok,
    ).toBe(true);
  });
  it("código correcto: abre sesión de 2 h, un solo uso, avisa del ingreso; sin 'recordar' no deja dispositivo", async () => {
    await ingresar({ correo: correo("admin"), clave: CLAVE }, "7.7.7.3");
    const real = enviados.at(-1)!.codigo!;
    const r = await sp.verificarCodigo(paso(), { codigo: real }, "Firefox");
    if (!r.ok) throw new Error(r.mensaje);
    expect(r.datos).toMatchObject({ rol: "ADMIN", maxAgeS: 2 * 3600 });
    expect(r.datos.dispositivo).toBeUndefined();
    expect(await jobs("aviso-ingreso")).toBeGreaterThanOrEqual(1);
    expect(await sp.verificarCodigo(paso(), { codigo: real })).toMatchObject({
      ok: false,
      codigo: "CODIGO_INVALIDO",
    });
  });
  it("dispositivo de confianza: el nuevo pide código; el recordado no, 30 días; vencido o de otro usuario, sí", async () => {
    await ingresar({ correo: correo("admin"), clave: CLAVE }, "7.7.7.4");
    await fijarCodigo("654321");
    const r = await sp.verificarCodigo(
      paso(),
      { codigo: "654321", recordarDispositivo: true },
      "Chrome",
    );
    if (!r.ok || !r.datos.dispositivo) throw new Error("sin dispositivo");
    const { token, maxAgeS } = r.datos.dispositivo;
    expect(maxAgeS).toBe(30 * 86400);
    const fila = await bd.dispositivoConfiable.findFirstOrThrow({
      where: { usuarioId: admin.id },
    });
    expect(fila.tokenHash).not.toBe(token); // solo el hash
    // con la cookie, ingresa directo y sin enviar otro código
    const antes = enviados.length;
    const directo = await ingresar(
      { correo: correo("admin"), clave: CLAVE },
      "7.7.7.4",
      token,
    );
    expect(directo.ok).toBe(true);
    expect(enviados.length).toBe(antes);
    // otro usuario, token falso o pasados los 30 días: no vale
    expect(await sp.dispositivoConfiable(psi.id, token)).toBe(false);
    expect(await sp.dispositivoConfiable(admin.id, "falso")).toBe(false);
    expect(
      await sp.dispositivoConfiable(
        admin.id,
        token,
        new Date(Date.now() + 31 * 86_400_000),
      ),
    ).toBe(false);
    expect(
      await ingresar(
        { correo: correo("admin"), clave: CLAVE },
        "7.7.7.5",
        "falso",
      ),
    ).toMatchObject({
      codigo: "CODIGO_REQUERIDO",
    });
    await sp.olvidarDispositivos(admin.id);
    expect(await sp.dispositivoConfiable(admin.id, token)).toBe(false);
  });
  it("código malo: 5 intentos y se bloquea (aunque luego acierte); cookie de paso vencida o falsa no sirve", async () => {
    await ingresar({ correo: correo("admin"), clave: CLAVE }, "7.7.7.6");
    await fijarCodigo("111111");
    for (let i = 0; i < 5; i++)
      expect(
        await sp.verificarCodigo(paso(), { codigo: "000000" }),
      ).toMatchObject({
        codigo: "CODIGO_INVALIDO",
      });
    expect(
      await sp.verificarCodigo(paso(), { codigo: "111111" }),
    ).toMatchObject({
      ok: false,
      codigo: "DEMASIADOS_INTENTOS",
    });
    expect(
      await sp.verificarCodigo(undefined, { codigo: "111111" }),
    ).toMatchObject({ codigo: "NO_AUTENTICADO" });
    expect(await sp.verificarCodigo("a.b", { codigo: "111111" })).toMatchObject(
      { codigo: "NO_AUTENTICADO" },
    );
  });
  it("código vencido (10 min) no sirve", async () => {
    await ingresar({ correo: correo("admin"), clave: CLAVE }, "7.7.7.7");
    await fijarCodigo("222222");
    const tarde = new Date(Date.now() + 11 * 60_000);
    expect(
      await sp.verificarCodigo(paso(), { codigo: "222222" }, "x", tarde),
    ).toMatchObject({
      ok: false,
      codigo: "CODIGO_INVALIDO",
    });
  });
  it("reenviar: no antes de 60 s; el código nuevo invalida el anterior; máx. 3 por hora", async () => {
    await ingresar({ correo: correo("admin"), clave: CLAVE }, "7.7.7.8");
    expect(await sp.reenviarCodigo(paso())).toMatchObject({
      ok: false,
      codigo: "DEMASIADOS_INTENTOS",
    });
    let t = Date.now();
    for (let i = 0; i < 3; i++) {
      t += 61_000;
      expect((await sp.reenviarCodigo(paso(), new Date(t))).ok).toBe(true);
    }
    t += 61_000;
    expect(await sp.reenviarCodigo(paso(), new Date(t))).toMatchObject({
      ok: false,
      codigo: "DEMASIADOS_INTENTOS",
    });
    expect(
      await bd.codigoAcceso.count({
        where: { usuarioId: admin.id, usadoEn: null },
      }),
    ).toBe(1);
  });

  it("último administrador (T-218): no se puede quitar al único activo; con otro sí", async () => {
    const { exigirOtroAdminActivo } = await import("../permisos");
    const Revertir = new Error("revertir");
    await expect(
      bd.$transaction(async (tx) => {
        await tx.usuario.updateMany({
          where: { rol: "ADMIN", id: { not: admin.id } },
          data: { activo: false },
        });
        expect(await exigirOtroAdminActivo(admin.id, tx)).toMatchObject({
          ok: false,
          codigo: "TRANSICION_INVALIDA",
        });
        const otro = await tx.usuario.create({
          data: { correo: correo("otro"), nombre: "O", rol: "ADMIN" },
        });
        expect(await exigirOtroAdminActivo(admin.id, tx)).toMatchObject({
          ok: true,
        });
        await tx.usuario.update({
          where: { id: otro.id },
          data: { activo: false },
        });
        expect(await exigirOtroAdminActivo(admin.id, tx)).toMatchObject({
          ok: false,
        });
        throw Revertir; // la transacción se deshace: no toca a los demás administradores de la BD
      }),
    ).rejects.toBe(Revertir);
  });

  it("admin:crear (T-219): crea el administrador, deja auditoría de Operación, envía el enlace y avisa a los demás", async () => {
    const { crearAdminEmergencia } = await import("./adminEmergencia");
    // Si la BD tiene dominios permitidos (semilla), el correo de prueba debe usar uno.
    const dominio =
      (await bd.configuracion.findUnique({ where: { id: 1 } }))
        ?.dominiosPermitidos[0] ?? "ejemplo.test";
    const nuevoCorreo = `t217-nuevo@${dominio}`;
    const r = await crearAdminEmergencia({
      correo: nuevoCorreo,
      nombre: "Nuevo Admin",
    });
    if (!r.ok) throw new Error(r.mensaje);
    const u = await bd.usuario.findUniqueOrThrow({
      where: { id: r.datos.usuarioId },
    });
    expect(u).toMatchObject({ rol: "ADMIN", activo: true, claveHash: null });
    const a = await bd.auditoria.findFirstOrThrow({
      where: { entidadId: u.id },
    });
    expect(a).toMatchObject({
      accion: "ADMIN_ACCESO_EMERGENCIA",
      usuarioId: null,
    });
    expect(JSON.stringify(a.detalle)).not.toContain("@"); // sin datos personales
    const tk = await bd.tokenAcceso.findFirstOrThrow({
      where: { usuarioId: u.id },
    });
    expect(
      await bd.trabajo.count({
        where: { llave: { startsWith: `correo:invitacion:${tk.id}` } },
      }),
    ).toBe(1);
    expect(
      await bd.trabajo.count({
        where: {
          llave: { startsWith: `correo:aviso-acceso-emergencia:${admin.id}` },
        },
      }),
    ).toBe(1);
    expect(
      await bd.tokenAcceso.count({
        where: { usuarioId: u.id, tipo: "INVITACION" },
      }),
    ).toBe(1);
    // correo de un psicólogo o mal escrito: rechazado
    await bd.usuario.create({
      data: { correo: `t217-psi2@${dominio}`, nombre: "P2", rol: "PSICOLOGO" },
    });
    expect(
      await crearAdminEmergencia({
        correo: `t217-psi2@${dominio}`,
        nombre: "X Y",
      }),
    ).toMatchObject({ codigo: "CORREO_EN_USO" });
    expect(
      await crearAdminEmergencia({ correo: "no", nombre: "" }),
    ).toMatchObject({ codigo: "VALIDACION" });
    const todos = await bd.tokenAcceso.findMany({ where: { usuarioId: u.id } });
    await bd.trabajo.deleteMany({
      where: { OR: todos.map((x) => ({ llave: { contains: x.id } })) },
    });
    await bd.auditoria.deleteMany({ where: { entidadId: u.id } });
    await bd.tokenAcceso.deleteMany({ where: { usuarioId: u.id } });
  });
});
