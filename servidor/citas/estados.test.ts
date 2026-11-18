// Parte pura: cada fila de la tabla de E03 §3 y las combinaciones inválidas. Parte BD: efectos (auditoría, correos, concurrencia).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { EstadoCita } from "../../contratos/cita";
import { crearEscenario } from "./_escenario";
import {
  decidir,
  type Actor,
  type CitaParaEstado,
  type EventoCita,
} from "./estados";

const AHORA = new Date("2026-11-20T15:00:00Z");
const h = (horas: number) => new Date(AHORA.getTime() + horas * 3_600_000);
const config = { cancelacionMinHoras: 12, maxReprogramaciones: 2 };
const cita = (
  estado: EstadoCita,
  extra: Partial<CitaParaEstado> = {},
): CitaParaEstado => ({
  id: "c1",
  estado,
  inicio: h(48),
  venceEn: h(10),
  reprogramaciones: 0,
  ...extra,
});
const PERSONA: Actor = { tipo: "PERSONA" };
const ADMIN: Actor = { tipo: "ADMIN", usuarioId: "u1" };
const SISTEMA: Actor = { tipo: "SISTEMA" };
const x = (motivo?: string, ahora = AHORA) => ({ ahora, config, motivo });
const codigo = (r: ReturnType<typeof decidir>) =>
  r.ok ? "OK:" + r.datos.hacia : r.codigo;

