// Flujo completo de una cita (T-505) contra la base de datos local.
// Se omite sin DATABASE_URL (CI).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Sesion } from "../servidor/permisos";
import { crearEscenario } from "../servidor/citas/_escenario";

const ADMIN: Sesion = { usuarioId: "admin-prueba", rol: "ADMIN", activo: true };

describe.skipIf(!process.env.DATABASE_URL)(
  "flujo completo de una cita (T-505)",
  () => {
    let e: Awaited<ReturnType<typeof crearEscenario>>;
    let crearCita: typeof import("../servidor/citas/crear").crearCita;
    let autorizarCita: typeof import("../servidor/citas/admin").autorizarCita;
    let reprogramarCita: typeof import("../servidor/citas/gestion").reprogramarCita;
    let cancelarCita: typeof import("../servidor/citas/gestion").cancelarCita;
    let reiniciar: () => void;

    let n = 0;
    const ip = () => `10.5.0.${++n}`;
    const token = (ruta: string) => ruta.replace("/cita/", "");

    let cupos: Awaited<ReturnType<typeof e.cupos>>;
    let cupoInicial: string;
    let cupoNuevo: string;

    let citaOriginalId: string;
    let tokenGestionOriginal: string;
    let citaNuevaId: string;
    let tokenGestionNuevo: string;

    beforeAll(async () => {
      e = await crearEscenario("flujo", 1);
      ({ crearCita } = await import("../servidor/citas/crear"));
      ({ autorizarCita } = await import("../servidor/citas/admin"));
      ({ cancelarCita, reprogramarCita } =
        await import("../servidor/citas/gestion"));
      reiniciar = (await import("../servidor/limites"))._reiniciarLimites;

      cupos = await e.cupos();
      cupoInicial = cupos[0].inicio;
      cupoNuevo = cupos[1].inicio;
    });

    beforeEach(() => reiniciar());

    afterAll(async () => {
      await e?.limpiar();
      await e?.bd.$disconnect();
    });

    it("(1) una persona pide una cita y queda PENDIENTE con los trabajos de correo solicitud-recibida y nueva-solicitud encolados", async () => {
      const r = await crearCita(
        e.solicitud(cupoInicial, e.correo("persona1")),
        { ip: ip() },
      );
      expect(r).toMatchObject({
        ok: true,
        datos: {
          estado: "PENDIENTE",
          inicio: new Date(cupoInicial).toISOString(),
        },
      });
      if (!r.ok) return;

      expect(r.datos.codigo).toMatch(/^CAPL-[A-Z2-9]{4}$/);
      expect(r.datos.enlaceGestion).toMatch(/^\/cita\/[^.]+\.[\w-]{43}$/);

      const c = await e.bd.cita.findUniqueOrThrow({
        where: { codigo: r.datos.codigo },
      });
      expect(c.estado).toBe("PENDIENTE");
      citaOriginalId = c.id;
      tokenGestionOriginal = token(r.datos.enlaceGestion);

      const trabajos = await e.bd.trabajo.findMany({
        where: { citaId: c.id },
      });
      expect(trabajos.map((t) => t.llave).sort()).toEqual([
        `correo:nueva-solicitud:${c.id}:1`,
        `correo:solicitud-recibida:${c.id}:1`,
      ]);
      expect(
        trabajos.every((t) => t.tipo === "CORREO" && t.estado === "PENDIENTE"),
      ).toBe(true);
    });

    it("(2) administración la autoriza y se encolan cita-autorizada y cita-nueva-psicologo", async () => {
      const r = await autorizarCita(ADMIN, citaOriginalId);
      expect(r).toMatchObject({
        ok: true,
        datos: {
          id: citaOriginalId,
          estado: "AUTORIZADA",
        },
      });

      const c = await e.bd.cita.findUniqueOrThrow({
        where: { id: citaOriginalId },
      });
      expect(c.estado).toBe("AUTORIZADA");

      const trabajos = await e.bd.trabajo.findMany({
        where: { citaId: citaOriginalId },
      });
      expect(trabajos.map((t) => t.llave).sort()).toEqual([
        `correo:cita-autorizada:${citaOriginalId}:1`,
        `correo:cita-nueva-psicologo:${citaOriginalId}:1`,
        `correo:nueva-solicitud:${citaOriginalId}:1`,
        `correo:solicitud-recibida:${citaOriginalId}:1`,
      ]);
      expect(
        trabajos.every((t) => t.tipo === "CORREO" && t.estado === "PENDIENTE"),
      ).toBe(true);
    });

    it("(3) otra persona no puede tomar ese mismo cupo (CUPO_OCUPADO)", async () => {
      const r = await crearCita(
        e.solicitud(cupoInicial, e.correo("persona2")),
        { ip: ip() },
      );
      expect(r).toMatchObject({
        ok: false,
        codigo: "CUPO_OCUPADO",
      });

      const citas = await e.bd.cita.findMany({
        where: {
          servicioId: e.servicio.id,
          inicio: new Date(cupoInicial),
        },
      });
      expect(citas).toHaveLength(1);
      expect(citas[0].id).toBe(citaOriginalId);
      expect(citas[0].estado).toBe("AUTORIZADA");
    });

    it("(4) la persona la reprograma con su enlace y la original deja de ocupar el cupo", async () => {
      const r = await reprogramarCita({
        token: tokenGestionOriginal,
        inicio: cupoNuevo,
      });
      expect(r).toMatchObject({
        ok: true,
        datos: {
          estado: "PENDIENTE",
          inicio: new Date(cupoNuevo).toISOString(),
        },
      });
      if (!r.ok) return;

      const cOriginal = await e.bd.cita.findUniqueOrThrow({
        where: { id: citaOriginalId },
      });
      expect(cOriginal.estado).toBe("CANCELADA");

      // La cita original deja de ocupar el cupo: el horario original vuelve a estar disponible
      const cuposActuales = await e.cupos();
      expect(cuposActuales.some((cp) => cp.inicio === cupoInicial)).toBe(true);

      const cNueva = await e.bd.cita.findUniqueOrThrow({
        where: { codigo: r.datos.codigo },
      });
      expect(cNueva.reprogramadaDeId).toBe(citaOriginalId);
      expect(cNueva.reprogramaciones).toBe(1);
      expect(cNueva.estado).toBe("PENDIENTE");

      citaNuevaId = cNueva.id;
      tokenGestionNuevo = token(r.datos.enlaceGestion);
    });

    it("(5) la persona cancela la nueva y el cupo queda libre (se puede crear otra cita en ese horario)", async () => {
      const r = await cancelarCita(tokenGestionNuevo);
      expect(r).toEqual({
        ok: true,
        datos: { estado: "CANCELADA" },
      });

      const cNueva = await e.bd.cita.findUniqueOrThrow({
        where: { id: citaNuevaId },
      });
      expect(cNueva.estado).toBe("CANCELADA");

      // El cupo de la nueva queda libre
      const cuposTrasCancelar = await e.cupos();
      expect(cuposTrasCancelar.some((cp) => cp.inicio === cupoNuevo)).toBe(
        true,
      );

      // Se puede crear otra cita en ese mismo horario
      const rOtra = await crearCita(
        e.solicitud(cupoNuevo, e.correo("persona3")),
        { ip: ip() },
      );
      expect(rOtra).toMatchObject({
        ok: true,
        datos: {
          estado: "PENDIENTE",
          inicio: new Date(cupoNuevo).toISOString(),
        },
      });
      if (!rOtra.ok) return;

      const cOtra = await e.bd.cita.findUniqueOrThrow({
        where: { codigo: rOtra.datos.codigo },
      });
      expect(cOtra.estado).toBe("PENDIENTE");
      expect(cOtra.inicio.getTime()).toBe(new Date(cupoNuevo).getTime());
    });
  },
);
