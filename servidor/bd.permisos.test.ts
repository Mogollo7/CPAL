// T-016 (S03): la aplicación usa capl_app, que lee y escribe datos pero NO puede alterar el esquema.
// Contra la BD local; se omite sin DATABASE_URL (CI).
import { afterAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)(
  "usuario de base de datos de la aplicación",
  () => {
    it("puede leer y escribir datos", async () => {
      const { bd } = await import("./bd");
      expect(await bd.servicio.count()).toBeGreaterThan(0);
      const fila = await bd.auditoria.create({
        data: { accion: "PRUEBA_T016", entidad: "x", entidadId: "1" },
      });
      await bd.auditoria.delete({ where: { id: fila.id } });
    });
    it("no puede crear, alterar ni borrar tablas", async () => {
      const { bd } = await import("./bd");
      await expect(
        bd.$executeRawUnsafe(`CREATE TABLE intruso (id int)`),
      ).rejects.toThrow();
      await expect(
        bd.$executeRawUnsafe(`ALTER TABLE "Cita" ADD COLUMN intruso int`),
      ).rejects.toThrow();
      await expect(bd.$executeRawUnsafe(`DROP TABLE "Cita"`)).rejects.toThrow();
    });
    afterAll(async () => {
      const { bd } = await import("./bd");
      await bd.$disconnect();
    });
  },
);
