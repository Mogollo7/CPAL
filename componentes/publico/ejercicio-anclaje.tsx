"use client";

import React, { useState } from "react";
import {
  Eye,
  Hand,
  Volume2,
  Flower2,
  Smile,
  Wind,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  HeartHandshake,
  ChevronDown,
} from "lucide-react";
import { TransicionSuave } from "@/componentes/ui/transicion-suave";
import { BotonLlamar } from "@/componentes/ui/boton-llamar";
import { cn } from "@/componentes/ui/cn";
import anclajeData from "@/contenido/anclaje.json";
import type { AnclajeContenido } from "@/contratos/orientador";

export interface EjercicioAnclajeProps {
  className?: string;
  id?: string;
}

const datos = anclajeData as AnclajeContenido;

const iconosSentidos: Record<number, React.ReactNode> = {
  5: <Eye className="w-8 h-8 text-morado-600" aria-hidden="true" />,
  4: <Hand className="w-8 h-8 text-morado-600" aria-hidden="true" />,
  3: <Volume2 className="w-8 h-8 text-morado-600" aria-hidden="true" />,
  2: <Flower2 className="w-8 h-8 text-morado-600" aria-hidden="true" />,
  1: <Smile className="w-8 h-8 text-morado-600" aria-hidden="true" />,
};

/**
 * Ejercicio de anclaje sensorial 5-4-3-2-1 (RF-EMG-06)
 *
 * Diseñado bajo neurobienestar y confort sensorial:
 * - Un solo paso por pantalla para no sobrecargar cognitivamente.
 * - Sin temporizadores ni conteos automáticos (cero ansiedad por reloj).
 * - Botones táctiles generosos (min-h-[48px]).
 * - Incluye guía desplegable para acompañantes.
 */
