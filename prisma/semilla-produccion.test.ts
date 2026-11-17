import { describe, expect, it } from "vitest";
import { sembrarProduccion, type BdSemilla } from "./semilla-produccion";

// BD falsa en memoria: upsert con `update: {}` no toca lo existente, igual que la real.
function bdFalsa() {
  const config = new Map<unknown, Record<string, unknown>>();
  const servicios = new Map<unknown, Record<string, unknown>>();
  const upsert =
    (m: Map<unknown, Record<string, unknown>>, clave: string) =>
    async ({
      where,
      create,
    }: {
      where: Record<string, unknown>;
      create: Record<string, unknown>;
    }) => {
      if (!m.has(where[clave])) m.set(where[clave], create);
    };
  const bd = {
    configuracion: { upsert: upsert(config, "id") },
    servicio: { upsert: upsert(servicios, "slug") },
  } as unknown as BdSemilla;
  return { bd, config, servicios };
}

describe("semilla de producción", () => {
  it("es idempotente y no pisa cambios hechos en el panel", async () => {
    const { bd, config, servicios } = bdFalsa();
    await sembrarProduccion(bd, {});
    expect(servicios.size).toBe(6);
    expect(config.size).toBe(1);
    config.get(1)!.autoAutorizar = true; // el CAPL lo cambia en el panel
    await sembrarProduccion(bd, {});
    expect(servicios.size).toBe(6);
    expect(config.size).toBe(1);
    expect(config.get(1)!.autoAutorizar).toBe(true);
  });

  it("usa los valores por defecto y lee el entorno", async () => {
    const a = bdFalsa();
    await sembrarProduccion(a.bd, {});
    expect(a.config.get(1)).toMatchObject({
      correoAdministracion: "capl@unilasallista.edu.co",
      dominiosPermitidos: ["unilasallista.edu.co"],
    });
    const b = bdFalsa();
    await sembrarProduccion(b.bd, {
      CORREO_ADMINISTRACION: "Otro@Ejemplo.test",
      DOMINIOS_PERMITIDOS: "a.test, b.test",
    });
    expect(b.config.get(1)).toMatchObject({
      correoAdministracion: "otro@ejemplo.test",
      dominiosPermitidos: ["a.test", "b.test"],
    });
  });

  it("no guarda el campo informativo porConfirmar", async () => {
    const { bd, servicios } = bdFalsa();
    await sembrarProduccion(bd, {});
    for (const s of servicios.values())
      expect(s).not.toHaveProperty("porConfirmar");
  });
});
