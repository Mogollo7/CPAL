"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "./cn";
import type { PreguntaFaq } from "../../contratos/faq";

export interface AcordeonFaqProps {
  preguntas: PreguntaFaq[];
  className?: string;
  mostrarFiltroCategorias?: boolean;
}

/**
 * Acordeón accesible para preguntas frecuentes (RF-PUB-04)
 *
 * Cumple WCAG AA:
 * - Operable 100% por teclado (Enter, Space, Tab).
 * - Atributos semánticos: aria-expanded y aria-controls.
 * - Anillo de foco de 3px visible con contraste.
 */
export function AcordeonFaq({
  preguntas,
  className,
  mostrarFiltroCategorias = true,
}: AcordeonFaqProps) {
  // Manejo de qué pregunta está abierta (por ID)
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    [preguntas[0]?.id || ""]: true, // Primera abierta por defecto para dar pista visual
  });

  // Categorías únicas
  const categorias = [
    "Todas",
    ...Array.from(new Set(preguntas.map((p) => p.categoria))),
  ];
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("Todas");

  const toggleItem = (id: string) => {
    setAbiertos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const preguntasFiltradas =
    categoriaSeleccionada === "Todas"
      ? preguntas
      : preguntas.filter((p) => p.categoria === categoriaSeleccionada);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filtros de categoría accesibles */}
      {mostrarFiltroCategorias && categorias.length > 2 && (
        <div
          role="tablist"
          aria-label="Filtrar preguntas frecuentes por tema"
          className="flex flex-wrap items-center gap-2 pb-2"
        >
          {categorias.map((cat) => {
            const esActiva = categoriaSeleccionada === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={esActiva}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={cn(
                  "min-h-[40px] px-4 py-2 rounded-pildora text-caption font-medio transition-colors duration-mov-rapido",
                  "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                  esActiva
                    ? "bg-accion-fondo text-accion-texto shadow-sm"
                    : "bg-fondo-superficie border border-borde-suave text-texto-secundario hover:bg-morado-50 hover:text-texto-principal",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Lista del acordeón */}
      <div
        className="space-y-3"
        role="region"
        aria-label="Lista de preguntas y respuestas"
      >
        {preguntasFiltradas.map((item) => {
          const estaAbierto = Boolean(abiertos[item.id]);
          const respuestaId = `faq-respuesta-${item.id}`;
          const botonId = `faq-boton-${item.id}`;

          return (
            <div
              key={item.id}
              className="rounded-m border border-borde-suave bg-fondo-superficie transition-colors duration-mov-rapido overflow-hidden shadow-xs"
            >
              <h3>
                <button
                  type="button"
                  id={botonId}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={estaAbierto}
                  aria-controls={respuestaId}
                  className="w-full min-h-[52px] p-4 sm:p-5 text-left font-medio text-p text-texto-principal hover:bg-morado-50 flex items-center justify-between gap-4 transition-colors duration-mov-rapido focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2"
                >
                  <span className="flex items-start gap-3">
                    <HelpCircle
                      className="w-5 h-5 text-morado-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-texto">{item.pregunta}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-texto-secundario shrink-0 transition-transform duration-mov-medio",
                      estaAbierto && "rotate-180 text-morado-600",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              {estaAbierto && (
                <div
                  id={respuestaId}
                  role="region"
                  aria-labelledby={botonId}
                  className="px-5 pb-5 pt-1 text-p text-texto-principal leading-texto border-t border-morado-50"
                >
                  <p className="max-w-[70ch]">{item.respuesta}</p>

                  {item.enlace && (
                    <div className="pt-3">
                      <Link
                        href={item.enlace.url}
                        className="inline-flex items-center gap-1.5 text-texto-enlace hover:underline font-medio text-caption focus-visible:outline-3 focus-visible:outline-foco rounded-s"
                      >
                        <span>{item.enlace.texto}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
