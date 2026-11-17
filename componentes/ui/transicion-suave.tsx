"use client";

import React from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "./cn";

export interface TransicionSuaveProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Dirección de entrada sutil:
   * - "arriba": sube 8px (la más calmada para contenido)
   * - "abajo": baja 8px
   * - "ninguna": solo opacidad (desvanecimiento puro)
   */
  direccion?: "arriba" | "abajo" | "ninguna";
  /** Retraso en segundos para escalonamiento suave */
  retraso?: number;
  /** Duración en segundos (por defecto 0.42s = mov-lento áureo) */
  duracion?: number;
}

/**
 * Transición Suave de Pantalla y Bloque
 *
 * Basada en la normativa de movimiento del CAPL (N07):
 * - Desplazamiento sutil de máximo 8-10px (evita vértigo vestibular).
 * - Curva de desaceleración sin rebotes: cubic-bezier(0.22, 1, 0.36, 1).
 * - Cumplimiento estricto de prefers-reduced-motion.
 */
export function TransicionSuave({
  children,
  className,
  direccion = "arriba",
  retraso = 0,
  duracion = 0.42,
}: TransicionSuaveProps) {
  const debereducir = useReducedMotion();

  const desplazamientoY = {
    arriba: 8,
    abajo: -8,
    ninguna: 0,
  }[direccion];

  const transicion: Transition = {
    duration: debereducir ? 0.16 : duracion,
    delay: debereducir ? 0 : retraso,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const variantes = {
    oculto: {
      opacity: 0,
      y: debereducir ? 0 : desplazamientoY,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: transicion,
    },
    salida: {
      opacity: 0,
      y: debereducir ? 0 : -desplazamientoY / 2,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    },
  };

  return (
    <motion.div
      initial="oculto"
      animate="visible"
      exit="salida"
      variants={variantes}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
