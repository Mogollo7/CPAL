import React from "react";
import { Phone, PhoneCall } from "lucide-react";
import { cn } from "../cn";

export interface BotonLlamarProps {
  /** Nombre de la línea (p. ej. "Línea de emergencias", "Línea 106") */
  nombre: string;
  /** Número de teléfono para el enlace tel: (puede ser null o vacío si está en borrador) */
  telefono?: string | null;
  /** Horario de disponibilidad (p. ej. "24 horas", "Lunes a viernes 8am - 5pm") */
  horario?: string;
  /** Si el número u horario no ha sido formalmente verificado por el CAPL */
  porConfirmar?: boolean;
  /** Variante visual de la tarjeta de llamada */
  variante?: "principal" | "alerta" | "secundario";
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Botón accesible y táctil para llamadas de emergencia (tel:)
 *
 * Cumple con RNF-ACC-03 / WCAG AA:
 * - Área táctil mínima de 48px (min-h-[48px]).
 * - Foco visible de 3px con desplazamiento.
 * - Manejo explícito de números nulos, vacíos o marcados como porConfirmar.
 */
export function BotonLlamar({
  nombre,
  telefono,
  horario,
  porConfirmar = false,
  variante = "principal",
  className,
}: BotonLlamarProps) {
  const tieneNumeroValido = Boolean(telefono && telefono.trim().length > 0);
  const telefonoLimpio = tieneNumeroValido
    ? telefono!.replace(/[^\d+]/g, "")
    : "";

  const estilosBase =
    "min-h-[48px] px-5 py-3 rounded-m transition-colors duration-mov-rapido inline-flex items-center justify-between gap-3 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 select-none";

  const estilosVariante = {
    principal:
      "bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo active:bg-accion-fondo-activo",
    alerta:
      "bg-ayuda-fondo text-ayuda-texto hover:bg-amarillo-300 active:bg-amarillo-700 active:text-blanco",
    secundario:
      "bg-fondo-superficie text-texto-principal border border-borde-suave hover:bg-fondo-suave active:bg-morado-100",
  }[variante];

  // Si no hay teléfono o está por confirmar, se visibiliza el aviso requerido
  const etiquetaEstado =
    !tieneNumeroValido || porConfirmar ? "Número pendiente de confirmar" : null;

  if (!tieneNumeroValido) {
    return (
      <div
        className={cn(
          estilosBase,
          "bg-morado-50 border border-borde-suave text-texto-secundario cursor-not-allowed opacity-90",
          className,
        )}
        role="status"
        aria-label={`${nombre}: Número pendiente de confirmar`}
      >
        <div className="flex items-center gap-3">
          <Phone
            className="w-5 h-5 shrink-0 text-texto-secundario"
            aria-hidden="true"
          />
          <div className="flex flex-col text-left">
            <span className="font-medio text-p text-texto-principal">
              {nombre}
            </span>
            <span className="text-caption font-normal text-tinta-suave">
              Número pendiente de confirmar
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`tel:${telefonoLimpio}`}
      className={cn(estilosBase, estilosVariante, className)}
      aria-label={`Llamar a ${nombre} al teléfono ${telefono}${
        etiquetaEstado ? `. ${etiquetaEstado}` : ""
      }${horario ? `. Horario: ${horario}` : ""}`}
    >
      <div className="flex items-center gap-3">
        <PhoneCall className="w-5 h-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col text-left">
          <span className="font-medio text-p leading-titulo">
            {nombre} · <strong className="font-fuerte">{telefono}</strong>
          </span>
          {etiquetaEstado ? (
            <span className="text-caption font-normal opacity-90">
              {etiquetaEstado}
            </span>
          ) : horario ? (
            <span className="text-caption font-normal opacity-90">
              {horario}
            </span>
          ) : null}
        </div>
      </div>
      <span className="text-caption font-medio underline decoration-1 underline-offset-2 shrink-0">
        Llamar
      </span>
    </a>
  );
}
