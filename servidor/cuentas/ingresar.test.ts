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

const CLAVE = "clave-de-prueba-larga";
const correo = (n: string) => `t201-${n}@ejemplo.test`;

describe.skipIf(!process.env.DATABASE_URL)("ingresar (T-201)", () => {
  let bd: typeof import("../bd").bd;
  let ingresar: typeof import("./ingresar").ingresar;
  let leer: typeof import("./sesion").leer;
  let limites: typeof import("../limites");

  beforeAll(async () => {
    process.env.AUTH_SECRET ||= "x".repeat(40);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("../bd"));
    ({ ingresar } = await import("./ingresar"));
    ({ leer } = await import("./sesion"));
    limites = await import("../limites");
    const { hashClave } = await import("./clave");
    const claveHash = await hashClave(CLAVE);
    await bd.usuario.createMany({
      data: [
        { correo: correo("psi"), nombre: "Psi", rol: "PSICOLOGO", claveHash },
        { correo: correo("admin"), nombre: "Admin", rol: "ADMIN", claveHash },
        {
          correo: correo("inactivo"),
          nombre: "Inactivo",
          rol: "PSICOLOGO",
          claveHash,
          activo: false,
        },
        { correo: correo("sinclave"), nombre: "Sin clave", rol: "PSICOLOGO" },
      ],
    });
  });
  beforeEach(() => limites._reiniciarLimites());
  afterAll(async () => {
    await bd.usuario.deleteMany({ where: { correo: { startsWith: "t201-" } } });
    await bd.$disconnect();
  });

  it("psicólogo con la clave correcta: sesión de 8 h con su id y rol", async () => {
    const r = await ingresar(
      { correo: ` ${correo("psi").toUpperCase()} `, clave: CLAVE },
      "1.1.1.1",
    );
    if (!r.ok) throw new Error(r.codigo);
    expect(r.datos).toMatchObject({ rol: "PSICOLOGO", maxAgeS: 8 * 3600 });
    expect(leer(r.datos.token)).toMatchObject({
      u: r.datos.usuarioId,
      r: "PSICOLOGO",
    });
    expect(
      (await bd.usuario.findUniqueOrThrow({ where: { id: r.datos.usuarioId } }))
        .ultimoIngreso,
    ).not.toBeNull();
  });
  it("todo fallo da el MISMO mensaje: clave mala, correo inexistente, inactivo, sin clave", async () => {
    const casos = [
      { correo: correo("psi"), clave: "mala" },
      { correo: correo("nadie"), clave: CLAVE },
      { correo: correo("inactivo"), clave: CLAVE },
      { correo: correo("sinclave"), clave: CLAVE },
      { correo: "no-es-correo", clave: CLAVE },
    ];
    const rs = [];
    for (const c of casos) rs.push(await ingresar(c, "2.2.2.2"));
    for (const r of rs)
      expect(r).toMatchObject({
        ok: false,
        codigo: "CREDENCIALES",
        mensaje: "Correo o contraseña incorrectos",
      });
  });
  it("5 fallos por correo y red → bloqueo (aunque luego acierte); otra red no se afecta; acierto limpia el contador", async () => {
    for (let i = 0; i < 5; i++)
      await ingresar({ correo: correo("psi"), clave: "mala" }, "3.3.3.3");
    expect(
      await ingresar({ correo: correo("psi"), clave: CLAVE }, "3.3.3.3"),
    ).toMatchObject({ ok: false, codigo: "DEMASIADOS_INTENTOS" });
    expect(
      (await ingresar({ correo: correo("psi"), clave: CLAVE }, "4.4.4.4")).ok,
    ).toBe(true);
    for (let i = 0; i < 4; i++)
      await ingresar({ correo: correo("psi"), clave: "mala" }, "5.5.5.5");
    expect(
      (await ingresar({ correo: correo("psi"), clave: CLAVE }, "5.5.5.5")).ok,
    ).toBe(true); // 4 fallos + acierto
    for (let i = 0; i < 4; i++)
      await ingresar({ correo: correo("psi"), clave: "mala" }, "5.5.5.5");
    expect(
      (await ingresar({ correo: correo("psi"), clave: CLAVE }, "5.5.5.5")).ok,
    ).toBe(true); // contador reiniciado
  });
  it("administrador con la clave correcta NO abre sesión: pide el segundo paso (T-217)", async () => {
    expect(
      await ingresar({ correo: correo("admin"), clave: CLAVE }, "6.6.6.6"),
    ).toMatchObject({ ok: false, codigo: "CODIGO_REQUERIDO" });
  });
});
