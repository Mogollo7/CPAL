// Contra la BD local; se omite sin DATABASE_URL (CI). Usa datos propios (correos "t205-…") y los borra al final.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)(
  "operaciones de psicólogos (T-205)",
  () => {
    let bd: typeof import("../bd").bd;
    let ops: typeof import("./psicologos");
    let cfg: typeof import("../centro/configuracion");
    let admin: { usuarioId: string; rol: "ADMIN"; activo: true };
    let psi: { usuarioId: string; rol: "PSICOLOGO"; activo: true };
    let servicioId: string;
    let configAntes: Awaited<
      ReturnType<typeof import("../bd").bd.configuracion.findUnique>
    >;
    const creados: string[] = [];
    const DOM = "t205.test";
    const nuevo = (n: string) => ({
      nombre: "Prueba Uno",
      correo: `t205-${n}@${DOM}`,
      area: "PSICOLOGIA" as const,
    });

    beforeAll(async () => {
      ({ bd } = await import("../bd"));
      ops = await import("./psicologos");
      cfg = await import("../centro/configuracion");
      configAntes = await bd.configuracion.findUnique({ where: { id: 1 } });
      if (!configAntes)
        await bd.configuracion.create({
          data: {
            id: 1,
            dominiosPermitidos: [DOM],
            correoAdministracion: "capl@t205.test",
          },
        });
      else
        await bd.configuracion.update({
          where: { id: 1 },
          data: { dominiosPermitidos: [DOM] },
        });
      const a = await bd.usuario.create({
        data: {
          correo: `t205-admin@${DOM}`,
          nombre: "Admin T205",
          rol: "ADMIN",
          claveHash: "x",
        },
      });
      const p = await bd.usuario.create({
        data: {
          correo: `t205-psi@${DOM}`,
          nombre: "Psi T205",
          rol: "PSICOLOGO",
          claveHash: "x",
          perfil: { create: { area: "PSICOLOGIA" } },
        },
      });
      servicioId = (
        await bd.servicio.create({
          data: {
            slug: `t205-${Date.now()}`,
            nombre: "S",
            descripcion: "d",
            area: "PSICOLOGIA",
          },
        })
      ).id;
      admin = { usuarioId: a.id, rol: "ADMIN", activo: true };
      psi = { usuarioId: p.id, rol: "PSICOLOGO", activo: true };
    });

    afterAll(async () => {
      const ids = [admin.usuarioId, psi.usuarioId, ...creados];
      await bd.cita.deleteMany({ where: { psicologoId: { in: ids } } });
      // La llave del correo es por enlace emitido: `correo:invitacion:{tokenId}:1`.
      const enlaces = await bd.tokenAcceso.findMany({
        where: { usuarioId: { in: ids } },
        select: { id: true },
      });
      await bd.trabajo.deleteMany({
        where: {
          llave: { in: enlaces.map((e) => `correo:invitacion:${e.id}:1`) },
        },
      });
      await bd.tokenAcceso.deleteMany({ where: { usuarioId: { in: ids } } });
      await bd.auditoria.deleteMany({
        where: {
          OR: [{ usuarioId: admin.usuarioId }, { entidadId: { in: ids } }],
        },
      });
      await bd.perfilPsicologo.deleteMany({
        where: { usuarioId: { in: ids } },
      });
      await bd.usuario.deleteMany({ where: { id: { in: ids } } });
      await bd.servicio.deleteMany({ where: { id: servicioId } });
      if (configAntes)
        await bd.configuracion.update({
          where: { id: 1 },
          data: { dominiosPermitidos: configAntes.dominiosPermitidos },
        });
      else await bd.configuracion.delete({ where: { id: 1 } });
    });

    it("cada operación exige rol: sin sesión y psicólogo son rechazados", async () => {
      expect(await ops.crearPsicologo(null, nuevo("x"))).toMatchObject({
        ok: false,
        codigo: "NO_AUTENTICADO",
      });
      for (const f of [
        ops.crearPsicologo,
        ops.crearAdministrador,
        ops.actualizarPsicologo,
        ops.cambiarActivo,
        ops.reenviarInvitacion,
        ops.verPsicologo,
      ])
        expect(await f(psi, {})).toMatchObject({
          ok: false,
          codigo: "SIN_PERMISO",
        });
      expect(await ops.listarPsicologos(psi)).toMatchObject({
        codigo: "SIN_PERMISO",
      });
      expect(await ops.listarAdministradores(psi)).toMatchObject({
        codigo: "SIN_PERMISO",
      });
    });

    it("crea un psicólogo invitado: usuario + perfil + token + correo encolado + auditoría", async () => {
      const r = await ops.crearPsicologo(admin, nuevo("ok"));
      expect(r).toMatchObject({
        ok: true,
        datos: { estado: "INVITADO", area: "PSICOLOGIA", rol: "PSICOLOGO" },
      });
      if (!r.ok) return;
      creados.push(r.datos.id);
      expect(
        await bd.tokenAcceso.count({
          where: { usuarioId: r.datos.id, tipo: "INVITACION", usadoEn: null },
        }),
      ).toBe(1);
      const enlace = await bd.tokenAcceso.findFirstOrThrow({
        where: { usuarioId: r.datos.id, usadoEn: null },
      });
      const t = await bd.trabajo.findUnique({
        where: { llave: `correo:invitacion:${enlace.id}:1` },
      });
      expect(t).toMatchObject({ tipo: "CORREO", estado: "PENDIENTE" });
      expect(t!.datos).toMatchObject({
        plantilla: "invitacion",
        tokenId: enlace.id,
      });
      expect(
        await bd.auditoria.count({
          where: {
            accion: "PSICOLOGO_CREADO",
            entidadId: r.datos.id,
            usuarioId: admin.usuarioId,
          },
        }),
      ).toBe(1);
      const lista = await ops.listarPsicologos(admin);
      expect(lista.ok && lista.datos.some((u) => u.id === r.datos.id)).toBe(
        true,
      );
    });

    it("rechaza dominios fuera de la lista y correos repetidos; el cambio de configuración aplica sin desplegar", async () => {
      expect(
        await ops.crearPsicologo(admin, {
          ...nuevo("a"),
          correo: "t205-a@gmail.com",
        }),
      ).toMatchObject({ ok: false, codigo: "CORREO_NO_PERMITIDO" });
      expect(await ops.crearPsicologo(admin, nuevo("ok"))).toMatchObject({
        ok: false,
        codigo: "CORREO_EN_USO",
      });
      expect(
        await ops.crearPsicologo(admin, {
          nombre: "x",
          correo: "no",
          area: "PSICOLOGIA",
        }),
      ).toMatchObject({ ok: false, codigo: "VALIDACION" });
      // Mismo correo, otro dominio permitido tras cambiar la configuración:
      const otro = { ...nuevo("b"), correo: "t205-b@otro.t205.test" };
      expect(await ops.crearPsicologo(admin, otro)).toMatchObject({
        codigo: "CORREO_NO_PERMITIDO",
      });
      expect(
        await cfg.actualizarConfiguracion(admin, {
          dominiosPermitidos: [DOM, "otro.t205.test"],
        }),
      ).toMatchObject({ ok: true });
      const aud = await bd.auditoria.findFirstOrThrow({
        where: { accion: "CONFIG_CAMBIADA", usuarioId: admin.usuarioId },
      });
      expect(JSON.stringify(aud.detalle)).not.toContain("t205"); // sin valores en la auditoría
      const r = await ops.crearPsicologo(admin, otro);
      expect(r.ok).toBe(true);
      if (r.ok) creados.push(r.datos.id);
      await bd.configuracion.update({
        where: { id: 1 },
        data: { dominiosPermitidos: [DOM] },
      });
      expect((await cfg.configuracionActual()).dominiosPermitidos).toEqual([
        DOM,
      ]);
    });

    it("reenviar invitación: el enlace anterior queda inválido; no aplica a quien ya creó su contraseña", async () => {
      const id = creados[0];
      expect(await ops.reenviarInvitacion(admin, id)).toMatchObject({
        ok: true,
      });
      expect(
        await bd.tokenAcceso.count({ where: { usuarioId: id, usadoEn: null } }),
      ).toBe(1);
      expect(await bd.tokenAcceso.count({ where: { usuarioId: id } })).toBe(2);
      const enlaces = await bd.tokenAcceso.findMany({
        where: { usuarioId: id },
      });
      expect(
        await bd.trabajo.count({
          where: {
            llave: { in: enlaces.map((e) => `correo:invitacion:${e.id}:1`) },
          },
        }),
      ).toBe(2);
      expect(await ops.reenviarInvitacion(admin, psi.usuarioId)).toMatchObject({
        codigo: "TRANSICION_INVALIDA",
      });
      expect(await ops.reenviarInvitacion(admin, "no-existe")).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
    });

    it("no desactiva a un psicólogo con citas futuras; sin citas, sí, y se puede reactivar", async () => {
      const ini = new Date(Date.now() + 5 * 86_400_000);
      await bd.cita.create({
        data: {
          codigo: "T205-0001",
          servicioId,
          psicologoId: psi.usuarioId,
          inicio: ini,
          fin: new Date(+ini + 3_600_000),
          paraQuien: "PROPIA",
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
        },
      });
      expect(
        await ops.cambiarActivo(admin, { id: psi.usuarioId, activo: false }),
      ).toMatchObject({
        ok: false,
        codigo: "TIENE_CITAS_FUTURAS",
        campos: { citas: "T205-0001" },
      });
      await bd.cita.updateMany({
        where: { codigo: "T205-0001" },
        data: { estado: "CANCELADA" },
      });
      expect(
        await ops.cambiarActivo(admin, { id: psi.usuarioId, activo: false }),
      ).toMatchObject({ ok: true, datos: { estado: "INACTIVO" } });
      expect(
        await ops.cambiarActivo(admin, { id: psi.usuarioId, activo: true }),
      ).toMatchObject({ ok: true, datos: { estado: "ACTIVO" } });
      expect(
        await bd.auditoria.count({
          where: {
            accion: "USUARIO_DESACTIVADO",
            entidadId: psi.usuarioId,
          },
        }),
      ).toBe(1);
    });

    it("crea administradores y protege al último administrador activo", async () => {
      const r = await ops.crearAdministrador(admin, {
        nombre: "Otra Admin",
        correo: `t205-adm2@${DOM}`,
      });
      expect(r).toMatchObject({
        ok: true,
        datos: { rol: "ADMIN", estado: "INVITADO", area: null },
      });
      if (r.ok) creados.push(r.datos.id);
      // Hay otros administradores en la BD de desarrollo: se desactivan SOLO durante esta comprobación.
      const otros = await bd.usuario.findMany({
        where: {
          rol: "ADMIN",
          activo: true,
          id: { notIn: [admin.usuarioId] },
        },
        select: { id: true },
      });
      await bd.usuario.updateMany({
        where: { id: { in: otros.map((o) => o.id) } },
        data: { activo: false },
      });
      try {
        expect(
          await ops.cambiarActivo(admin, {
            id: admin.usuarioId,
            activo: false,
          }),
        ).toMatchObject({ ok: false, codigo: "TRANSICION_INVALIDA" });
      } finally {
        await bd.usuario.updateMany({
          where: { id: { in: otros.map((o) => o.id) } },
          data: { activo: true },
        });
      }
    });

    it("detalle y edición de nombre y área", async () => {
      const r = await ops.actualizarPsicologo(admin, {
        id: psi.usuarioId,
        nombre: "Psi Editada",
        area: "NEUROPSICOLOGIA",
      });
      expect(r).toMatchObject({
        ok: true,
        datos: { nombre: "Psi Editada", area: "NEUROPSICOLOGIA" },
      });
      expect(await ops.verPsicologo(admin, psi.usuarioId)).toMatchObject({
        ok: true,
        datos: { visible: false, servicioIds: [] },
      });
      expect(await ops.verPsicologo(admin, admin.usuarioId)).toMatchObject({
        codigo: "NO_ENCONTRADO",
      }); // un admin no es psicólogo
    });
  },
);
