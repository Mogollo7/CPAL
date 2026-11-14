// Contra la BD local; se omite sin DATABASE_URL (CI). Usa trabajos propios (llave con "t008") y los borra al final.
// Nota: `procesarCola` toma cualquier trabajo vencido, así que estas pruebas se ejecutan sobre una BD local sin cola real.
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

describe.skipIf(!process.env.DATABASE_URL)("cola de trabajos (T-008)", () => {
  let bd: typeof import("./bd").bd;
  let cola: typeof import("./cola");
  const ahora = () => new Date(Date.now() + 5000); // un poco adelante del reloj de la BD
  const correo = {
    para: "x@ejemplo.test",
    asunto: "a",
    html: "<p>a</p>",
    texto: "a",
  };
  const ok = async () => ({ ok: true as const });
  const temporal = async () => ({
    ok: false as const,
    permanente: false,
    error: "TEMPORAL",
  });
  const nuevo = (n: string) =>
    cola.encolarCorreo({ plantilla: "t", entidad: `t008-${n}`, correo });
  const estado = (n: string) =>
    bd.trabajo.findFirstOrThrow({
      where: { llave: cola.llaveCorreo("t", `t008-${n}`) },
    });

  beforeAll(async () => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    ({ bd } = await import("./bd"));
    cola = await import("./cola");
  });
  beforeEach(() =>
    bd.trabajo.deleteMany({ where: { llave: { contains: "t008" } } }),
  );
  afterAll(async () => {
    await bd.trabajo.deleteMany({ where: { llave: { contains: "t008" } } });
    await bd.$disconnect();
  });

  it("encolar es idempotente: la misma llave no crea dos trabajos", async () => {
    expect(await nuevo("a")).toEqual({ creado: true });
    expect(await nuevo("a")).toEqual({ creado: false });
    expect(
      await bd.trabajo.count({ where: { llave: { contains: "t008-a" } } }),
    ).toBe(1);
  });

  it("encolar dentro de una transacción que falla no deja correo huérfano", async () => {
    await expect(
      bd.$transaction(async (tx) => {
        await cola.encolarCorreo(
          { plantilla: "t", entidad: "t008-tx", correo },
          tx,
        );
        throw new Error("falla el hecho principal");
      }),
    ).rejects.toThrow();
    expect(
      await bd.trabajo.count({ where: { llave: { contains: "t008-tx" } } }),
    ).toBe(0);
  });

  it("éxito → HECHO y los datos (con el destinatario) se vacían", async () => {
    await nuevo("ok");
    const r = await cola.procesarCola({
      ahora: ahora(),
      ejecutores: { CORREO: ok },
    });
    expect(r.hechos).toBe(1);
    expect(await estado("ok")).toMatchObject({
      estado: "HECHO",
      datos: {},
      intentos: 0,
      ultimoError: null,
    });
  });

  it("fallo temporal → PENDIENTE con espera creciente; agotadas las 5 esperas → FALLIDO", async () => {
    await nuevo("r");
    let t = ahora().getTime();
    for (const [i, espera] of cola.ESPERAS_MS.entries()) {
      await cola.procesarCola({
        ahora: new Date(t),
        ejecutores: { CORREO: temporal },
      });
      const f = await estado("r");
      expect(f).toMatchObject({
        estado: "PENDIENTE",
        intentos: i + 1,
        ultimoError: "TEMPORAL",
      });
      expect(f.ejecutarDespuesDe.getTime()).toBe(t + espera);
      const antes = await cola.procesarCola({
        ahora: new Date(t + espera - 1000),
        ejecutores: { CORREO: temporal },
      });
      expect(antes).toMatchObject({ hechos: 0, reintentos: 0, fallidos: 0 }); // aún no toca
      t += espera;
    }
    const ultimo = await cola.procesarCola({
      ahora: new Date(t),
      ejecutores: { CORREO: temporal },
    });
    expect(ultimo.fallidos).toBe(1);
    expect(await estado("r")).toMatchObject({ estado: "FALLIDO", intentos: 6 });
    // FALLIDO no se reintenta solo
    expect(
      (
        await cola.procesarCola({
          ahora: new Date(t + 1e9),
          ejecutores: { CORREO: ok },
        })
      ).hechos,
    ).toBe(0);
  });

  it("fallo permanente → FALLIDO de inmediato", async () => {
    await nuevo("p");
    await cola.procesarCola({
      ahora: ahora(),
      ejecutores: {
        CORREO: async () => ({
          ok: false,
          permanente: true,
          error: "DIRECCION_INVALIDA",
        }),
      },
    });
    expect(await estado("p")).toMatchObject({
      estado: "FALLIDO",
      intentos: 1,
      ultimoError: "DIRECCION_INVALIDA",
    });
  });

  it("rescate: un trabajo EN_CURSO hace más de 5 min vuelve a la cola y se ejecuta", async () => {
    await nuevo("c");
    await bd.trabajo.updateMany({
      where: { llave: { contains: "t008-c" } },
      data: { estado: "EN_CURSO", tomadoEn: new Date(Date.now() - 6 * 60_000) },
    });
    const r = await cola.procesarCola({
      ahora: ahora(),
      ejecutores: { CORREO: ok },
    });
    expect(r).toMatchObject({ rescatados: 1, hechos: 1 });
  });

  it("dos procesos a la vez nunca ejecutan el mismo trabajo", async () => {
    for (let i = 0; i < 8; i++) await nuevo(`k${i}`);
    const veces = new Map<string, number>();
    const ejecutor = async (t: { llave: string }) => {
      veces.set(t.llave, (veces.get(t.llave) ?? 0) + 1);
      await new Promise((r) => setTimeout(r, 20));
      return { ok: true as const };
    };
    const a = ahora();
    const [r1, r2] = await Promise.all([
      cola.procesarCola({
        ahora: a,
        lote: 5,
        ejecutores: { CORREO: ejecutor },
      }),
      cola.procesarCola({
        ahora: a,
        lote: 5,
        ejecutores: { CORREO: ejecutor },
      }),
    ]);
    expect(r1.hechos + r2.hechos).toBe(8);
    expect([...veces.values()].every((n) => n === 1)).toBe(true);
    expect(veces.size).toBe(8);
  });

  it("llave de Resend inválida: el correo queda PENDIENTE y se reintentará (no se pierde ni se marca fallido)", async () => {
    const antes = { ...process.env };
    process.env.CORREO_MODO = "resend";
    process.env.ENTORNO = "local";
    process.env.RESEND_API_KEYS = "re_llave_invalida_de_prueba";
    try {
      await nuevo("llave");
      await cola.procesarCola({ ahora: ahora() }); // ejecutor real contra Resend
      const f = await estado("llave");
      expect(f.estado).toBe("PENDIENTE");
      expect(f.intentos).toBe(1);
      expect(f.ultimoError).toBeTruthy();
    } finally {
      process.env = antes;
    }
  });
});
