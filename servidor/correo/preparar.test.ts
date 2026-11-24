// Contra la BD local; se omite sin DATABASE_URL. Datos propios con prefijo "t307" que se borran al final.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

try {
  process.loadEnvFile();
} catch {}

describe.skipIf(!process.env.DATABASE_URL)(
  "correos de cita desde la BD (T-204, T-307, T-324)",
  () => {
    let bd: typeof import("../bd").bd;
    let preparar: typeof import("./preparar");
    let enviar: typeof import("./enviar");
    let enlaces: typeof import("./enlaces");
    let citaId: string;
    let usuarioId: string;

    beforeAll(async () => {
      vi.spyOn(process.stdout, "write").mockImplementation(() => true);
      process.env.URL_SITIO = "https://pruebas.ejemplo.test";
      process.env.AUTH_SECRET = "secreto-de-prueba-largo-para-correos";
      ({ bd } = await import("../bd"));
      preparar = await import("./preparar");
      enviar = await import("./enviar");
      enlaces = await import("./enlaces");
      const u = await bd.usuario.create({
        data: {
          correo: "t307-psi@ejemplo.test",
          nombre: "Laura Gómez",
          rol: "PSICOLOGO",
        },
      });
      usuarioId = u.id;
      const s = await bd.servicio.create({
        data: {
          slug: "t307-serv",
          nombre: "Orientación t307",
          descripcion: "x",
          area: "PSICOLOGIA",
        },
      });
      const c = await bd.cita.create({
        data: {
          codigo: "T307-AAAA",
          servicioId: s.id,
          psicologoId: u.id,
          inicio: new Date("2027-03-02T19:30:00Z"),
          fin: new Date("2027-03-02T20:30:00Z"),
          estado: "AUTORIZADA",
          paraQuien: "PROPIA",
          solicitanteNombre: "Ana Pérez",
          solicitanteCorreo: "t307-ana@ejemplo.test",
          pacienteDocumento: "1020304050",
          pacienteEdad: 23,
          motivo: "MOTIVO-SECRETO-DE-CONSULTA",
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
        },
      });
      citaId = c.id;
    });
    afterAll(async () => {
      await bd.trabajo.deleteMany({ where: { citaId } });
      await bd.cita.deleteMany({ where: { id: citaId } });
      await bd.servicio.deleteMany({ where: { slug: "t307-serv" } });
      await bd.usuario.deleteMany({ where: { id: usuarioId } });
      await bd.$disconnect();
    });

    it("los 8 correos de cita se arman desde la BD y ninguno contiene motivo, documento ni edad", async () => {
      const plantillas = [
        ["solicitud-recibida", { citaId }],
        ["cita-autorizada", { citaId }],
        ["cita-no-autorizada", { citaId }],
        ["cita-vencida", { citaId }],
        ["cita-cancelada", { citaId, canceladaPor: "persona" }],
        ["recordatorio", { citaId }],
        ["cita-nueva-psicologo", { citaId }],
        ["cita-cancelada-psicologo", { citaId }],
      ] as const;
      for (const [n, p] of plantillas) {
        const c = await preparar.prepararCorreo(n, p as never);
        expect(c, n).not.toBeNull();
        const todo = c!.html + c!.texto + c!.asunto;
        expect(todo, n).not.toContain("MOTIVO-SECRETO");
        expect(todo, n).not.toContain("1020304050");
        expect(todo, n).not.toMatch(/23 años/);
      }
      const a = await preparar.prepararCorreo("cita-autorizada", { citaId });
      expect(a!.para).toBe("t307-ana@ejemplo.test");
      expect(a!.adjuntos![0].contenido).toContain(
        `UID:${citaId}@pruebas.ejemplo.test`,
      );
      const p = await preparar.prepararCorreo("cita-nueva-psicologo", {
        citaId,
      });
      expect(p!.para).toBe("t307-psi@ejemplo.test");
    });

    it("el enlace de gestión lleva firma verificable y una alterada no vale", () => {
      const ruta = enlaces.rutaCita(citaId);
      expect(enlaces.citaDeEnlace(ruta.replace("/cita/", ""))).toBe(citaId);
      expect(enlaces.citaDeEnlace(ruta.replace("/cita/", "") + "x")).toBeNull();
    });

    it("una cita anonimizada o ya no autorizada no genera correo", async () => {
      await bd.cita.update({
        where: { id: citaId },
        data: { estado: "CANCELADA" },
      });
      expect(
        await preparar.prepararCorreo("recordatorio", { citaId }),
      ).toBeNull();
      expect(
        await preparar.prepararCorreo("cita-autorizada", { citaId }),
      ).toBeNull();
      await bd.cita.update({
        where: { id: citaId },
        data: { solicitanteCorreo: null, anonimizadaEn: new Date() },
      });
      expect(
        await preparar.prepararCorreo("cita-vencida", { citaId }),
      ).toBeNull();
    });

    it("encolarPlantilla guarda solo ids, es idempotente y deja la cita enlazada", async () => {
      const a = await enviar.encolarPlantilla("cita-vencida", { citaId });
      const b = await enviar.encolarPlantilla("cita-vencida", { citaId });
      expect([a.creado, b.creado]).toEqual([true, false]);
      const t = await bd.trabajo.findFirstOrThrow({ where: { citaId } });
      expect(t.llave).toBe(`correo:cita-vencida:${citaId}:1`);
      expect(t.datos).toEqual({ plantilla: "cita-vencida", citaId });
    });

    it("invitación: toma el token de la BD (vigencia) y usa /crear-clave/{token}", async () => {
      const t = await bd.tokenAcceso.create({
        data: {
          usuarioId,
          tipo: "INVITACION",
          tokenHash: "t307-hash",
          creadoEn: new Date("2026-11-20T00:00:00Z"),
          venceEn: new Date("2026-11-22T00:00:00Z"),
        },
      });
      const c = await preparar.prepararCorreo("invitacion", {
        tokenId: t.id,
        token: "tok-claro",
      });
      expect(c!.texto).toContain(
        "https://pruebas.ejemplo.test/crear-clave/tok-claro",
      );
      expect(c!.texto).toContain("48 horas");
      await bd.tokenAcceso.update({
        where: { id: t.id },
        data: { usadoEn: new Date() },
      });
      expect(
        await preparar.prepararCorreo("invitacion", {
          tokenId: t.id,
          token: "tok-claro",
        }),
      ).toBeNull();
      await bd.tokenAcceso.delete({ where: { id: t.id } });
    });
  },
);
