// Contra la BD local; se omite sin DATABASE_URL (CI).
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)("enlaces de acceso (T-202)", () => {
  let bd: typeof import("../bd").bd;
  let e: typeof import("./enlaces");
  let uid: string;
  const ahora = new Date();
  const mas = (h: number) => new Date(ahora.getTime() + h * 3_600_000);

  beforeAll(async () => {
    process.env.AUTH_SECRET ||= "x".repeat(40);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("../bd"));
    e = await import("./enlaces");
    uid = (
      await bd.usuario.create({
        data: {
          correo: "t202-a@ejemplo.test",
          nombre: "Ana",
          rol: "PSICOLOGO",
        },
      })
    ).id;
  });
  afterAll(async () => {
    await bd.tokenAcceso.deleteMany({
      where: { usuario: { correo: { startsWith: "t202-" } } },
    });
    await bd.usuario.deleteMany({ where: { correo: { startsWith: "t202-" } } });
    await bd.$disconnect();
  });

  it("vigente: valida y se puede abrir las veces que sea (no se consume al validar); en la BD solo el hash", async () => {
    const g = await e.generarEnlace(uid, "INVITACION", ahora);
    expect(g.token.length).toBeGreaterThanOrEqual(43); // 32 bytes en base64url
    const fila = await bd.tokenAcceso.findUniqueOrThrow({
      where: { id: g.id },
    });
    expect(fila.tokenHash).toBe(e.hashToken(g.token));
    expect(fila.tokenHash).not.toContain(g.token);
    for (let i = 0; i < 3; i++)
      expect(await e.validarEnlace(g.token, mas(1))).toMatchObject({
        ok: true,
        datos: { usuarioId: uid, nombre: "Ana", tipo: "INVITACION" },
      });
  });
  it("vencido: ENLACE_VENCIDO tras la vigencia configurada", async () => {
    const g = await e.generarEnlace(uid, "RECUPERACION", ahora);
    const horas = await e.duracionEnlaceHoras();
    expect((await e.validarEnlace(g.token, mas(horas - 1))).ok).toBe(true);
    expect(await e.validarEnlace(g.token, mas(horas + 1))).toMatchObject({
      ok: false,
      codigo: "ENLACE_VENCIDO",
    });
  });
  it("usado: se consume una vez; el segundo intento y la validación fallan", async () => {
    const g = await e.generarEnlace(uid, "INVITACION", ahora);
    expect(await e.consumirEnlace(g.id, mas(1))).toBe(true);
    expect(await e.consumirEnlace(g.id, mas(1))).toBe(false);
    expect(await e.validarEnlace(g.token, mas(1))).toMatchObject({
      ok: false,
      codigo: "ENLACE_INVALIDO",
    });
  });
  it("reemitido: el nuevo invalida el anterior del mismo tipo, pero no el de otro tipo", async () => {
    const otro = await e.generarEnlace(uid, "RECUPERACION", ahora);
    const viejo = await e.generarEnlace(uid, "INVITACION", ahora);
    const nuevo = await e.generarEnlace(uid, "INVITACION", ahora);
    expect(await e.validarEnlace(viejo.token, mas(1))).toMatchObject({
      ok: false,
      codigo: "ENLACE_INVALIDO",
    });
    expect((await e.validarEnlace(nuevo.token, mas(1))).ok).toBe(true);
    expect((await e.validarEnlace(otro.token, mas(1))).ok).toBe(true);
  });
  it("token desconocido, vacío o de usuario inactivo → ENLACE_INVALIDO", async () => {
    for (const t of ["nada", "", undefined, 5])
      expect(await e.validarEnlace(t)).toMatchObject({
        ok: false,
        codigo: "ENLACE_INVALIDO",
      });
    const g = await e.generarEnlace(uid, "INVITACION", ahora);
    await bd.usuario.update({ where: { id: uid }, data: { activo: false } });
    expect(await e.validarEnlace(g.token, mas(1))).toMatchObject({
      ok: false,
      codigo: "ENLACE_INVALIDO",
    });
    await bd.usuario.update({ where: { id: uid }, data: { activo: true } });
  });
});
