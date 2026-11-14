// Prueba contra la BD local (se omite si no hay DATABASE_URL, p. ej. en CI). Requiere `npm run bd:reiniciar`.
import { afterAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)("restricciones SQL", () => {
  it("dos citas activas cruzadas del mismo psicólogo: la segunda falla; si la primera se cancela, entra", async () => {
    const { bd } = await import("./bd");
    const psi = await bd.usuario.findFirstOrThrow({
      where: { rol: "PSICOLOGO", activo: true },
    });
    const servicio = await bd.servicio.findFirstOrThrow();
    const base = {
      servicioId: servicio.id,
      psicologoId: psi.id,
      paraQuien: "PROPIA" as const,
      consentimientoEn: new Date(),
      consentimientoVersion: "1",
    };
    const t = (h: number) => new Date(Date.UTC(2031, 0, 6, h)); // lejos de la semilla
    const crear = (codigo: string, ini: number, fin: number) =>
      bd.cita.create({
        data: { ...base, codigo, inicio: t(ini), fin: t(fin) },
      });

    const a = await crear("TEST-A", 15, 16);
    await expect(crear("TEST-B", 15, 16)).rejects.toThrow(); // mismo horario
    await expect(crear("TEST-C", 15, 17)).rejects.toThrow(); // cruce parcial (otra duración)
    await crear("TEST-D", 16, 17); // contiguo: permitido [inicio, fin)
    await bd.cita.update({
      where: { id: a.id },
      data: { estado: "CANCELADA" },
    });
    await crear("TEST-E", 15, 16); // el cupo liberado vuelve a estar disponible
  });

  afterAll(async () => {
    const { bd } = await import("./bd");
    await bd.cita.deleteMany({ where: { codigo: { startsWith: "TEST-" } } });
    await bd.$disconnect();
  });
});
