"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
  Sparkles,
  ShieldAlert,
  ArrowDown,
} from "lucide-react";
import { TransicionSuave } from "@/componentes/atomos/transicion-suave";
import { BotonLlamar } from "@/componentes/moleculas/boton-llamar";
import { EnlaceLlamar } from "@/componentes/atomos/enlace-llamar";
import { cn } from "@/componentes/cn";
import orientadorData from "@/contenido/orientador.json";
import type {
  OrientadorContenido,
  PreguntaOrientador,
  RecomendacionOrientador,
} from "@/contratos/orientador";

export interface OrientadorCrisisProps {
  className?: string;
  id?: string;
}

const datos = orientadorData as OrientadorContenido;

/**
 * Orientador interactivo de crisis "¿Qué me está pasando?" (RF-EMG-03)
 *
 * Guía a la persona o acompañante mediante 2-3 preguntas claras hacia la ruta oportuna,
 * manteniendo permanentemente visible la Línea 123 y sin realizar diagnósticos clínicos.
 */
export function OrientadorCrisis({
  className,
  id = "orientador-crisis",
}: OrientadorCrisisProps) {
  const [preguntaActualId, setPreguntaActualId] = useState<string>(
    datos.preguntaInicialId,
  );
  const [recomendacionFinal, setRecomendacionFinal] =
    useState<RecomendacionOrientador | null>(null);
  const [historialPreguntas, setHistorialPreguntas] = useState<string[]>([]);

  // Buscar pregunta actual en la colección
  const preguntaActual: PreguntaOrientador | undefined = datos.preguntas.find(
    (p) => p.id === preguntaActualId,
  );

  const seleccionarOpcion = (
    siguientePreguntaId?: string,
    recomendacionId?: string,
  ) => {
    if (recomendacionId) {
      const rec = datos.recomendaciones.find((r) => r.id === recomendacionId);
      if (rec) {
        setHistorialPreguntas((prev) => [...prev, preguntaActualId]);
        setRecomendacionFinal(rec);
      }
    } else if (siguientePreguntaId) {
      setHistorialPreguntas((prev) => [...prev, preguntaActualId]);
      setPreguntaActualId(siguientePreguntaId);
    }
  };

  const retroceder = () => {
    if (recomendacionFinal) {
      setRecomendacionFinal(null);
      return;
    }

    if (historialPreguntas.length > 0) {
      const nuevoHistorial = [...historialPreguntas];
      const preguntaAnterior = nuevoHistorial.pop()!;
      setHistorialPreguntas(nuevoHistorial);
      setPreguntaActualId(preguntaAnterior);
    }
  };

  const reiniciar = () => {
    setPreguntaActualId(datos.preguntaInicialId);
    setRecomendacionFinal(null);
    setHistorialPreguntas([]);
  };

  return (
    <section
      id={id}
      aria-labelledby="titulo-orientador"
      className={cn(
        "rounded-l bg-fondo-superficie p-5 shadow-flotante",
        className,
      )}
    >
      {/* 1. Línea 123 SIEMPRE visible en la parte superior (Requisito no negociable) */}
      <div className="mb-6 rounded-m bg-aviso-fondo p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert
            className="w-6 h-6 text-morado-900 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-fuerte text-p text-tinta">
              ¿Estás o alguien está en peligro inminente?
            </p>
            <p className="text-caption text-tinta-suave">
              No esperes: las líneas de emergencia atienden las 24 horas del
              día.
            </p>
          </div>
        </div>
        <EnlaceLlamar telefono={datos.lineaGlobal.telefono} />
      </div>

      {/* Encabezado del Orientador */}
      <div className="mb-6 border-b border-borde-suave pb-4">
        <div className="flex items-center gap-2 text-morado-700 text-caption font-medio uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          <span>Orientador breve y confidencial</span>
        </div>
        <h2
          id="titulo-orientador"
          className="text-h1 font-fuerte text-texto-titulo mt-1"
        >
          ¿Qué situación describe mejor lo que pasa?
        </h2>
        <p className="text-p text-texto-secundario mt-1 max-w-[65ch]">
          Respóndete estas preguntas breves para saber cuál es el camino de
          atención más seguro. No guardamos ningún dato ni hacemos diagnósticos
          clínicos.
        </p>
      </div>

      {/* 2. Preguntas interactivas o Recomendación final */}
      {!recomendacionFinal && preguntaActual && (
        <TransicionSuave key={preguntaActual.id} direccion="arriba">
          <div className="space-y-4">
            <fieldset>
              <legend className="text-h2 font-medio text-texto-titulo mb-2">
                {preguntaActual.enunciado}
              </legend>
              {preguntaActual.ayuda && (
                <p className="text-caption text-texto-secundario mb-4">
                  {preguntaActual.ayuda}
                </p>
              )}

              <div
                className="grid grid-cols-1 gap-3 mt-4"
                role="radiogroup"
                aria-label={preguntaActual.enunciado}
              >
                {preguntaActual.opciones.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() =>
                      seleccionarOpcion(
                        opcion.siguientePreguntaId,
                        opcion.recomendacionId,
                      )
                    }
                    className="w-full min-h-[48px] p-4 rounded-m border border-borde-suave bg-crema hover:bg-morado-50 hover:border-morado-300 text-left transition-colors duration-mov-rapido flex items-center justify-between gap-4 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medio text-p text-texto-principal">
                        {opcion.texto}
                      </span>
                      {opcion.descripcion && (
                        <span className="text-caption text-texto-secundario mt-1">
                          {opcion.descripcion}
                        </span>
                      )}
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-morado-600 shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Navegación para retroceder */}
            {historialPreguntas.length > 0 && (
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={retroceder}
                  className="min-h-[48px] px-4 py-2 rounded-m text-texto-principal hover:bg-fondo-suave text-p font-medio inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Pregunta anterior</span>
                </button>
                <button
                  type="button"
                  onClick={reiniciar}
                  className="min-h-[48px] px-4 py-2 rounded-m text-texto-secundario hover:bg-fondo-suave text-caption font-medio inline-flex items-center gap-1 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido ml-auto"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Comenzar de nuevo</span>
                </button>
              </div>
            )}
          </div>
        </TransicionSuave>
      )}

      {/* 3. Tarjeta de Recomendación Final */}
      {recomendacionFinal && (
        <TransicionSuave key={recomendacionFinal.id} direccion="arriba">
          <div className="rounded-m bg-crema border border-morado-300 p-6 sm:p-8 space-y-6">
            <div className="border-b border-morado-100 pb-4">
              <span className="inline-block text-caption font-medio text-morado-700 bg-morado-100 px-3 py-1 rounded-pildora mb-2">
                Recomendación de atención
              </span>
              <h3 className="text-h2 font-fuerte text-texto-titulo">
                {recomendacionFinal.titulo}
              </h3>
              <p className="text-p text-texto-principal leading-texto mt-2">
                {recomendacionFinal.situacion}
              </p>
            </div>

            {/* Qué hacer */}
            <div>
              <h4 className="text-p font-fuerte text-texto-titulo mb-2">
                Qué te recomendamos hacer ahora:
              </h4>
              <ul className="space-y-2">
                {recomendacionFinal.queHacer.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-p text-texto-principal leading-texto"
                  >
                    <span
                      className="w-2 h-2 rounded-circulo bg-morado-600 mt-2 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qué no hacer */}
            {recomendacionFinal.queNoHacer &&
              recomendacionFinal.queNoHacer.length > 0 && (
                <div>
                  <h4 className="text-p font-fuerte text-coral-700 mb-2">
                    Qué es mejor evitar:
                  </h4>
                  <ul className="space-y-2">
                    {recomendacionFinal.queNoHacer.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-p text-texto-principal leading-texto"
                      >
                        <span
                          className="w-2 h-2 rounded-circulo bg-coral-700 mt-2 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Líneas recomendadas para llamar */}
            <div className="border-t border-borde-suave pt-5">
              <p className="text-caption font-medio text-texto-secundario mb-3">
                Comunícate directamente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BotonLlamar
                  nombre={recomendacionFinal.lineaPrincipal.nombre}
                  telefono={recomendacionFinal.lineaPrincipal.telefono}
                  porConfirmar={recomendacionFinal.lineaPrincipal.porConfirmar}
                  variante="alerta"
                />
                {recomendacionFinal.lineasSecundarias?.map((lineaSec, idx) => (
                  <BotonLlamar
                    key={idx}
                    nombre={lineaSec.nombre}
                    telefono={lineaSec.telefono}
                    porConfirmar={lineaSec.porConfirmar}
                    variante="secundario"
                  />
                ))}
              </div>
            </div>

            {/* Accesos rápidos a Código o Anclaje */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {recomendacionFinal.codigoId && (
                <a
                  href={`#codigo-${recomendacionFinal.codigoId}`}
                  className="min-h-[48px] px-5 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
                >
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                  <span>Ver tarjeta detallada del código</span>
                </a>
              )}

              {recomendacionFinal.sugiereAnclaje && (
                <a
                  href="#ejercicio-anclaje"
                  className="min-h-[48px] px-5 py-3 rounded-m bg-fondo-superficie border border-morado-300 text-texto-enlace hover:bg-fondo-suave font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
                >
                  <Sparkles
                    className="w-4 h-4 text-morado-600"
                    aria-hidden="true"
                  />
                  <span>Realizar técnica de anclaje 5-4-3-2-1</span>
                </a>
              )}

              {recomendacionFinal.enlaceAccion && (
                <a
                  href={recomendacionFinal.enlaceAccion.url}
                  className="min-h-[48px] px-5 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
                >
                  <span>{recomendacionFinal.enlaceAccion.texto}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Botón para reiniciar */}
            <div className="border-t border-borde-suave pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={retroceder}
                className="min-h-[48px] px-4 py-2 rounded-m text-texto-principal hover:bg-fondo-suave text-p font-medio inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                <span>Volver a la pregunta anterior</span>
              </button>

              <button
                type="button"
                onClick={reiniciar}
                className="min-h-[48px] px-4 py-2 rounded-m text-texto-secundario hover:bg-fondo-suave text-caption font-medio inline-flex items-center gap-1 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reiniciar orientador</span>
              </button>
            </div>
          </div>
        </TransicionSuave>
      )}
    </section>
  );
}
