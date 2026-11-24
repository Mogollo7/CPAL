"use client";

import React from "react";
import { cn } from "../cn";

export interface EsqueletoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tono de fondo suave:
   * - "morado": serenidad y reposo (por defecto)
   * - "salvia": biofilia y alivio parasimpático
   * - "crema": neutro cálido de baja fatiga
   */
  varianteTono?: "morado" | "salvia" | "crema";
  /** Si es circular (para avatares o iconos de mascotas) */
  circular?: boolean;
}

/**
 * Esqueleto Calmo (Neuro-Relajante)
 *
 * Diseñado bajo principios de psicología cognitiva y sensorial:
 * 1. Pulso lento (3.0s de ciclo) que emula la respiración en reposo, evitando
 *    la alerta de un barrido o shimmer acelerado.
 * 2. Contraste mínimo entre capas para proteger ojos fatigados o con fotofobia por estrés.
 * 3. Bordes redondeados orgánicos para reducir la reactividad amigdalina.
 */
export function EsqueletoCalmo({
  className,
  varianteTono = "morado",
  circular = false,
  ...props
}: EsqueletoProps) {
  const estilosTono = {
    morado: "bg-[#EFEBF5]/70 text-[#8D79A6]",
    salvia: "bg-[#E6F3EE]/70 text-[#8FC1B0]",
    crema: "bg-[#F3EFE6]/80 text-[#B8A9C9]",
  }[varianteTono];

  return (
    <div
      aria-hidden="true"
      role="status"
      className={cn(
        "relative overflow-hidden transition-colors duration-500",
        circular ? "rounded-full" : "rounded-2xl",
        estilosTono,
        "capl-pulso-respiracion",
        className,
      )}
      {...props}
    >
      <span className="sr-only">Cargando contenido con calma...</span>
    </div>
  );
}

/**
 * Esqueleto para párrafos de texto con anchos naturales variables
 * para prevenir saltos acumulativos de diseño (CLS).
 */
export function EsqueletoParrafo({
  lineas = 3,
  className,
  varianteTono = "morado",
}: {
  lineas?: number;
  className?: string;
  varianteTono?: "morado" | "salvia" | "crema";
}) {
  const anchos = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-2/3"];

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lineas }).map((_, i) => (
        <EsqueletoCalmo
          key={i}
          varianteTono={varianteTono}
          className={cn("h-4 rounded-md", anchos[i % anchos.length])}
        />
      ))}
    </div>
  );
}

/**
 * Esqueleto para tarjetas de cita o servicios del CAPL
 */
export function EsqueletoTarjetaCita({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl border border-[#DCD3EA]/40 bg-[#FAF7F2] shadow-xs flex flex-col gap-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <EsqueletoCalmo circular className="w-12 h-12" />
        <div className="flex-1 flex flex-col gap-1.5">
          <EsqueletoCalmo className="w-3/5 h-4" />
          <EsqueletoCalmo className="w-2/5 h-3" />
        </div>
      </div>
      <EsqueletoParrafo lineas={2} />
      <div className="pt-2 flex justify-between items-center">
        <EsqueletoCalmo className="w-24 h-6 rounded-full" />
        <EsqueletoCalmo className="w-28 h-8 rounded-full" />
      </div>
    </div>
  );
}
