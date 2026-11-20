// Contra la BD local; se omite sin DATABASE_URL (CI). Cubre T-306, T-327, T-329 y la lectura del motivo cifrado (T-336).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { CitaLista } from "../../contratos/cita";
import type { Sesion } from "../permisos";
import { crearEscenario } from "./_escenario";
import { citasACsv } from "./admin";

const ADMIN: Sesion = { usuarioId: "admin-prueba", rol: "ADMIN", activo: true };
const PSI: Sesion = { usuarioId: "psi-prueba", rol: "PSICOLOGO", activo: true };

describe("citasACsv (T-327)", () => {
  const fila = (extra: Partial<CitaLista> = {}): CitaLista => ({
    id: "1",
    codigo: "CAPL-AAAA",
    estado: "NO_ASISTIO",
    inicio: "2026-11-25T00:00:00.000Z",
    fin: "2026-11-25T01:00:00.000Z",
    servicio: "Orientación",
    psicologoId: "p",
    psicologoNombre: "Mónica Peña",
    paraQuien: "MENOR",
    solicitanteNombre: "José Ñandú",
    solicitanteCorreo: "jose@mail.com",
    solicitanteTelefono: "+57 300 1",
    pacienteNombre: 'Ana "Anita" Gómez',
    pacienteDocumento: "123",
    venceEn: null,
    creadaEn: "2026-11-20T15:00:00.000Z",
    ...extra,
  });
  it("empieza con BOM UTF-8, conserva tildes, usa Bogotá y CRLF", () => {
    const csv = citasACsv([fila()]);
    expect(csv.startsWith("﻿Código;Estado;Inicio;")).toBe(true);
    expect(Buffer.from(csv).subarray(0, 3)).toEqual(
      Buffer.from([0xef, 0xbb, 0xbf]),
    );
    expect(csv).toContain("Mónica Peña");
    expect(csv).toContain("José Ñandú");
    expect(csv).toContain("2026-11-24 19:00;2026-11-24 20:00"); // medianoche UTC = 7 p. m. del día anterior en Bogotá
    expect(csv).toContain("No asistió");
    expect(csv.split("\r\n")).toHaveLength(3); // encabezado + fila + cierre
  });
  it("escapa comillas y separadores, y neutraliza fórmulas", () => {
    const csv = citasACsv([
      fila({
        pacienteNombre: 'Ana "Anita" Gómez',
        servicio: "a;b",
        solicitanteNombre: "=HYPERLINK(1)",
      }),
    ]);
    expect(csv).toContain('"Ana ""Anita"" Gómez"');
    expect(csv).toContain('"a;b"');
    expect(csv).toContain("'=HYPERLINK(1)");
  });
  it("nunca lleva una columna de motivo de consulta", () => {
    expect(citasACsv([]).toLowerCase()).not.toContain("motivo");
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "administración de citas (T-306, T-327, T-329)",
  () => {
    let e: Awaited<ReturnType<typeof crearEscenario>>;
    let a: typeof import("./admin");
    let crearCita: typeof import("./crear").crearCita;
    let reiniciar: () => void;
    let cupos: Awaited<ReturnType<typeof e.cupos>>;
    let n = 0;
    const ip = () => `10.3.0.${++n}`;
    const cupo = (i: number) => cupos[i].inicio;
    async function pedir(
      i: number,
      extra: Record<string, unknown> = {},
      correo = e.correo(`a${++n}`),
    ) {
      const r = await crearCita(e.solicitud(cupo(i), correo, extra), {
        ip: ip(),
      });
      if (!r.ok) throw new Error(r.codigo);
      return e.bd.cita.findUniqueOrThrow({ where: { codigo: r.datos.codigo } });
    }
    const estado = async (id: string) =>
      (await e.bd.cita.findUniqueOrThrow({ where: { id } })).estado;

    beforeAll(async () => {
      e = await crearEscenario("adm", 2);
      a = await import("./admin");
      ({ crearCita } = await import("./crear"));
      reiniciar = (await import("../limites"))._reiniciarLimites;
      cupos = await e.cupos();
    });
    beforeEach(() => reiniciar());
    afterAll(async () => {
      await e?.limpiar();
      await e?.bd.$disconnect();
    });

    it("toda operación exige sesión de administrador", async () => {
      const c = await pedir(0);
      const ops = [
        (s: Sesion | null) => a.listarCitas(s, {}),
        (s: Sesion | null) => a.verCitaAdmin(s, c.id),
        (s: Sesion | null) => a.autorizarCita(s, c.id),
        (s: Sesion | null) => a.rechazarCita(s, { id: c.id, motivo: "xxx" }),
        (s: Sesion | null) =>
          a.cancelarCitaAdmin(s, { id: c.id, motivo: "xxx" }),
        (s: Sesion | null) =>
          a.marcarAsistencia(s, { id: c.id, resultado: "ATENDIDA" }),
        (s: Sesion | null) =>
          a.reasignarCita(s, { id: c.id, psicologoId: "x", inicio: cupo(1) }),
        (s: Sesion | null) => a.exportarCitas(s, {}),
      ];
      for (const op of ops) {
        expect(await op(null)).toMatchObject({
          ok: false,
          codigo: "NO_AUTENTICADO",
        });
        expect(await op(PSI)).toMatchObject({
          ok: false,
          codigo: "SIN_PERMISO",
        });
        expect(await op({ ...ADMIN, activo: false })).toMatchObject({
          ok: false,
          codigo: "NO_AUTENTICADO",
        });
      }
      expect(await estado(c.id)).toBe("PENDIENTE");
    });

    it("listarCitas: filtros por estado, psicólogo, texto y fechas; 25 por página con total", async () => {
      const motivoSecreto = "ansiedad antes de exámenes";
      const c1 = await pedir(
        2,
        { psicologoId: e.psicologos[0].id, motivo: motivoSecreto },
        e.correo("busca-yo"),
      );
      const c2 = await pedir(4, { psicologoId: e.psicologos[1].id });
      await a.rechazarCita(ADMIN, { id: c2.id, motivo: "No hay cupo" });
      const base = { servicioId: e.servicio.id };

      const todas = await a.listarCitas(ADMIN, base);
      expect(todas).toMatchObject({
        ok: true,
        datos: { pagina: 1, porPagina: 25 },
      });
      if (!todas.ok) return;
      expect(todas.datos.total).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(todas.datos)).not.toContain(motivoSecreto); // la bandeja nunca trae el motivo
      const ids = async (f: object) => {
        const r = await a.listarCitas(ADMIN, { ...base, ...f });
        return r.ok ? r.datos.citas.map((c) => c.id) : [];
      };
      expect(await ids({ estado: "RECHAZADA" })).toEqual([c2.id]);
      expect(await ids({ psicologoId: e.psicologos[0].id })).toContain(c1.id);
      expect(await ids({ psicologoId: e.psicologos[0].id })).not.toContain(
        c2.id,
      );
      expect(await ids({ busqueda: "BUSCA-YO" })).toEqual([c1.id]); // correo, sin distinguir mayúsculas
      expect(await ids({ busqueda: c2.codigo.toLowerCase() })).toEqual([c2.id]);
      expect(await ids({ busqueda: c1.pacienteDocumento! })).toEqual([c1.id]);
      expect(
        await ids({
          desde: c1.inicio.toISOString(),
          hasta: c1.inicio.toISOString(),
        }),
      ).toEqual([c1.id]);
      expect(await ids({ busqueda: "no-existe-nadie" })).toEqual([]);
      expect(await a.listarCitas(ADMIN, { pagina: 0 })).toMatchObject({
        ok: false,
        codigo: "VALIDACION",
      });

      // Paginación: 27 citas más (insertadas directo) → 2 páginas de 25 + resto
      const filas = Array.from({ length: 27 }, (_, i) => ({
        codigo: `T306-${n}-${i}`,
        servicioId: e.servicio.id,
        psicologoId: e.psicologos[0].id,
        inicio: new Date(Date.UTC(2041, 0, 1, i)),
        fin: new Date(Date.UTC(2041, 0, 1, i, 30)),
        estado: "CANCELADA" as const,
        paraQuien: "PROPIA" as const,
        consentimientoEn: new Date(),
        consentimientoVersion: "1",
      }));
      await e.bd.cita.createMany({ data: filas });
      const p1 = await a.listarCitas(ADMIN, {
        ...base,
        estado: "CANCELADA",
        pagina: 1,
      });
      const p2 = await a.listarCitas(ADMIN, {
        ...base,
        estado: "CANCELADA",
        pagina: 2,
      });
      const fuera = await a.listarCitas(ADMIN, {
        ...base,
        estado: "CANCELADA",
        pagina: 100,
      });
      expect(p1.ok && p1.datos.citas).toHaveLength(25);
      expect(p2.ok && p2.datos.citas).toHaveLength(2);
      expect(p1.ok && p1.datos.total).toBe(27);
      expect(fuera).toEqual(p2);
      if (p1.ok && p2.ok) {
        expect(
          new Set([...p1.datos.citas, ...p2.datos.citas].map(({ id }) => id))
            .size,
        ).toBe(27);
      }
    });

    it("verCitaAdmin: muestra el motivo descifrado, el historial y los correos; NO_ENCONTRADO si no existe", async () => {
      const c = await pedir(6, { motivo: "Duelo reciente" });
      await a.autorizarCita(ADMIN, c.id);
      const r = await a.verCitaAdmin(ADMIN, c.id);
      expect(r).toMatchObject({
        ok: true,
        datos: {
          servicioId: e.servicio.id,
          motivo: "Duelo reciente",
          estado: "AUTORIZADA",
          pacienteDocumento: c.pacienteDocumento,
        },
      });
      if (!r.ok) return;
      expect(r.datos.historial.map((h) => h.accion)).toEqual([
        "CITA_CREADA",
        "CITA_AUTORIZADA",
      ]);
      expect(r.datos.historial[1].usuarioId).toBe(ADMIN.usuarioId);
      expect(r.datos.correos.map((x) => x.llave).sort()).toEqual(
        [
          `correo:cita-autorizada:${c.id}:1`,
          `correo:cita-nueva-psicologo:${c.id}:1`,
          `correo:nueva-solicitud:${c.id}:1`,
          `correo:solicitud-recibida:${c.id}:1`,
        ].sort(),
      );
      expect(await a.verCitaAdmin(ADMIN, "no-existe")).toMatchObject({
        ok: false,
        codigo: "NO_ENCONTRADO",
      });
    });

    it("autorizar → atendida/inasistencia; rechazar y cancelar exigen motivo; las inválidas se rechazan", async () => {
      const c = await pedir(8);
      expect(
        await a.rechazarCita(ADMIN, { id: c.id, motivo: "" }),
      ).toMatchObject({ ok: false, codigo: "VALIDACION" });
      expect(await a.cancelarCitaAdmin(ADMIN, { id: c.id })).toMatchObject({
        ok: false,
        codigo: "VALIDACION",
      });
      expect(
        await a.marcarAsistencia(ADMIN, { id: c.id, resultado: "ATENDIDA" }),
      ).toMatchObject({ ok: false, codigo: "TRANSICION_INVALIDA" }); // sigue pendiente
      expect(await a.autorizarCita(ADMIN, c.id)).toMatchObject({
        ok: true,
        datos: { estado: "AUTORIZADA" },
      });
      expect(await a.autorizarCita(ADMIN, c.id)).toMatchObject({
        ok: false,
        codigo: "TRANSICION_INVALIDA",
      });
      expect(
        await a.marcarAsistencia(ADMIN, { id: c.id, resultado: "ATENDIDA" }),
      ).toMatchObject({ ok: false, codigo: "TRANSICION_INVALIDA" }); // aún no ocurre
      // «ahora» posterior a la cita: ya se puede marcar
      const luego = new Date(c.fin.getTime() + 60_000);
      expect(
        await a.marcarAsistencia(
          ADMIN,
          { id: c.id, resultado: "NO_ASISTIO" },
          luego,
        ),
      ).toMatchObject({ ok: true, datos: { estado: "NO_ASISTIO" } });
      expect(await a.autorizarCita(ADMIN, "no-existe")).toMatchObject({
        ok: false,
        codigo: "NO_ENCONTRADO",
      });

      const d = await pedir(10);
      expect(
        await a.rechazarCita(ADMIN, {
          id: d.id,
          motivo: "Fuera de nuestro alcance",
        }),
      ).toMatchObject({ ok: true, datos: { estado: "RECHAZADA" } });
      expect(
        (await e.bd.cita.findUniqueOrThrow({ where: { id: d.id } }))
          .motivoRechazo,
      ).toBe("Fuera de nuestro alcance");
      const f = await pedir(12);
      expect(
        await a.cancelarCitaAdmin(ADMIN, {
          id: f.id,
          motivo: "Cierre del centro",
        }),
      ).toMatchObject({ ok: true, datos: { estado: "CANCELADA" } });
      expect((await e.cupos()).some((x) => x.inicio === cupo(12))).toBe(true); // liberó el cupo
    });

    it("reasignarCita: cambia psicólogo y horario; CUPO_OCUPADO si se cruza; valida el psicólogo y el estado", async () => {
      const [p0, p1] = e.psicologos;
      const c = await pedir(14, { psicologoId: p0.id });
      const ocupada = await pedir(16, { psicologoId: p1.id });
      // a otro psicólogo, mismo horario
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: p1.id,
          inicio: c.inicio.toISOString(),
        }),
      ).toMatchObject({ ok: true, datos: { psicologoId: p1.id } });
      // al horario que ya ocupa otra cita de ese psicólogo
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: p1.id,
          inicio: ocupada.inicio.toISOString(),
        }),
      ).toMatchObject({ ok: false, codigo: "CUPO_OCUPADO" });
      // cruce parcial (media hora corrida) también cuenta
      const corrido = new Date(
        ocupada.inicio.getTime() + 30 * 60_000,
      ).toISOString();
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: p1.id,
          inicio: corrido,
        }),
      ).toMatchObject({ ok: false, codigo: "CUPO_OCUPADO" });
      const sigue = await e.bd.cita.findUniqueOrThrow({ where: { id: c.id } });
      expect(sigue.psicologoId).toBe(p1.id);
      expect(sigue.inicio.getTime()).toBe(c.inicio.getTime()); // el intento fallido no cambió nada
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: "otro",
          inicio: cupo(18),
        }),
      ).toMatchObject({ ok: false, codigo: "VALIDACION" });
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: p0.id,
          inicio: "2020-01-01T10:00:00-05:00",
        }),
      ).toMatchObject({ ok: false, codigo: "FUERA_DE_RANGO" });
      await a.cancelarCitaAdmin(ADMIN, { id: c.id, motivo: "ya no" });
      expect(
        await a.reasignarCita(ADMIN, {
          id: c.id,
          psicologoId: p0.id,
          inicio: cupo(18),
        }),
      ).toMatchObject({ ok: false, codigo: "TRANSICION_INVALIDA" });
      expect(
        await e.bd.auditoria.count({
          where: { entidadId: c.id, accion: "CITA_REASIGNADA" },
        }),
      ).toBe(1);
    });

    it("exportarCitas: CSV con BOM y tildes, con los filtros de la bandeja, sin el motivo", async () => {
      const c = await pedir(20, { motivo: "Algo muy personal" });
      const r = await a.exportarCitas(ADMIN, {
        servicioId: e.servicio.id,
        busqueda: c.codigo,
      });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.datos.charCodeAt(0)).toBe(0xfeff);
      expect(r.datos).toContain("Psicóloga");
      expect(r.datos).toContain(c.codigo);
      expect(r.datos).not.toContain("personal");
      expect(r.datos.trimEnd().split("\r\n")).toHaveLength(2);
      expect(
        await e.bd.auditoria.count({
          where: { accion: "CITAS_EXPORTADAS", usuarioId: ADMIN.usuarioId },
        }),
      ).toBeGreaterThan(0);
    });
  },
);