describe("tabla de estados (E03 §3)", () => {
  it("PENDIENTE · autorizar · Admin → AUTORIZADA, solo si el inicio es futuro", () => {
    expect(codigo(decidir(cita("PENDIENTE"), "autorizar", ADMIN, x()))).toBe(
      "OK:AUTORIZADA",
    );
    expect(
      codigo(
        decidir(cita("PENDIENTE", { inicio: h(-1) }), "autorizar", ADMIN, x()),
      ),
    ).toBe("TRANSICION_INVALIDA");
  });
  it("PENDIENTE · rechazar · Admin → RECHAZADA, con motivo obligatorio", () => {
    expect(
      codigo(decidir(cita("PENDIENTE"), "rechazar", ADMIN, x("No hay cupo"))),
    ).toBe("OK:RECHAZADA");
    expect(codigo(decidir(cita("PENDIENTE"), "rechazar", ADMIN, x()))).toBe(
      "VALIDACION",
    );
    expect(
      codigo(decidir(cita("PENDIENTE"), "rechazar", ADMIN, x("   "))),
    ).toBe("VALIDACION");
  });
  it("PENDIENTE · vencer · Sistema → VENCIDA, solo cuando ahora ≥ venceEn", () => {
    expect(
      codigo(
        decidir(cita("PENDIENTE", { venceEn: h(0) }), "vencer", SISTEMA, x()),
      ),
    ).toBe("OK:VENCIDA"); // borde: igual
    expect(
      codigo(
        decidir(cita("PENDIENTE", { venceEn: h(-1) }), "vencer", SISTEMA, x()),
      ),
    ).toBe("OK:VENCIDA");
    expect(
      codigo(
        decidir(cita("PENDIENTE", { venceEn: h(1) }), "vencer", SISTEMA, x()),
      ),
    ).toBe("TRANSICION_INVALIDA");
    expect(
      codigo(
        decidir(cita("PENDIENTE", { venceEn: null }), "vencer", SISTEMA, x()),
      ),
    ).toBe("TRANSICION_INVALIDA");
  });
  it("PENDIENTE/AUTORIZADA · cancelar · Persona → CANCELADA hasta inicio − cancelacionMinHoras", () => {
    for (const e of ["PENDIENTE", "AUTORIZADA"] as const) {
      expect(
        codigo(decidir(cita(e, { inicio: h(12) }), "cancelar", PERSONA, x())),
      ).toBe("OK:CANCELADA"); // borde exacto
      expect(
        codigo(decidir(cita(e, { inicio: h(11.9) }), "cancelar", PERSONA, x())),
      ).toBe("FUERA_DE_PLAZO");
    }
  });
  it("PENDIENTE/AUTORIZADA · cancelar · Admin → CANCELADA con inicio futuro y motivo", () => {
    for (const e of ["PENDIENTE", "AUTORIZADA"] as const) {
      expect(
        codigo(
          decidir(
            cita(e, { inicio: h(1) }),
            "cancelar",
            ADMIN,
            x("Cierra el centro"),
          ),
        ),
      ).toBe("OK:CANCELADA");
      expect(codigo(decidir(cita(e), "cancelar", ADMIN, x()))).toBe(
        "VALIDACION",
      );
      expect(
        codigo(
          decidir(cita(e, { inicio: h(-1) }), "cancelar", ADMIN, x("tarde")),
        ),
      ).toBe("TRANSICION_INVALIDA");
    }
  });
  it("PENDIENTE/AUTORIZADA · reprogramar · Persona → CANCELADA: plazo y máximo de reprogramaciones", () => {
    for (const e of ["PENDIENTE", "AUTORIZADA"] as const) {
      expect(
        codigo(
          decidir(
            cita(e, { reprogramaciones: 1 }),
            "reprogramar",
            PERSONA,
            x(),
          ),
        ),
      ).toBe("OK:CANCELADA");
      expect(
        codigo(
          decidir(
            cita(e, { reprogramaciones: 2 }),
            "reprogramar",
            PERSONA,
            x(),
          ),
        ),
      ).toBe("LIMITE_REPROGRAMACIONES");
      expect(
        codigo(
          decidir(cita(e, { inicio: h(11) }), "reprogramar", PERSONA, x()),
        ),
      ).toBe("FUERA_DE_PLAZO");
    }
  });
  it("AUTORIZADA · marcar atendida / inasistencia · Admin, solo con el inicio en el pasado", () => {
    const pasada = cita("AUTORIZADA", { inicio: h(-2) });
    expect(codigo(decidir(pasada, "atendida", ADMIN, x()))).toBe("OK:ATENDIDA");
    expect(codigo(decidir(pasada, "inasistencia", ADMIN, x()))).toBe(
      "OK:NO_ASISTIO",
    );
    expect(codigo(decidir(cita("AUTORIZADA"), "atendida", ADMIN, x()))).toBe(
      "TRANSICION_INVALIDA",
    );
    expect(
      codigo(decidir(cita("AUTORIZADA"), "inasistencia", ADMIN, x())),
    ).toBe("TRANSICION_INVALIDA");
  });

  it("todo lo que no está en la tabla responde TRANSICION_INVALIDA (estado, evento y actor)", () => {
    const eventos: EventoCita[] = [
      "autorizar",
      "rechazar",
      "vencer",
      "cancelar",
      "reprogramar",
      "atendida",
      "inasistencia",
    ];
    const actores = [PERSONA, ADMIN, SISTEMA];
    const estados: EstadoCita[] = [
      "PENDIENTE",
      "AUTORIZADA",
      "RECHAZADA",
      "VENCIDA",
      "CANCELADA",
      "ATENDIDA",
      "NO_ASISTIO",
    ];
    // Combinaciones que SÍ existen en la tabla: estado, evento, actor
    const validas = new Set([
      "PENDIENTE|autorizar|ADMIN",
      "PENDIENTE|rechazar|ADMIN",
      "PENDIENTE|vencer|SISTEMA",
      "PENDIENTE|cancelar|PERSONA",
      "AUTORIZADA|cancelar|PERSONA",
      "PENDIENTE|cancelar|ADMIN",
      "AUTORIZADA|cancelar|ADMIN",
      "PENDIENTE|reprogramar|PERSONA",
      "AUTORIZADA|reprogramar|PERSONA",
      "AUTORIZADA|atendida|ADMIN",
      "AUTORIZADA|inasistencia|ADMIN",
    ]);
    let invalidas = 0;
    for (const es of estados)
      for (const ev of eventos)
        for (const a of actores) {
          if (validas.has(`${es}|${ev}|${a.tipo}`)) continue;
          // Contexto "perfecto" (con motivo, plazo cumplido, fechas coherentes) para que solo falle por la tabla.
          const c = cita(es, { inicio: h(-2), venceEn: h(-1) });
          expect(
            codigo(decidir(c, ev, a, x("motivo"))),
            `${es} ${ev} ${a.tipo}`,
          ).toBe("TRANSICION_INVALIDA");
          invalidas++;
        }
    expect(invalidas).toBe(7 * 7 * 3 - validas.size);
  });
  it("los estados finales no admiten ninguna acción", () => {
    for (const es of [
      "RECHAZADA",
      "VENCIDA",
      "CANCELADA",
      "ATENDIDA",
      "NO_ASISTIO",
    ] as const)
      for (const ev of [
        "autorizar",
        "rechazar",
        "vencer",
        "cancelar",
        "reprogramar",
        "atendida",
        "inasistencia",
      ] as const)
        for (const a of [PERSONA, ADMIN, SISTEMA])
          expect(codigo(decidir(cita(es), ev, a, x("m")))).toBe(
            "TRANSICION_INVALIDA",
          );
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "transicionar con la base de datos (T-304)",
  () => {
    let e: Awaited<ReturnType<typeof crearEscenario>>;
    let transicionar: typeof import("./estados").transicionar;
    let admin: Actor;
    const ctx = (motivo?: string, ahora = new Date()) => ({
      ahora,
      config,
      motivo,
    });
    let n = 0;
    /** Una cita nueva directamente en la BD, en el estado y con el inicio que pida la prueba. */
    async function nueva(estado: EstadoCita, horasHasta: number) {
      // Separadas 2 h entre sí (hacia el futuro o hacia el pasado) para que el cruce no interfiera.
      const inicio = new Date(
        Date.now() +
          horasHasta * 3_600_000 +
          (horasHasta < 0 ? -1 : 1) * ++n * 7_200_000,
      );
      return e.bd.cita.create({
        data: {
          codigo: `T304-${n}-${Math.random().toString(36).slice(2, 6)}`,
          servicioId: e.servicio.id,
          psicologoId: e.psicologos[0].id,
          inicio,
          fin: new Date(inicio.getTime() + 3_600_000),
          estado,
          paraQuien: "PROPIA",
          solicitanteNombre: "Ana Prueba",
          solicitanteCorreo: `t304-${n}@prueba.capl.test`,
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
          venceEn:
            estado === "PENDIENTE" ? new Date(Date.now() + 3_600_000) : null,
        },
      });
    }
    const aplicar = (
      c: Awaited<ReturnType<typeof nueva>>,
      ev: EventoCita,
      a: Actor,
      motivo?: string,
    ) => e.bd.$transaction((tx) => transicionar(tx, c, ev, a, ctx(motivo)));

    beforeAll(async () => {
      e = await crearEscenario("est", 1);
      ({ transicionar } = await import("./estados"));
      admin = {
        tipo: "ADMIN",
        usuarioId:
          (await e.bd.usuario.findFirst({ where: { rol: "ADMIN" } }))?.id ??
          e.psicologos[0].id,
      };
    });
    afterAll(async () => {
      await e?.limpiar();
      await e?.bd.$disconnect();
    });

    it("autorizar: cambia el estado, borra venceEn, audita con el usuario y encola los dos correos", async () => {
      const c = await nueva("PENDIENTE", 72);
      const r = await aplicar(c, "autorizar", admin);
      expect(r).toMatchObject({ ok: true, datos: { estado: "AUTORIZADA" } });
      const f = await e.bd.cita.findUniqueOrThrow({ where: { id: c.id } });
      expect(f).toMatchObject({ estado: "AUTORIZADA", venceEn: null });
      const aud = await e.bd.auditoria.findFirstOrThrow({
        where: { entidad: "Cita", entidadId: c.id, accion: "CITA_AUTORIZADA" },
      });
      expect(aud.detalle).toEqual({
        de: "PENDIENTE",
        a: "AUTORIZADA",
        actor: "ADMIN",
      });
      const llaves = (await e.bd.trabajo.findMany({ where: { citaId: c.id } }))
        .map((t) => t.llave)
        .sort();
      expect(llaves).toEqual([
        `correo:cita-autorizada:${c.id}:1`,
        `correo:cita-nueva-psicologo:${c.id}:1`,
      ]);
    });

    it("rechazar guarda el motivo en la cita (no en la auditoría) y avisa al solicitante", async () => {
      const c = await nueva("PENDIENTE", 72);
      expect(
        (await aplicar(c, "rechazar", admin, "Datos incompletos")).ok,
      ).toBe(true);
      expect(
        (await e.bd.cita.findUniqueOrThrow({ where: { id: c.id } }))
          .motivoRechazo,
      ).toBe("Datos incompletos");
      const aud = await e.bd.auditoria.findFirstOrThrow({
        where: { entidadId: c.id, accion: "CITA_RECHAZADA" },
      });
      expect(JSON.stringify(aud.detalle)).not.toContain("Datos incompletos");
      expect(
        (await e.bd.trabajo.findMany({ where: { citaId: c.id } })).map(
          (t) => t.llave,
        ),
      ).toEqual([`correo:cita-no-autorizada:${c.id}:1`]);
    });

    it("vencer (sistema) y cancelar por la persona encolan el correo que dice E06", async () => {
      const v = await nueva("PENDIENTE", 72);
      const r = await e.bd.$transaction((tx) =>
        transicionar(
          tx,
          { ...v, venceEn: new Date(Date.now() - 1000) },
          "vencer",
          { tipo: "SISTEMA" },
          ctx(),
        ),
      );
      expect(r).toMatchObject({ ok: true, datos: { estado: "VENCIDA" } });
      expect(
        (await e.bd.trabajo.findMany({ where: { citaId: v.id } })).map(
          (t) => t.llave,
        ),
      ).toEqual([`correo:cita-vencida:${v.id}:1`]);

      const p = await nueva("PENDIENTE", 72);
      await aplicar(p, "cancelar", { tipo: "PERSONA" });
      const t = await e.bd.trabajo.findMany({ where: { citaId: p.id } });
      expect(t.map((x) => x.llave)).toEqual([
        `correo:cita-cancelada:${p.id}:1`,
      ]);
      expect(t[0].datos).toMatchObject({ canceladaPor: "persona" });
      // Autorizada: además avisa al psicólogo
      const a = await nueva("AUTORIZADA", 72);
      await aplicar(a, "cancelar", admin, "Se enfermó la psicóloga");
      const ta = await e.bd.trabajo.findMany({ where: { citaId: a.id } });
      expect(ta.map((x) => x.llave).sort()).toEqual([
        `correo:cita-cancelada-psicologo:${a.id}:1`,
        `correo:cita-cancelada:${a.id}:1`,
      ]);
      expect(ta[0].datos).toMatchObject({ canceladaPor: "capl" });
    });

    it("marcar atendida / inasistencia audita y no manda correos", async () => {
      const c = await nueva("AUTORIZADA", -5);
      expect((await aplicar(c, "atendida", admin)).ok).toBe(true);
      expect(
        (await e.bd.cita.findUniqueOrThrow({ where: { id: c.id } })).estado,
      ).toBe("ATENDIDA");
      const d = await nueva("AUTORIZADA", -6);
      expect((await aplicar(d, "inasistencia", admin)).ok).toBe(true);
      expect(
        await e.bd.auditoria.count({
          where: { entidadId: d.id, accion: "CITA_NO_ASISTIO" },
        }),
      ).toBe(1);
      expect(
        await e.bd.trabajo.count({ where: { citaId: { in: [c.id, d.id] } } }),
      ).toBe(0);
    });

    it("una transición inválida no escribe nada", async () => {
      const c = await nueva("CANCELADA", 72);
      expect(await aplicar(c, "autorizar", admin)).toMatchObject({
        ok: false,
        codigo: "TRANSICION_INVALIDA",
      });
      expect(await e.bd.auditoria.count({ where: { entidadId: c.id } })).toBe(
        0,
      );
      expect(await e.bd.trabajo.count({ where: { citaId: c.id } })).toBe(0);
    });

    it("dos administradores a la vez: gana el primero y el segundo recibe TRANSICION_INVALIDA", async () => {
      const c = await nueva("PENDIENTE", 72);
      const rs = await Promise.all([
        aplicar(c, "autorizar", admin),
        aplicar(c, "rechazar", admin, "otro criterio"),
      ]);
      expect(rs.filter((r) => r.ok)).toHaveLength(1);
      expect(rs.find((r) => !r.ok)).toMatchObject({
        codigo: "TRANSICION_INVALIDA",
      });
      expect(
        await e.bd.auditoria.count({
          where: {
            entidadId: c.id,
            accion: { in: ["CITA_AUTORIZADA", "CITA_RECHAZADA"] },
          },
        }),
      ).toBe(1);
    });
  },
);
