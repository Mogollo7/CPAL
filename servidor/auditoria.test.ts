// Contra la BD local; se omite sin DATABASE_URL (CI).
import { afterAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)("auditoría", () => {
  it("guarda el evento y, dentro de una transacción que falla, no deja rastro", async () => {
    const { bd } = await import("./bd");
    const { auditar } = await import("./auditoria");

    await auditar({
      accion: "PRUEBA_T009",
      entidad: "Cita",
      entidadId: "c1",
      detalle: { estado: "AUTORIZADA" },
    });
    const fila = await bd.auditoria.findFirstOrThrow({
      where: { accion: "PRUEBA_T009" },
    });
    expect(fila).toMatchObject({
      usuarioId: null,
      entidad: "Cita",
      detalle: { estado: "AUTORIZADA" },
    });

    await expect(
      bd.$transaction(async (tx) => {
        await auditar(
          { accion: "PRUEBA_T009_TX", entidad: "Cita", entidadId: "c2" },
          tx,
        );
        throw new Error("falla el hecho principal");
      }),
    ).rejects.toThrow();
    expect(
      await bd.auditoria.count({ where: { accion: "PRUEBA_T009_TX" } }),
    ).toBe(0);
  });

  afterAll(async () => {
    const { bd } = await import("./bd");
    await bd.auditoria.deleteMany({
      where: { accion: { startsWith: "PRUEBA_T009" } },
    });
    await bd.$disconnect();
  });
});
