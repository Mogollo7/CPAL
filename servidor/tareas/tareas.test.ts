// Contra la BD local; se omite sin DATABASE_URL. Datos propios con prefijo "t321" que se borran al final.
// `procesarCola` se simula: la cola real es compartida con otras pruebas y aquí no se debe tocar.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

try {
  process.loadEnvFile();
} catch {}

vi.mock("../cola", async (original) => ({
  ...(await original<typeof import("../cola")>()),
  procesarCola: vi.fn(async () => ({
    rescatados: 0,
    hechos: 0,
    reintentos: 0,
    fallidos: 0,
  })),
}));

describe.skipIf(!process.env.DATABASE_URL)(
  "tarea programada (T-321, T-322, T-323, T-328)",
  () => {
    let bd: typeof import("../bd").bd;
    let pasos: typeof import("./pasos");
    let tareas: typeof import("./index");
    let psi: string;
    let serv: string;
    const ids: string[] = [];
    const hora = 3_600_000;
    const ahora = new Date();
    let n = 0;

    const crearCita = async (d: {
      inicio: Date;
      estado: "PENDIENTE" | "AUTORIZADA";
      venceEn?: Date;
    }) => {
      const c = await bd.cita.create({
        data: {
          codigo: `T321-${++n}${Date.now() % 100000}`,
          servicioId: serv,
          psicologoId: psi,
          inicio: d.inicio,
          fin: new Date(d.inicio.getTime() + hora),
          estado: d.estado,
          venceEn: d.venceEn,
          paraQuien: "PROPIA",
          solicitanteNombre: "Ana",
          solicitanteCorreo: "t321-ana@ejemplo.test",
          pacienteNombre: "Ana",
          pacienteDocumento: "1020304050",
          pacienteEdad: 23,
          motivo: "motivo",
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
        },
      });
      ids.push(c.id);
      return c;
    };
    const trabajosDe = (id: string) =>
      bd.trabajo.findMany({ where: { citaId: id } });

    beforeAll(async () => {
      vi.spyOn(process.stdout, "write").mockImplementation(() => true);
      ({ bd } = await import("../bd"));
      pasos = await import("./pasos");
      tareas = await import("./index");
      psi = (
        await bd.usuario.create({
          data: {
            correo: "t321-psi@ejemplo.test",
            nombre: "Psi",
            rol: "PSICOLOGO",
          },
        })
      ).id;
      serv = (
        await bd.servicio.create({
          data: {
            slug: "t321-serv",
            nombre: "S",
            descripcion: "x",
            area: "PSICOLOGIA",
          },
        })
      ).id;
    });
    afterAll(async () => {
      await bd.trabajo.deleteMany({ where: { citaId: { in: ids } } });
      await bd.auditoria.deleteMany({ where: { entidadId: { in: ids } } });
      await bd.cita.deleteMany({ where: { id: { in: ids } } });
      await bd.servicio.deleteMany({ where: { id: serv } });
      await bd.usuario.deleteMany({ where: { id: psi } });
      await bd.$disconnect();
    });

    it("vencimiento: la PENDIENTE vencida pasa a VENCIDA, queda el correo y el cupo se libera; repetirlo no duplica", async () => {
      const inicio = new Date(ahora.getTime() + 90 * 24 * hora);
      const vieja = await crearCita({
        inicio,
        estado: "PENDIENTE",
        venceEn: new Date(ahora.getTime() - 1000),
      });
      const futura = await crearCita({
        inicio: new Date(inicio.getTime() + 24 * hora),
        estado: "PENDIENTE",
        venceEn: new Date(ahora.getTime() + hora),
      });
      await pasos.vencerSolicitudes(ahora);
      await pasos.vencerSolicitudes(ahora);

      expect(
        (await bd.cita.findUniqueOrThrow({ where: { id: vieja.id } })).estado,
      ).toBe("VENCIDA");
      expect(
        (await bd.cita.findUniqueOrThrow({ where: { id: futura.id } })).estado,
      ).toBe("PENDIENTE");
      const t = await trabajosDe(vieja.id);
      expect(t).toHaveLength(1);
      expect(t[0].llave).toBe(`correo:cita-vencida:${vieja.id}:1`);
      expect(
        await bd.auditoria.count({
          where: { entidadId: vieja.id, accion: "CITA_VENCIDA" },
        }),
      ).toBe(1);
      // El cupo quedó libre: otra solicitud puede ocupar el mismo horario.
      await expect(
        crearCita({
          inicio,
          estado: "PENDIENTE",
          venceEn: new Date(ahora.getTime() + hora),
        }),
      ).resolves.toBeTruthy();
    });

    it("recordatorio: una sola vez, solo AUTORIZADA entre 23 y 25 h", async () => {
      const dentro = await crearCita({
        inicio: new Date(ahora.getTime() + 24 * hora),
        estado: "AUTORIZADA",
      });
      const lejos = await crearCita({
        inicio: new Date(ahora.getTime() + 40 * hora),
        estado: "AUTORIZADA",
      });
      const [a, b] = [
        await pasos.enviarRecordatorios(ahora),
        await pasos.enviarRecordatorios(ahora),
      ];
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBe(0);
      expect(await trabajosDe(dentro.id)).toHaveLength(1);
      expect(
        (await bd.cita.findUniqueOrThrow({ where: { id: dentro.id } }))
          .recordatorioEn,
      ).not.toBeNull();
      expect(await trabajosDe(lejos.id)).toHaveLength(0);
    });

    it("anonimización: pasado el plazo se vacían los datos personales; quedan fecha, estado, psicólogo y servicio", async () => {
      const meses = (m: number) =>
        new Date(ahora.getTime() - m * 31 * 24 * hora);
      const vieja = await crearCita({
        inicio: meses(13),
        estado: "AUTORIZADA",
      });
      const reciente = await crearCita({
        inicio: meses(11),
        estado: "AUTORIZADA",
      });
      await pasos.anonimizarCitas(ahora);
      await pasos.anonimizarCitas(ahora); // idempotente
      const v = await bd.cita.findUniqueOrThrow({ where: { id: vieja.id } });
      expect(v).toMatchObject({
        solicitanteNombre: null,
        solicitanteCorreo: null,
        pacienteDocumento: null,
        pacienteEdad: null,
        motivo: null,
        estado: "AUTORIZADA",
        psicologoId: psi,
        servicioId: serv,
      });
      expect(v.anonimizadaEn).not.toBeNull();
      const r = await bd.cita.findUniqueOrThrow({ where: { id: reciente.id } });
      expect(r.solicitanteCorreo).toBe("t321-ana@ejemplo.test");
      expect(r.anonimizadaEn).toBeNull();
      // Adelantando la fecha 3 meses, la reciente también entra en el plazo.
      await pasos.anonimizarCitas(
        new Date(ahora.getTime() + 3 * 31 * 24 * hora),
      );
      expect(
        (await bd.cita.findUniqueOrThrow({ where: { id: reciente.id } }))
          .solicitanteCorreo,
      ).toBeNull();
    });

    it("limpieza: borra tokens vencidos hace más de 7 días y trabajos hechos hace más de 30", async () => {
      const t = await bd.tokenAcceso.create({
        data: {
          usuarioId: psi,
          tipo: "RECUPERACION",
          tokenHash: "t321-hash",
          venceEn: new Date(ahora.getTime() - 8 * 24 * hora),
        },
      });
      const j = await bd.trabajo.create({
        data: {
          tipo: "CORREO",
          llave: "t321-viejo",
          datos: {},
          estado: "HECHO",
          hechoEn: new Date(ahora.getTime() - 31 * 24 * hora),
        },
      });
      const r = await pasos.limpiar(ahora);
      expect(r.tokens).toBeGreaterThanOrEqual(1);
      expect(r.trabajos).toBeGreaterThanOrEqual(1);
      expect(
        await bd.tokenAcceso.findUnique({ where: { id: t.id } }),
      ).toBeNull();
      expect(await bd.trabajo.findUnique({ where: { id: j.id } })).toBeNull();
    });

    it("dos vueltas no se pisan: con el candado tomado, la otra se omite; sin él, corre y da latido", async () => {
      const omitida = await bd.$transaction(async (tx) => {
        const [{ ok }] = await tx.$queryRaw<
          { ok: boolean }[]
        >`SELECT pg_try_advisory_xact_lock(727401) AS ok`;
        expect(ok).toBe(true);
        return tareas.ejecutarTareas({ ahora });
      });
      expect(omitida).toBeNull();
      const r = await tareas.ejecutarTareas({ ahora });
      expect(r).not.toBeNull();
      expect(r!.pendientes).toBeGreaterThanOrEqual(0);
      expect(await tareas.ejecutarTareas({ ahora })).not.toBeNull(); // el candado se soltó
    });
  },
);
