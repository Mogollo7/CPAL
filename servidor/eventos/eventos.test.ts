// Contra la BD local; se omite sin DATABASE_URL (CI). Datos propios (título "T402 …") y los borra al final.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)(
  "cartelera de eventos (T-402)",
  () => {
    let bd: typeof import("../bd").bd;
    let ev: typeof import("./eventos");
    const admin = {
      usuarioId: "t402-admin",
      rol: "ADMIN",
      activo: true,
    } as const;
    const psi = {
      usuarioId: "t402-psi",
      rol: "PSICOLOGO",
      activo: true,
    } as const;
    const dia = 86_400_000;
    const evento = (titulo: string, desdeHoy: number, extra = {}) => ({
      titulo,
      tipo: "TALLER",
      descripcion: "Descripción",
      inicio: new Date(Date.now() + desdeHoy * dia).toISOString(),
      lugar: "Bloque 3",
      publicado: true,
      ...extra,
    });

    beforeAll(async () => {
      ({ bd } = await import("../bd"));
      ev = await import("./eventos");
    });
    afterAll(async () => {
      await bd.evento.deleteMany({
        where: { titulo: { startsWith: "T402 " } },
      });
      await bd.auditoria.deleteMany({ where: { usuarioId: admin.usuarioId } });
    });

    it("crear, editar y listar exigen ADMIN", async () => {
      expect(await ev.crearEvento(null, {})).toMatchObject({
        codigo: "NO_AUTENTICADO",
      });
      expect(await ev.crearEvento(psi, {})).toMatchObject({
        codigo: "SIN_PERMISO",
      });
      expect(await ev.editarEvento(psi, "x", {})).toMatchObject({
        codigo: "SIN_PERMISO",
      });
      expect(await ev.listarEventos(psi)).toMatchObject({
        codigo: "SIN_PERMISO",
      });
    });

    it("crea con slug único, valida y audita", async () => {
      const a = await ev.crearEvento(admin, evento("T402 Taller ñandú", 5));
      expect(a).toMatchObject({
        ok: true,
        datos: { slug: "t402-taller-nandu", publicado: true },
      });
      const b = await ev.crearEvento(admin, evento("T402 Taller ñandú", 6));
      expect(b).toMatchObject({
        ok: true,
        datos: { slug: "t402-taller-nandu-2" },
      });
      expect(
        await ev.crearEvento(
          admin,
          evento("T402 Malo", 5, { fin: new Date(Date.now()).toISOString() }),
        ),
      ).toMatchObject({
        codigo: "VALIDACION",
        campos: { fin: expect.any(String) },
      });
      if (a.ok)
        expect(
          await bd.auditoria.count({
            where: { accion: "EVENTO_CREADO", entidadId: a.datos.id },
          }),
        ).toBe(1);
    });

    it("la cartelera pública solo muestra publicados que no han terminado, el más próximo primero", async () => {
      const crear = async (t: string, d: number, extra = {}) => {
        const r = await ev.crearEvento(admin, evento(t, d, extra));
        if (!r.ok) throw new Error("no creó");
        return r.datos;
      };
      const futuro = await crear("T402 Futuro", 2);
      const cercano = await crear("T402 Cercano", 1);
      const borrador = await crear("T402 Borrador", 3, { publicado: false });
      const pasado = await crear("T402 Pasado", -2);
      // Empezó ayer pero termina mañana: sigue vigente.
      const enCurso = await crear("T402 En curso", -1, {
        fin: new Date(Date.now() + dia).toISOString(),
      });

      const r = await ev.listarEventosPublicos();
      if (!r.ok) throw new Error("falló");
      const ids = r.datos.map((e) => e.id);
      expect(ids).toContain(futuro.id);
      expect(ids).toContain(enCurso.id);
      expect(ids).not.toContain(borrador.id);
      expect(ids).not.toContain(pasado.id);
      expect(ids.indexOf(cercano.id)).toBeLessThan(ids.indexOf(futuro.id));

      expect(await ev.verEventoPublico(futuro.slug)).toMatchObject({
        ok: true,
      });
      expect(await ev.verEventoPublico(borrador.slug)).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
      expect(await ev.verEventoPublico(pasado.slug)).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
      // El panel sí ve todos:
      const todos = await ev.listarEventos(admin);
      expect(todos.ok && todos.datos.some((e) => e.id === pasado.id)).toBe(
        true,
      );
    });

    it("editar despublica y deja auditoría; el slug se conserva", async () => {
      const c = await ev.crearEvento(admin, evento("T402 Editable", 4));
      if (!c.ok) throw new Error("no creó");
      const e = await ev.editarEvento(admin, c.datos.id, {
        ...evento("T402 Editable renombrado", 4),
        publicado: false,
      });
      expect(e).toMatchObject({
        ok: true,
        datos: {
          publicado: false,
          slug: c.datos.slug,
          titulo: "T402 Editable renombrado",
        },
      });
      expect(
        await bd.auditoria.count({
          where: { accion: "EVENTO_DESPUBLICADO", entidadId: c.datos.id },
        }),
      ).toBe(1);
      expect(
        await ev.editarEvento(admin, "no-existe", evento("T402 X", 1)),
      ).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
    });
  },
);