export function EjercicioAnclaje({
  className,
  id = "ejercicio-anclaje",
}: EjercicioAnclajeProps) {
  // 0: Respiración previa, 1..5: Pasos 5..1, 6: Cierre
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);

  const totalEtapas = 7; // 0 (respira) + 5 pasos + 1 (cierre)
  const pasoSensorial =
    pasoActual >= 1 && pasoActual <= 5 ? datos.pasos[pasoActual - 1] : null;

  const avanzar = () => {
    if (pasoActual < totalEtapas - 1) {
      setPasoActual((prev) => prev + 1);
    }
  };

  const retroceder = () => {
    if (pasoActual > 0) {
      setPasoActual((prev) => prev - 1);
    }
  };

  const reiniciar = () => {
    setPasoActual(0);
  };

  return (
    <section
      id={id}
      aria-labelledby="titulo-anclaje"
      className={cn(
        "rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-8 shadow-sm",
        className,
      )}
    >
      {/* Cabecera del ejercicio */}
      <div className="mb-6 border-b border-borde-suave pb-4">
        <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
          Primeros auxilios emocionales · Sin prisas
        </span>
        <h2
          id="titulo-anclaje"
          className="text-h1 font-fuerte text-texto-titulo mt-1"
        >
          {datos.titulo}
        </h2>
        <p className="text-p text-texto-secundario mt-2 max-w-[65ch]">
          {datos.subtitulo}. {datos.introduccion}
        </p>
      </div>

      {/* Indicador de progreso calmo */}
      <div className="mb-6 flex items-center justify-between text-caption font-medio text-texto-secundario">
        <span>
          {pasoActual === 0
            ? "Paso previo: Respiración serena"
            : pasoActual === 6
              ? "Cierre del ejercicio"
              : `Paso ${pasoActual} de 5 · Sentido: ${pasoSensorial?.sentido}`}
        </span>
        <span aria-hidden="true">
          {pasoActual + 1} / {totalEtapas}
        </span>
      </div>

      <div
        className="h-2 w-full bg-morado-50 rounded-pildora overflow-hidden mb-6"
        role="progressbar"
        aria-valuenow={pasoActual + 1}
        aria-valuemin={1}
        aria-valuemax={totalEtapas}
        aria-label="Progreso del ejercicio de anclaje"
      >
        <div
          className="h-full bg-morado-600 transition-all duration-mov-medio ease-entrada rounded-pildora"
          style={{ width: `${((pasoActual + 1) / totalEtapas) * 100}%` }}
        />
      </div>

      {/* Contenido dinámico paso a paso con transición suave */}
      <div className="min-h-[220px] flex flex-col justify-center">
        {pasoActual === 0 && (
          <TransicionSuave key="paso-0" direccion="arriba">
            <div className="rounded-m bg-morado-50 p-6 border border-morado-100 flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-blanco rounded-circulo shadow-sm shrink-0">
                <Wind className="w-8 h-8 text-morado-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-h2 font-medio text-texto-titulo mb-2">
                  {datos.respiracionInicial.titulo}
                </h3>
                <p className="text-p text-texto-principal leading-texto">
                  {datos.respiracionInicial.instruccion}
                </p>
                <p className="text-caption text-tinta-suave mt-3">
                  Tómate el tiempo que necesites. Cuando sientas tu cuerpo más
                  presente, presiona el botón para iniciar.
                </p>
              </div>
            </div>
          </TransicionSuave>
        )}

        {pasoSensorial && (
          <TransicionSuave
            key={`paso-${pasoSensorial.numero}`}
            direccion="arriba"
          >
            <div className="rounded-m bg-crema p-6 sm:p-8 border border-borde-suave flex flex-col sm:flex-row items-start gap-5">
              <div className="p-4 bg-blanco rounded-l shadow-sm shrink-0 flex items-center justify-center">
                {iconosSentidos[pasoSensorial.numero]}
              </div>
              <div className="flex-1">
                <span className="inline-block text-caption font-medio text-morado-700 bg-morado-100 px-3 py-1 rounded-pildora mb-2">
                  Sentido: {pasoSensorial.sentido}
                </span>
                <h3 className="text-h2 font-fuerte text-texto-titulo mb-3">
                  {pasoSensorial.titulo}
                </h3>
                <p className="text-p text-texto-principal leading-texto">
                  {pasoSensorial.instruccion}
                </p>
              </div>
            </div>
          </TransicionSuave>
        )}

        {pasoActual === 6 && (
          <TransicionSuave key="paso-cierre" direccion="arriba">
            <div className="rounded-m bg-agua-100 p-6 sm:p-8 border border-agua-300">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2
                  className="w-7 h-7 text-agua-700 shrink-0"
                  aria-hidden="true"
                />
                <h3 className="text-h2 font-fuerte text-agua-700">
                  {datos.cierre.titulo}
                </h3>
              </div>
              <p className="text-p text-texto-principal leading-texto mb-6">
                {datos.cierre.mensaje}
              </p>

              <div className="border-t border-agua-300 pt-5">
                <p className="text-caption font-medio text-texto-secundario mb-3">
                  Si la angustia persiste o sientes que necesitas hablar con
                  alguien ahora:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <BotonLlamar
                    nombre={datos.cierre.lineaEmergencia.nombre}
                    telefono={datos.cierre.lineaEmergencia.telefono}
                    porConfirmar={datos.cierre.lineaEmergencia.porConfirmar}
                    variante="alerta"
                  />
                  {datos.cierre.lineaSaludMental && (
                    <BotonLlamar
                      nombre={datos.cierre.lineaSaludMental.nombre}
                      telefono={datos.cierre.lineaSaludMental.telefono}
                      porConfirmar={datos.cierre.lineaSaludMental.porConfirmar}
                      variante="secundario"
                    />
                  )}
                </div>
              </div>
            </div>
          </TransicionSuave>
        )}
      </div>

      {/* Botonera de control (Área táctil mínima 48px) */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-borde-suave">
        {pasoActual > 0 && pasoActual < 6 ? (
          <button
            type="button"
            onClick={retroceder}
            className="min-h-[48px] px-5 py-3 rounded-m border border-borde-suave text-texto-principal hover:bg-morado-50 font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            <span>Paso anterior</span>
          </button>
        ) : pasoActual === 6 ? (
          <button
            type="button"
            onClick={reiniciar}
            className="min-h-[48px] px-5 py-3 rounded-m border border-borde-suave text-texto-principal hover:bg-morado-50 font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            <span>Repetir ejercicio</span>
          </button>
        ) : (
          <div />
        )}

        {pasoActual < 6 ? (
          <button
            type="button"
            onClick={avanzar}
            className="min-h-[48px] px-6 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo active:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido ml-auto"
          >
            <span>
              {pasoActual === 0
                ? "Comenzar anclaje (5 cosas que ves)"
                : "Siguiente sentido"}
            </span>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Guía desplegable para acompañantes */}
      {datos.guiaAcompanante && (
        <div className="mt-8 pt-6 border-t border-borde-suave">
          <button
            type="button"
            onClick={() => setMostrarGuia((prev) => !prev)}
            className="w-full min-h-[48px] px-4 py-3 rounded-m bg-fondo-suave hover:bg-morado-100 text-texto-principal text-left font-medio text-p flex items-center justify-between gap-3 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
            aria-expanded={mostrarGuia}
            aria-controls="pautas-acompanante"
          >
            <div className="flex items-center gap-3">
              <HeartHandshake
                className="w-5 h-5 text-morado-700 shrink-0"
                aria-hidden="true"
              />
              <span>{datos.guiaAcompanante.titulo}</span>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-texto-secundario transition-transform duration-mov-medio",
                mostrarGuia && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {mostrarGuia && (
            <div
              id="pautas-acompanante"
              className="mt-4 p-5 rounded-m bg-crema border border-borde-suave"
            >
              <ul className="space-y-3">
                {datos.guiaAcompanante.pautas.map((pauta, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-p text-texto-principal leading-texto"
                  >
                    <span
                      className="w-2 h-2 rounded-circulo bg-morado-600 mt-2 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{pauta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
