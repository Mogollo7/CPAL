// Contra la BD local; se omite sin DATABASE_URL (CI). Usa datos propios ("t206-…") y los borra al final.
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe("cabecera de imagen (E03 §11)", () => {
  it("acepta JPG, PNG y WebP; rechaza el resto", async () => {
    const { esImagenPermitida } = await import("./perfil");
    const sharp = (await import("sharp")).default;
    const base = sharp({
      create: { width: 8, height: 8, channels: 3, background: "#fff" },
    });
    expect(esImagenPermitida(await base.clone().jpeg().toBuffer())).toBe(true);
    expect(esImagenPermitida(await base.clone().png().toBuffer())).toBe(true);
    expect(esImagenPermitida(await base.clone().webp().toBuffer())).toBe(true);
    expect(esImagenPermitida(new TextEncoder().encode("<svg></svg>"))).toBe(
      false,
    );
    expect(esImagenPermitida(new Uint8Array(0))).toBe(false);
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "perfil, foto, horario y ausencias (T-206)",
  () => {
    let bd: typeof import("../bd").bd;
    let ops: typeof import("./perfil");
    let carpeta: string;
    let psi: { usuarioId: string; rol: "PSICOLOGO"; activo: true };
    let otra: { usuarioId: string; rol: "PSICOLOGO"; activo: true };
    let admin: { usuarioId: string; rol: "ADMIN"; activo: true };
    let servicioId: string;
    const T = "t206.test";

    beforeAll(async () => {
      carpeta = await mkdtemp(join(tmpdir(), "capl-t206-"));
      process.env.RUTA_ARCHIVOS = carpeta;
      ({ bd } = await import("../bd"));
      ops = await import("./perfil");
      const mk = (n: string, rol: "ADMIN" | "PSICOLOGO") =>
        bd.usuario.create({
          data: {
            correo: `t206-${n}@${T}`,
            nombre: `T206 ${n}`,
            rol,
            claveHash: "x",
            ...(rol === "PSICOLOGO" && {
              perfil: { create: { area: "PSICOLOGIA" } },
            }),
          },
        });
      const [a, p, o] = await Promise.all([
        mk("admin", "ADMIN"),
        mk("psi", "PSICOLOGO"),
        mk("otra", "PSICOLOGO"),
      ]);
      admin = { usuarioId: a.id, rol: "ADMIN", activo: true };
      psi = { usuarioId: p.id, rol: "PSICOLOGO", activo: true };
      otra = { usuarioId: o.id, rol: "PSICOLOGO", activo: true };
      servicioId = (
        await bd.servicio.create({
          data: {
            slug: `t206-${Date.now()}`,
            nombre: "S",
            descripcion: "d",
            area: "PSICOLOGIA",
          },
        })
      ).id;
    });

    afterAll(async () => {
      const ids = [admin.usuarioId, psi.usuarioId, otra.usuarioId];
      await bd.cita.deleteMany({ where: { psicologoId: { in: ids } } });
      await bd.bloqueo.deleteMany({ where: { psicologoId: { in: ids } } });
      await bd.disponibilidad.deleteMany({
        where: { psicologoId: { in: ids } },
      });
      await bd.perfilPsicologo.deleteMany({
        where: { usuarioId: { in: ids } },
      });
      await bd.usuario.deleteMany({ where: { id: { in: ids } } });
      await bd.servicio.deleteMany({ where: { id: servicioId } });
      delete process.env.RUTA_ARCHIVOS;
      await rm(carpeta, { recursive: true, force: true });
    });

    it("solo el psicólogo: sin sesión y administrador son rechazados en todas", async () => {
      for (const f of [
        ops.obtenerMiPerfil,
        ops.actualizarPerfil,
        ops.guardarHorario,
        ops.crearBloqueo,
        ops.eliminarBloqueo,
      ]) {
        expect(await f(null, {})).toMatchObject({ codigo: "NO_AUTENTICADO" });
        expect(await f(admin, {})).toMatchObject({ codigo: "SIN_PERMISO" });
      }
      expect(await ops.subirFoto(admin, new Uint8Array(4))).toMatchObject({
        codigo: "SIN_PERMISO",
      });
    });

    it("actualiza el perfil y valida los servicios", async () => {
      const r = await ops.actualizarPerfil(psi, {
        presentacion: "Hola",
        servicioIds: [servicioId],
        visible: true,
      });
      expect(r).toMatchObject({
        ok: true,
        datos: {
          presentacion: "Hola",
          visible: true,
          servicioIds: [servicioId],
        },
      });
      expect(
        await ops.actualizarPerfil(psi, {
          presentacion: "x",
          servicioIds: ["no-existe"],
          visible: true,
        }),
      ).toMatchObject({ codigo: "VALIDACION" });
      expect(
        await ops.actualizarPerfil(psi, {
          presentacion: "x".repeat(601),
          servicioIds: [],
          visible: true,
        }),
      ).toMatchObject({ codigo: "VALIDACION" });
    });

    it("la foto queda 400 × 400 WebP; la anterior se borra; archivos inválidos se rechazan", async () => {
      const sharp = (await import("sharp")).default;
      const jpg = await sharp({
        create: { width: 900, height: 500, channels: 3, background: "#4850c0" },
      })
        .jpeg()
        .toBuffer();
      const r = await ops.subirFoto(psi, jpg);
      expect(r).toMatchObject({ ok: true });
      const archivos = await readdir(join(carpeta, "fotos"));
      expect(archivos).toHaveLength(1);
      const meta = await sharp(
        await readFile(join(carpeta, "fotos", archivos[0])),
      ).metadata();
      expect([meta.width, meta.height, meta.format]).toEqual([
        400,
        400,
        "webp",
      ]);

      expect(await ops.subirFoto(psi, jpg)).toMatchObject({ ok: true });
      expect(await readdir(join(carpeta, "fotos"))).toHaveLength(1); // reemplazada, no acumulada

      expect(
        await ops.subirFoto(psi, new TextEncoder().encode("MZ no soy imagen")),
      ).toMatchObject({ ok: false, codigo: "ARCHIVO_INVALIDO" });
      const corrupta = new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3, 4]);
      expect(await ops.subirFoto(psi, corrupta)).toMatchObject({
        codigo: "ARCHIVO_INVALIDO",
      });
      const grande = new Uint8Array(6 * 1024 * 1024 + 1);
      grande.set([0xff, 0xd8, 0xff]);
      expect(await ops.subirFoto(psi, grande)).toMatchObject({
        codigo: "ARCHIVO_INVALIDO",
      });
    });

    it("horario: reemplaza, rechaza cruces y avisa de citas que quedan fuera", async () => {
      const cruzado = {
        bloques: [
          { diaSemana: 2, inicioMin: 480, finMin: 600 },
          { diaSemana: 2, inicioMin: 540, finMin: 660 },
        ],
      };
      expect(await ops.guardarHorario(psi, cruzado)).toMatchObject({
        ok: false,
        codigo: "VALIDACION",
      });

      // Martes 8:00–12:00 a. m. de Bogotá. Cita futura el próximo martes a las 9:00 (dentro) y otra a las 15:00 (fuera).
      const martes = new Date(Date.now() + 14 * 86_400_000);
      while (
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Bogota",
          weekday: "short",
        }).format(martes) !== "Tue"
      )
        martes.setUTCDate(martes.getUTCDate() + 1);
      const fecha = martes.toLocaleDateString("en-CA", {
        timeZone: "America/Bogota",
      });
      const cita = (codigo: string, hora: number) =>
        bd.cita.create({
          data: {
            codigo,
            servicioId,
            psicologoId: psi.usuarioId,
            inicio: new Date(
              `${fecha}T${String(hora).padStart(2, "0")}:00:00-05:00`,
            ),
            fin: new Date(
              `${fecha}T${String(hora + 1).padStart(2, "0")}:00:00-05:00`,
            ),
            paraQuien: "PROPIA",
            consentimientoEn: new Date(),
            consentimientoVersion: "1",
          },
        });
      await cita("T206-0001", 9);
      await cita("T206-0002", 15);

      const r = await ops.guardarHorario(psi, {
        bloques: [{ diaSemana: 2, inicioMin: 480, finMin: 720 }],
      });
      expect(r).toMatchObject({
        ok: true,
        datos: { citasFueraDeHorario: ["T206-0002"] },
      });
      // Reemplaza, no suma:
      await ops.guardarHorario(psi, {
        bloques: [{ diaSemana: 4, inicioMin: 840, finMin: 1020 }],
      });
      const perfil = await ops.obtenerMiPerfil(psi);
      expect(perfil.ok && perfil.datos.horario.bloques).toEqual([
        { diaSemana: 4, inicioMin: 840, finMin: 1020 },
      ]);
      expect(await ops.guardarHorario(psi, { bloques: [] })).toMatchObject({
        ok: true,
        datos: { citasFueraDeHorario: ["T206-0001", "T206-0002"] },
      });
    });

    it("ausencias: siempre propias; no se puede crear ni borrar la de otra persona", async () => {
      const entrada = {
        desde: new Date(Date.now() + 86_400_000).toISOString(),
        hasta: new Date(Date.now() + 2 * 86_400_000).toISOString(),
        motivo: "Congreso",
        psicologoId: otra.usuarioId, // se ignora
      };
      const r = await ops.crearBloqueo(psi, entrada);
      expect(r).toMatchObject({
        ok: true,
        datos: { psicologoId: psi.usuarioId, motivo: "Congreso" },
      });
      if (!r.ok) return;
      expect(await ops.eliminarBloqueo(otra, r.datos.id)).toMatchObject({
        codigo: "NO_ENCONTRADO",
      });
      expect(
        (await ops.obtenerMiPerfil(psi)).ok &&
          (
            (await ops.obtenerMiPerfil(psi)) as {
              datos: { bloqueos: unknown[] };
            }
          ).datos.bloqueos,
      ).toHaveLength(1);
      expect(await ops.eliminarBloqueo(psi, r.datos.id)).toMatchObject({
        ok: true,
      });
      expect(
        await ops.crearBloqueo(psi, { ...entrada, hasta: entrada.desde }),
      ).toMatchObject({ codigo: "VALIDACION" });
    });
  },
);
