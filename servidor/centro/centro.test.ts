// Contra la BD local; se omite sin DATABASE_URL (CI). Datos propios ("t308-…"); restaura la configuración al final.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)(
  "configuración, bloqueos del centro y servicios (T-308, T-331)",
  () => {
    let bd: typeof import("../bd").bd;
    let cfg: typeof import("./configuracion");
    let blq: typeof import("./bloqueos");
    let srv: typeof import("./servicios");
    let antes: Awaited<
      ReturnType<typeof import("../bd").bd.configuracion.findUnique>
    >;
    const admin = {
      usuarioId: "t308-admin",
      rol: "ADMIN",
      activo: true,
    } as const;
    const psi = {
      usuarioId: "t308-psi",
      rol: "PSICOLOGO",
      activo: true,
    } as const;
    const slugs: string[] = [];

    beforeAll(async () => {
      ({ bd } = await import("../bd"));
      cfg = await import("./configuracion");
      blq = await import("./bloqueos");
      srv = await import("./servicios");
      antes = await bd.configuracion.findUnique({ where: { id: 1 } });
      if (!antes)
        await bd.configuracion.create({
          data: {
            id: 1,
            correoAdministracion: "capl@t308.test",
            dominiosPermitidos: [],
          },
        });
    });

    afterAll(async () => {
      await bd.auditoria.deleteMany({ where: { usuarioId: admin.usuarioId } });
      await bd.bloqueo.deleteMany({ where: { creadoPorId: admin.usuarioId } });
      await bd.servicio.deleteMany({ where: { slug: { in: slugs } } });
      if (antes)
        await bd.configuracion.update({
          where: { id: 1 },
          data: { conservacionMeses: antes.conservacionMeses },
        });
      else await bd.configuracion.delete({ where: { id: 1 } });
    });

    it("todo exige ADMIN", async () => {
      for (const f of [
        cfg.obtenerConfiguracion,
        cfg.actualizarConfiguracion,
        blq.listarBloqueosCentro,
        blq.crearBloqueoCentro,
        blq.eliminarBloqueoCentro,
        blq.listarFestivos,
        srv.listarServicios,
        srv.guardarServicio,
      ]) {
        expect(await f(null, {})).toMatchObject({ codigo: "NO_AUTENTICADO" });
        expect(await f(psi, {})).toMatchObject({ codigo: "SIN_PERMISO" });
      }
    });

    it("cambiar un valor cambia el comportamiento sin desplegar y queda auditado", async () => {
      // Se usa un valor que casi nadie más lee (esta BD la comparten varias pruebas en paralelo) y se restaura al final.
      const r = await cfg.actualizarConfiguracion(admin, {
        conservacionMeses: 18,
      });
      expect(r).toMatchObject({ ok: true, datos: { conservacionMeses: 18 } });
      // La lectura que usan las demás operaciones ve el valor nuevo de inmediato:
      expect(await cfg.configuracionActual()).toMatchObject({
        conservacionMeses: 18,
      });
      expect(cfg.dominioPermitido("a@t308.test", ["t308.test"])).toBe(true);
      expect(cfg.dominioPermitido("a@gmail.com", ["t308.test"])).toBe(false);
      expect(cfg.dominioPermitido("a@gmail.com", [])).toBe(true);
      const fila = await bd.auditoria.findFirstOrThrow({
        where: { accion: "CONFIG_CAMBIADA", usuarioId: admin.usuarioId },
      });
      expect(fila.detalle).toMatchObject({
        conservacionMeses_antes: expect.any(Number),
        conservacionMeses_despues: 18,
      });

      expect(
        await cfg.actualizarConfiguracion(admin, { maxCitasActivas: 99 }),
      ).toMatchObject({
        codigo: "VALIDACION",
        campos: { maxCitasActivas: expect.any(String) },
      });
      expect(await cfg.actualizarConfiguracion(admin, {})).toMatchObject({
        codigo: "VALIDACION",
      });
    });

    it("bloqueos del centro: crear, listar, quitar; no toca los de un psicólogo", async () => {
      const entrada = {
        desde: new Date(Date.now() + 86_400_000).toISOString(),
        hasta: new Date(Date.now() + 3 * 86_400_000).toISOString(),
        motivo: "Vacaciones",
        psicologoId: "ignorado",
      };
      const r = await blq.crearBloqueoCentro(admin, entrada);
      expect(r).toMatchObject({ ok: true, datos: { psicologoId: null } });
      if (!r.ok) return;
      const l = await blq.listarBloqueosCentro(admin);
      expect(l.ok && l.datos.some((b) => b.id === r.datos.id)).toBe(true);

      expect(await blq.eliminarBloqueoCentro(admin, r.datos.id)).toMatchObject({
        ok: true,
      });
      expect(await blq.eliminarBloqueoCentro(admin, r.datos.id)).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
      expect(
        await bd.auditoria.count({
          where: { accion: "BLOQUEO_CENTRO_ELIMINADO", entidadId: r.datos.id },
        }),
      ).toBe(1);
      expect(
        await blq.crearBloqueoCentro(admin, {
          ...entrada,
          hasta: entrada.desde,
        }),
      ).toMatchObject({ codigo: "VALIDACION" });
    });

    it("festivos del año", async () => {
      const r = await blq.listarFestivos(admin, 2026);
      expect(r.ok && r.datos).toHaveLength(18);
      expect(await blq.listarFestivos(admin, "2026")).toMatchObject({
        codigo: "VALIDACION",
      });
    });

    it("servicios: crea con slug generado, edita, no repite slug", async () => {
      const base = {
        nombre: "Taller de prueba T308",
        descripcion: "Descripción",
        duracionMin: 45,
        area: "PSICOLOGIA" as const,
        agendableEnLinea: true,
        activo: true,
      };
      const r = await srv.guardarServicio(admin, base);
      expect(r).toMatchObject({
        ok: true,
        datos: { slug: "taller-de-prueba-t308", duracionMin: 45 },
      });
      if (!r.ok) return;
      slugs.push(r.datos.slug);
      expect(await srv.guardarServicio(admin, base)).toMatchObject({
        codigo: "VALIDACION",
        campos: { slug: "Ya existe" },
      });
      const e = await srv.guardarServicio(admin, {
        ...base,
        id: r.datos.id,
        activo: false,
        duracionMin: 60,
      });
      expect(e).toMatchObject({
        ok: true,
        datos: { activo: false, duracionMin: 60, slug: r.datos.slug },
      });
      expect(
        await srv.guardarServicio(admin, { ...base, id: "no-existe" }),
      ).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
      const l = await srv.listarServicios(admin);
      expect(l.ok && l.datos.some((s) => s.id === r.datos.id)).toBe(true);
    });
  },
);
