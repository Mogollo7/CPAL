import { describe, expect, it } from "vitest";
import { faqSchema } from "../contratos/faq";
import { anclajeSchema, orientadorSchema } from "../contratos/orientador";
import anclajeData from "./anclaje.json";
import emergenciasData from "./emergencias.json";
import faqData from "./faq.json";
import orientadorData from "./orientador.json";

describe("contenido/contenido-publico", () => {
  describe("contenido/faq.json", () => {
    it("cumple estrictamente el esquema faqSchema de contratos/faq.ts", () => {
      const parsed = faqSchema.safeParse(faqData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.preguntas.length).toBeGreaterThanOrEqual(10);
        expect(parsed.data.porConfirmar).toBe(true);
      }
    });

    it("todas las preguntas tienen categoría, respuesta clara y porConfirmar: true", () => {
      for (const item of faqData.preguntas) {
        expect(item.id).toBeTruthy();
        expect(item.categoria).toBeTruthy();
        expect(item.pregunta).toBeTruthy();
        expect(item.respuesta.length).toBeGreaterThanOrEqual(20);
        expect(item.porConfirmar).toBe(true);
      }
    });

    it("los enlaces de apoyo apuntan a rutas relativas válidas del proyecto", () => {
      for (const item of faqData.preguntas) {
        if (item.enlace) {
          expect(item.enlace.url.startsWith("/")).toBe(true);
          expect(item.enlace.texto).toBeTruthy();
        }
      }
    });
  });

  describe("contenido/orientador.json", () => {
    it("cumple estrictamente el esquema orientadorSchema de contratos/orientador.ts", () => {
      const parsed = orientadorSchema.safeParse(orientadorData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.preguntas.length).toBeGreaterThanOrEqual(4);
        expect(parsed.data.recomendaciones.length).toBeGreaterThanOrEqual(4);
        expect(parsed.data.porConfirmar).toBe(true);
      }
    });

    it("la línea de ayuda global y la línea principal de cada recomendación es el 123", () => {
      expect(orientadorData.lineaGlobal.telefono).toBe("123");
      expect(orientadorData.lineaGlobal.porConfirmar).toBe(true);

      for (const rec of orientadorData.recomendaciones) {
        expect(rec.lineaPrincipal.telefono).toBe("123");
        expect(rec.lineaPrincipal.nombre).toBe("Línea de emergencias");
        expect(rec.lineaPrincipal.porConfirmar).toBe(true);
      }
    });

    it("no inventa teléfonos: todas las líneas referenciadas existen en emergencias.json", () => {
      const telefonosPermitidos = new Set(
        emergenciasData.directorio.map((l) => l.telefono),
      );

      // La línea global debe existir en emergencias.json
      expect(telefonosPermitidos.has(orientadorData.lineaGlobal.telefono)).toBe(
        true,
      );

      // Cada recomendación debe referenciar únicamente teléfonos del directorio oficial
      for (const rec of orientadorData.recomendaciones) {
        expect(telefonosPermitidos.has(rec.lineaPrincipal.telefono)).toBe(true);
        for (const sec of rec.lineasSecundarias) {
          expect(
            telefonosPermitidos.has(sec.telefono),
            `El teléfono ${sec.telefono} debe existir en contenido/emergencias.json`,
          ).toBe(true);
        }
      }
    });

    it("los códigos referenciados (codigoId) existen en contenido/emergencias.json", () => {
      const codigosValidos = new Set(emergenciasData.codigos.map((c) => c.id));
      for (const rec of orientadorData.recomendaciones) {
        if (rec.codigoId) {
          expect(
            codigosValidos.has(rec.codigoId),
            `El código ${rec.codigoId} debe existir en contenido/emergencias.json`,
          ).toBe(true);
        }
      }
    });
  });

  describe("contenido/anclaje.json", () => {
    it("cumple estrictamente el esquema anclajeSchema de contratos/orientador.ts", () => {
      const parsed = anclajeSchema.safeParse(anclajeData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.pasos).toHaveLength(5);
        expect(parsed.data.porConfirmar).toBe(true);
      }
    });

    it("contiene los 5 pasos sensoriales en secuencia decreciente 5-4-3-2-1", () => {
      const numeros = anclajeData.pasos.map((p) => p.numero);
      expect(numeros).toEqual([5, 4, 3, 2, 1]);

      const sentidos = anclajeData.pasos.map((p) => p.sentido);
      expect(sentidos).toEqual(["Vista", "Tacto", "Oído", "Olfato", "Gusto"]);
    });

    it("el cierre referencia la Línea de emergencias 123 existente en emergencias.json", () => {
      expect(anclajeData.cierre.lineaEmergencia.telefono).toBe("123");
      expect(anclajeData.cierre.lineaEmergencia.porConfirmar).toBe(true);
      if (anclajeData.cierre.lineaSaludMental) {
        expect(anclajeData.cierre.lineaSaludMental.telefono).toBe("106");
        expect(anclajeData.cierre.lineaSaludMental.porConfirmar).toBe(true);
      }
    });

    it("incluye pautas de primeros auxilios emocionales para personas acompañantes", () => {
      expect(anclajeData.guiaAcompanante).toBeDefined();
      expect(anclajeData.guiaAcompanante?.pautas.length).toBeGreaterThanOrEqual(
        3,
      );
    });
  });
});
