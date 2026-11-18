import type {
  CaminoCompleto,
  OrientadorContenido,
  PasoCamino,
  PreguntaOrientador,
  RecomendacionOrientador,
  ResultadoOrientacion,
} from "../../contratos/orientador";
import orientadorJson from "../../contenido/orientador.json";

/**
 * Función pura que evalúa el progreso de una persona en el orientador "¿Qué me está pasando?".
 * Recibe un diccionario con las respuestas { [preguntaId]: opcionId } y el catálogo del orientador.
 * No realiza efectos secundarios ni llamadas externas.
 * Garantiza que cualquier camino completo termina en una recomendación que referencia la Línea 123.
 */
export function orientar(
  respuestas: Record<string, string>,
  catalogo: OrientadorContenido = orientadorJson as OrientadorContenido,
): ResultadoOrientacion {
  const preguntasMap = new Map<string, PreguntaOrientador>(
    catalogo.preguntas.map((p) => [p.id, p]),
  );
  const recomendacionesMap = new Map<string, RecomendacionOrientador>(
    catalogo.recomendaciones.map((r) => [r.id, r]),
  );

  let preguntaActualId: string | undefined = catalogo.preguntaInicialId;
  const camino: PasoCamino[] = [];
  const visitadas = new Set<string>();

  while (preguntaActualId) {
    if (visitadas.has(preguntaActualId)) {
      return {
        estado: "ERROR",
        mensaje: `Ciclo detectado en la pregunta ${preguntaActualId}`,
      };
    }
    visitadas.add(preguntaActualId);

    const pregunta = preguntasMap.get(preguntaActualId);
    if (!pregunta) {
      return {
        estado: "ERROR",
        mensaje: `Pregunta no encontrada en el catálogo: ${preguntaActualId}`,
      };
    }

    const opcionElegidaId: string | undefined = respuestas[preguntaActualId];
    if (!opcionElegidaId) {
      // Pregunta pendiente por responder: navegación en curso
      return {
        estado: "EN_CURSO",
        preguntaActual: pregunta,
        pasoActual: camino.length + 1,
        camino,
      };
    }

    const opcion: PreguntaOrientador["opciones"][number] | undefined =
      pregunta.opciones.find((o) => o.id === opcionElegidaId);
    if (!opcion) {
      return {
        estado: "ERROR",
        mensaje: `Opción inválida '${opcionElegidaId}' para la pregunta '${preguntaActualId}'`,
      };
    }

    camino.push({
      preguntaId: pregunta.id,
      preguntaTexto: pregunta.enunciado,
      opcionId: opcion.id,
      opcionTexto: opcion.texto,
    });

    if (opcion.recomendacionId) {
      const recomendacion = recomendacionesMap.get(opcion.recomendacionId);
      if (!recomendacion) {
        return {
          estado: "ERROR",
          mensaje: `Recomendación no encontrada: ${opcion.recomendacionId}`,
        };
      }
      return {
        estado: "COMPLETADO",
        recomendacion,
        linea123: recomendacion.lineaPrincipal ?? catalogo.lineaGlobal,
        camino,
      };
    }

    preguntaActualId = opcion.siguientePreguntaId;
  }

  return {
    estado: "ERROR",
    mensaje: "Camino incompleto sin siguiente pregunta ni recomendación final",
  };
}

/**
 * Obtiene todos los caminos posibles desde la pregunta inicial hasta cada recomendación.
 * Recorre el árbol en profundidad y retorna cada camino con sus pasos y su recomendación final.
 */
export function obtenerTodosLosCaminos(
  catalogo: OrientadorContenido = orientadorJson as OrientadorContenido,
): CaminoCompleto[] {
  const preguntasMap = new Map<string, PreguntaOrientador>(
    catalogo.preguntas.map((p) => [p.id, p]),
  );
  const recomendacionesMap = new Map<string, RecomendacionOrientador>(
    catalogo.recomendaciones.map((r) => [r.id, r]),
  );

  const caminos: CaminoCompleto[] = [];

  function explorar(
    preguntaId: string,
    pasosPrevios: { preguntaId: string; opcionId: string }[],
    visitados: Set<string>,
  ) {
    if (visitados.has(preguntaId)) {
      throw new Error(`Ciclo detectado en pregunta: ${preguntaId}`);
    }
    const nuevosVisitados = new Set(visitados);
    nuevosVisitados.add(preguntaId);

    const pregunta = preguntasMap.get(preguntaId);
    if (!pregunta) {
      throw new Error(`Pregunta no encontrada en el catálogo: ${preguntaId}`);
    }

    for (const opcion of pregunta.opciones) {
      const pasosActuales = [
        ...pasosPrevios,
        { preguntaId: pregunta.id, opcionId: opcion.id },
      ];

      if (opcion.recomendacionId) {
        const recomendacion = recomendacionesMap.get(opcion.recomendacionId);
        if (!recomendacion) {
          throw new Error(
            `Recomendación no encontrada: ${opcion.recomendacionId}`,
          );
        }
        caminos.push({
          pasos: pasosActuales,
          recomendacionId: opcion.recomendacionId,
          recomendacion,
        });
      } else if (opcion.siguientePreguntaId) {
        explorar(opcion.siguientePreguntaId, pasosActuales, nuevosVisitados);
      }
    }
  }

  explorar(catalogo.preguntaInicialId, [], new Set());
  return caminos;
}

/**
 * Valida la integridad y exhaustividad del árbol del orientador:
 * - Pregunta inicial existente en el catálogo.
 * - Sin ramas huérfanas ni ciclos.
 * - Toda recomendación es alcanzable y contiene el 123 como línea principal.
 */
export function validarArbol(
  catalogo: OrientadorContenido = orientadorJson as OrientadorContenido,
): {
  valido: boolean;
  errores: string[];
  totalCaminos: number;
} {
  const errores: string[] = [];
  let caminos: CaminoCompleto[] = [];

  try {
    caminos = obtenerTodosLosCaminos(catalogo);
  } catch (err: unknown) {
    errores.push((err as Error).message);
  }

  // Verificar que todas las recomendaciones son alcanzables
  const recomendacionesAlcanzadas = new Set(
    caminos.map((c) => c.recomendacionId),
  );
  for (const rec of catalogo.recomendaciones) {
    if (!recomendacionesAlcanzadas.has(rec.id)) {
      errores.push(`Recomendación huérfana (nunca alcanzada): ${rec.id}`);
    }
    if (rec.lineaPrincipal?.telefono !== "123") {
      errores.push(
        `La recomendación ${rec.id} no tiene el 123 como línea principal`,
      );
    }
  }

  // Verificar que la línea global sea el 123
  if (catalogo.lineaGlobal?.telefono !== "123") {
    errores.push("La línea global del orientador debe ser el 123");
  }

  return {
    valido: errores.length === 0,
    errores,
    totalCaminos: caminos.length,
  };
}
