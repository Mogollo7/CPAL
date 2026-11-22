// Contra la BD local; se omite sin DATABASE_URL (CI).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Sesion } from "../permisos";
import { crearEscenario } from "../citas/_escenario";

describe.skipIf(!process.env.DATABASE_URL)("fichas de pacientes", () => {
  let e: Awaited<ReturnType<typeof crearEscenario>>;
  let m: typeof import("./pacientes");
  let sesionA: Sesion;
  let sesionB: Sesion;
  const DOC = `P${Date.now()}`;

  beforeAll(async () => {
    e = await crearEscenario("pac", 2);
    m = await import("./pacientes");
    const { cifrar } = await import("../citas/cifrado");
    sesionA = { usuarioId: e.psicologos[0].id, rol: "PSICOLOGO", activo: true };
    sesionB = { usuarioId: e.psicologos[1].id, rol: "PSICOLOGO", activo: true };
    const dia = 86_400_000;
    const crear = (
      n: number,
      psi: string,
      estado: "ATENDIDA" | "AUTORIZADA",
      desfase: number,
      motivo?: string,
    ) =>
      e.bd.cita.create({
        data: {
          servicioId: e.servicio.id,
          paraQuien: "PROPIA",
          pacienteNombre: "Ana Prueba",
          pacienteDocumento: DOC,
          pacienteEdad: 30,
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
          codigo: `CAPL-T${n}${Date.now() % 100000}`,
          psicologoId: psi,
          estado,
          inicio: new Date(Date.now() + desfase * dia),
          fin: new Date(Date.now() + desfase * dia + 3_600_000),
          motivo: motivo ? cifrar(motivo) : null,
        },
      });
    await crear(1, e.psicologos[0].id, "ATENDIDA", -5, "ansiedad");
    await crear(2, e.psicologos[0].id, "AUTORIZADA", 3);
    await crear(3, e.psicologos[1].id, "AUTORIZADA", 4); // de otro psicólogo
  });
  afterAll(async () => {
    await e?.limpiar();
    await e?.bd.$disconnect();
  });

  it("exige sesión de psicólogo", async () => {
    const ops = [
      (s: Sesion | null) => m.listarPacientes(s),
      (s: Sesion | null) => m.verPaciente(s, DOC),
    ];
    for (const op of ops) {
      expect(await op(null)).toMatchObject({
        ok: false,
        codigo: "NO_AUTENTICADO",
      });
      expect(await op({ ...sesionA, rol: "ADMIN" })).toMatchObject({
        ok: false,
        codigo: "SIN_PERMISO",
      });
    }
  });

  it("agrupa por documento solo con las citas propias", async () => {
    const r = await m.listarPacientes(sesionA);
    if (!r.ok) throw new Error(r.codigo);
    const p = r.datos.find((x) => x.documento === DOC);
    expect(p).toMatchObject({
      nombre: "Ana Prueba",
      edad: 30,
      citas: 2,
      proximaEstado: "AUTORIZADA",
    });
  });

  it("la ficha descifra el motivo, audita y no ve citas de otros", async () => {
    const r = await m.verPaciente(sesionA, DOC);
    if (!r.ok) throw new Error(r.codigo);
    expect(r.datos.historial).toHaveLength(2);
    expect(r.datos.historial.map((c) => c.motivo)).toContain("ansiedad");
    const n = await e.bd.auditoria.count({
      where: { accion: "PACIENTE_FICHA_VER", usuarioId: sesionA.usuarioId },
    });
    expect(n).toBe(1);
    const b = await m.verPaciente(sesionB, DOC);
    if (!b.ok) throw new Error(b.codigo);
    expect(b.datos.historial).toHaveLength(1);
    expect(b.datos.historial[0].motivo).toBeNull();
    expect(await m.verPaciente(sesionA, "NOEXISTE")).toMatchObject({
      ok: false,
      codigo: "NO_ENCONTRADO",
    });
  });
});
