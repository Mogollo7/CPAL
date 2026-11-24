// Contra la BD local; se omite sin DATABASE_URL (CI). Cubre T-305 (enlace, ver, cancelar) y T-325 (reprogramar).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { crearEscenario } from "./_escenario";

describe.skipIf(!process.env.DATABASE_URL)(
  "gestión desde el enlace (T-305, T-325)",
  () => {
    let e: Awaited<ReturnType<typeof crearEscenario>>;
    let g: typeof import("./gestion");
    let enlace: typeof import("./enlace");
    let crearCita: typeof import("./crear").crearCita;
    let reiniciar: () => void;
    let cupos: Awaited<ReturnType<typeof e.cupos>>;
    let n = 0;
    const ip = () => `10.2.0.${++n}`;
    const cupo = (i: number) => cupos[i].inicio;
    const token = (ruta: string) => ruta.replace("/cita/", "");

    /** Crea una cita real por el camino normal y devuelve su token y su fila. */
    async function pedir(i: number, psicologoId?: string) {
      const r = await crearCita(
        e.solicitud(cupo(i), e.correo(`p${++n}`), { psicologoId }),
        { ip: ip() },
      );
      if (!r.ok) throw new Error("no se pudo crear: " + r.codigo);
      const fila = await e.bd.cita.findUniqueOrThrow({
        where: { codigo: r.datos.codigo },
      });
      return { token: token(r.datos.enlaceGestion), fila };
    }
    const estado = async (id: string) =>
      (await e.bd.cita.findUniqueOrThrow({ where: { id } })).estado;

    beforeAll(async () => {
      e = await crearEscenario("ges", 2);
      g = await import("./gestion");
      enlace = await import("./enlace");
      ({ crearCita } = await import("./crear"));
      reiniciar = (await import("../limites"))._reiniciarLimites;
      cupos = await e.cupos();
    });
    beforeEach(() => reiniciar());
    afterAll(async () => {
      await e?.limpiar();
      await e?.bd.$disconnect();
    });

    it("verCita devuelve solo lo necesario para reconocerla; nunca documento, teléfono ni motivo", async () => {
      const { token: t, fila } = await pedir(0);
      const r = await g.verCita(t);
      expect(r).toMatchObject({
        ok: true,
        datos: {
          codigo: fila.codigo,
          estado: "PENDIENTE",
          puedeCancelar: true,
          puedeReprogramar: true,
        },
      });
      if (!r.ok) return;
      expect(Object.keys(r.datos).sort()).toEqual([
        "codigo",
        "estado",
        "fin",
        "inicio",
        "lugar",
        "psicologoNombre",
        "puedeCancelar",
        "puedeReprogramar",
        "servicio",
        "servicioId",
      ]);
      expect(JSON.stringify(r.datos)).not.toContain(fila.pacienteDocumento!);
    });

    it("firma alterada, id ajeno o cita inexistente → ENLACE_INVALIDO", async () => {
      const { token: t, fila } = await pedir(2);
      const [id, firma] = t.split(".");
      const alterada = `${id}.${firma.slice(0, -1)}${firma.endsWith("A") ? "B" : "A"}`;
      for (const mala of [
        alterada,
        `${id}x.${firma}`,
        "basura",
        "",
        enlace.tokenDeCita("no-existe"),
      ]) {
        expect(await g.verCita(mala), mala).toMatchObject({
          ok: false,
          codigo: "ENLACE_INVALIDO",
        });
        expect(await g.cancelarCita(mala), mala).toMatchObject({
          ok: false,
          codigo: "ENLACE_INVALIDO",
        });
      }
      expect(await estado(fila.id)).toBe("PENDIENTE"); // ninguna de las malas la tocó
    });

    it("pasado el plazo (12 h antes) ya no ofrece acciones y cancelar responde FUERA_DE_PLAZO", async () => {
      const { token: t, fila } = await pedir(4);
      const tarde = new Date(fila.inicio.getTime() - 11 * 3_600_000);
      expect(await g.verCita(t, { ahora: tarde })).toMatchObject({
        ok: true,
        datos: { puedeCancelar: false, puedeReprogramar: false },
      });
      expect(await g.cancelarCita(t, { ahora: tarde })).toMatchObject({
        ok: false,
        codigo: "FUERA_DE_PLAZO",
      });
      expect(await estado(fila.id)).toBe("PENDIENTE");
    });

    it("cancelarCita: cancela, libera el cupo y encola el correo; repetir da TRANSICION_INVALIDA", async () => {
      const { token: t, fila } = await pedir(6);
      expect(await g.cancelarCita(t)).toEqual({
        ok: true,
        datos: { estado: "CANCELADA" },
      });
      expect(await estado(fila.id)).toBe("CANCELADA");
      expect(await g.cancelarCita(t)).toMatchObject({
        ok: false,
        codigo: "TRANSICION_INVALIDA",
      });
      expect(await g.verCita(t)).toMatchObject({
        ok: true,
        datos: {
          estado: "CANCELADA",
          puedeCancelar: false,
          puedeReprogramar: false,
        },
      });
      expect(
        await e.bd.trabajo.count({
          where: {
            citaId: fila.id,
            llave: { startsWith: "correo:cita-cancelada:" },
          },
        }),
      ).toBe(1);
      expect((await e.cupos()).some((c) => c.inicio === cupo(6))).toBe(true); // el horario volvió a estar libre
    });

    it("reprogramarCita: crea la nueva (enlazada), cancela la anterior y libera su cupo, todo junto", async () => {
      const { token: t, fila } = await pedir(8, e.psicologos[0].id);
      const r = await g.reprogramarCita({
        token: t,
        inicio: cupo(10),
        psicologoId: e.psicologos[0].id,
      });
      expect(r).toMatchObject({
        ok: true,
        datos: {
          estado: "PENDIENTE",
          inicio: new Date(cupo(10)).toISOString(),
        },
      });
      if (!r.ok) return;
      const nueva = await e.bd.cita.findUniqueOrThrow({
        where: { codigo: r.datos.codigo },
      });
      expect(nueva).toMatchObject({
        reprogramadaDeId: fila.id,
        reprogramaciones: 1,
        solicitanteCorreo: fila.solicitanteCorreo,
        pacienteDocumento: fila.pacienteDocumento,
      });
      expect(await estado(fila.id)).toBe("CANCELADA");
      // el enlace viejo ya no ofrece acciones; el nuevo sí
      expect(await g.verCita(t)).toMatchObject({
        ok: true,
        datos: { estado: "CANCELADA", puedeCancelar: false },
      });
      expect(await g.verCita(token(r.datos.enlaceGestion))).toMatchObject({
        ok: true,
        datos: { estado: "PENDIENTE", puedeCancelar: true },
      });
      // correos: la nueva avisa del cambio de horario; la anterior NO manda «cancelada» (no se cancela, se cambia)
      expect(nueva.reprogramadaDeId).toBe(fila.id); // el correo «cambio de horario» se decide por este enlace
      expect(
        await e.bd.trabajo.count({
          where: {
            citaId: fila.id,
            llave: { startsWith: "correo:cita-cancelada" },
          },
        }),
      ).toBe(0);
      expect(
        (await e.cupos(e.psicologos[0].id)).some((c) => c.inicio === cupo(8)),
      ).toBe(true);
    });

    it("si el cupo nuevo está ocupado: CUPO_OCUPADO y la cita original no cambia", async () => {
      const { token: t, fila } = await pedir(12, e.psicologos[0].id);
      const otra = await pedir(14, e.psicologos[0].id); // alguien ya tiene el cupo 14 con ese psicólogo
      expect(
        await g.reprogramarCita({
          token: t,
          inicio: cupo(14),
          psicologoId: e.psicologos[0].id,
        }),
      ).toMatchObject({ ok: false, codigo: "CUPO_OCUPADO" });
      expect(await estado(fila.id)).toBe("PENDIENTE");
      expect(
        await e.bd.cita.count({ where: { reprogramadaDeId: fila.id } }),
      ).toBe(0);
      expect(await estado(otra.fila.id)).toBe("PENDIENTE");
      // un horario que no es cupo → FUERA_DE_RANGO, tampoco cambia nada
      const raro = new Date(Date.parse(cupo(16)) + 20 * 60_000).toISOString();
      expect(await g.reprogramarCita({ token: t, inicio: raro })).toMatchObject(
        { ok: false, codigo: "FUERA_DE_RANGO" },
      );
      expect(await estado(fila.id)).toBe("PENDIENTE");
    });

    it("dos personas reprograman al mismo cupo a la vez: una entra y la otra queda intacta con su cita original", async () => {
      const psi = e.psicologos[1].id;
      const a = await pedir(18, psi);
      const b = await pedir(20, psi);
      const rs = await Promise.all(
        [a, b].map((x) =>
          g.reprogramarCita({
            token: x.token,
            inicio: cupo(22),
            psicologoId: psi,
          }),
        ),
      );
      expect(rs.filter((r) => r.ok)).toHaveLength(1);
      expect(rs.find((r) => !r.ok)).toMatchObject({ codigo: "CUPO_OCUPADO" });
      const [ea, eb] = [await estado(a.fila.id), await estado(b.fila.id)];
      expect([ea, eb].sort()).toEqual(["CANCELADA", "PENDIENTE"]); // la que perdió conserva su cita
      expect(
        await e.bd.cita.count({
          where: {
            psicologoId: psi,
            inicio: new Date(cupo(22)),
            estado: "PENDIENTE",
          },
        }),
      ).toBe(1);
    });

    it("LIMITE_REPROGRAMACIONES y FUERA_DE_PLAZO", async () => {
      const { token: t, fila } = await pedir(24);
      await e.bd.cita.update({
        where: { id: fila.id },
        data: { reprogramaciones: 2 },
      });
      expect(
        await g.reprogramarCita({ token: t, inicio: cupo(26) }),
      ).toMatchObject({ ok: false, codigo: "LIMITE_REPROGRAMACIONES" });
      const tarde = new Date(fila.inicio.getTime() - 11 * 3_600_000);
      await e.bd.cita.update({
        where: { id: fila.id },
        data: { reprogramaciones: 0 },
      });
      expect(
        await g.reprogramarCita(
          { token: t, inicio: cupo(26) },
          { ahora: tarde },
        ),
      ).toMatchObject({ ok: false, codigo: "FUERA_DE_PLAZO" });
      expect(await estado(fila.id)).toBe("PENDIENTE");
      expect(
        await g.reprogramarCita({ token: "mala.firma", inicio: cupo(26) }),
      ).toMatchObject({ ok: false, codigo: "ENLACE_INVALIDO" });
      expect(
        await g.reprogramarCita({ token: t, inicio: "ayer" }),
      ).toMatchObject({ ok: false, codigo: "VALIDACION" });
    });
  },
);
