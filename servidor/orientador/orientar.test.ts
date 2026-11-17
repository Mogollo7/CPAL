import { describe, expect, it } from "vitest";
import orientadorJson from "../../contenido/orientador.json";
import type { OrientadorContenido } from "../../contratos/orientador";
import { obtenerTodosLosCaminos, orientar, validarArbol } from "./orientar";

const orientadorData = orientadorJson as OrientadorContenido;

describe("servidor/orientador/orientar", () => {
  it("el árbol del orientador es válido y no tiene errores estructurales", () => {
    const validacion = validarArbol(orientadorData);
    expect(validacion.errores).toEqual([]);
    expect(validacion.valido).toBe(true);
    expect(validacion.totalCaminos).toBeGreaterThanOrEqual(10);
  });

  it("la línea global de emergencia es el 123", () => {
    expect(orientadorData.lineaGlobal.telefono).toBe("123");
    expect(orientadorData.lineaGlobal.porConfirmar).toBe(true);
  });

  it("navegación paso a paso: inicia en 'p1-situacion' con respuestas vacías", () => {
    const res = orientar({}, orientadorData);
    expect(res.estado).toBe("EN_CURSO");
    if (res.estado === "EN_CURSO") {
      expect(res.preguntaActual.id).toBe("p1-situacion");
      expect(res.pasoActual).toBe(1);
      expect(res.camino).toEqual([]);
    }
  });

  it("navegación paso a paso: avanza al paso 2 al responder la primera pregunta", () => {
    const res = orientar({ "p1-situacion": "op-suicidio" }, orientadorData);
    expect(res.estado).toBe("EN_CURSO");
    if (res.estado === "EN_CURSO") {
      expect(res.preguntaActual.id).toBe("p2-suicidio-riesgo");
      expect(res.pasoActual).toBe(2);
      expect(res.camino).toHaveLength(1);
      expect(res.camino[0].preguntaId).toBe("p1-situacion");
      expect(res.camino[0].opcionId).toBe("op-suicidio");
    }
  });

  it("detecta opciones inválidas y responde con estado ERROR", () => {
    const res = orientar(
      { "p1-situacion": "opcion-inexistente" },
      orientadorData,
    );
    expect(res.estado).toBe("ERROR");
    if (res.estado === "ERROR") {
      expect(res.mensaje).toContain("Opción inválida");
    }
  });

  it("recorre TODOS los caminos posibles y comprueba que TODOS terminan en una recomendación y en el 123", () => {
    const caminos = obtenerTodosLosCaminos(orientadorData);
    expect(caminos.length).toBeGreaterThanOrEqual(10);

    const recomendacionesAlcanzadas = new Set<string>();

    for (const camino of caminos) {
      // Reconstruir el mapa de respuestas para este camino específico
      const respuestas: Record<string, string> = {};
      for (const paso of camino.pasos) {
        respuestas[paso.preguntaId] = paso.opcionId;
      }

      // Ejecutar la lógica pura del orientador con este conjunto de respuestas
      const resultado = orientar(respuestas, orientadorData);

      // Comprobar que el camino finaliza con estado COMPLETADO
      expect(resultado.estado).toBe("COMPLETADO");
      if (resultado.estado === "COMPLETADO") {
        // 1. Termina en una recomendación válida
        expect(resultado.recomendacion).toBeDefined();
        expect(resultado.recomendacion.id).toBe(camino.recomendacionId);
        expect(resultado.recomendacion.titulo).toBeTruthy();
        expect(resultado.recomendacion.situacion).toBeTruthy();
        expect(resultado.recomendacion.queHacer.length).toBeGreaterThanOrEqual(
          1,
        );

        // 2. Termina invariablemente en la Línea de emergencias 123
        expect(resultado.linea123.telefono).toBe("123");
        expect(resultado.recomendacion.lineaPrincipal.telefono).toBe("123");
        expect(resultado.recomendacion.lineaPrincipal.nombre).toBe(
          "Línea de emergencias",
        );
        expect(resultado.recomendacion.lineaPrincipal.porConfirmar).toBe(true);

        // 3. La longitud del camino respeta el rango de 3 o 4 preguntas (máx 4)
        expect(camino.pasos.length).toBeLessThanOrEqual(4);
        expect(camino.pasos.length).toBeGreaterThanOrEqual(2);

        recomendacionesAlcanzadas.add(resultado.recomendacion.id);
      }
    }

    // Verificar que todas las recomendaciones definidas en el catálogo fueron cubiertas
    const todasLasRecomendaciones = orientadorData.recomendaciones.map(
      (r) => r.id,
    );
    for (const recId of todasLasRecomendaciones) {
      expect(
        recomendacionesAlcanzadas.has(recId),
        `La recomendación ${recId} debe ser alcanzable por al menos un camino`,
      ).toBe(true);
    }
  });

  it("todas las líneas telefónicas referenciadas tienen porConfirmar: true", () => {
    for (const rec of orientadorData.recomendaciones) {
      expect(rec.lineaPrincipal.porConfirmar).toBe(true);
      for (const sec of rec.lineasSecundarias) {
        expect(sec.porConfirmar).toBe(true);
      }
    }
  });
});
