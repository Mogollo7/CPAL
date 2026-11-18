import type { EstadoCita } from "@/contratos/cita";
import { cn } from "@/componentes/ui/cn";

interface PildoraEstadoProps {
  estado: EstadoCita;
  className?: string;
}

export const CONFIG_ESTADOS: Record<
  EstadoCita,
  { label: string; estilos: string; punto: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    estilos: "bg-aviso-fondo text-amarillo-700 border-amarillo-500/30",
    punto: "bg-amarillo-500",
  },
  AUTORIZADA: {
    label: "Autorizada",
    estilos: "bg-exito-fondo text-agua-700 border-agua-500/30",
    punto: "bg-agua-500",
  },
  RECHAZADA: {
    label: "Rechazada",
    estilos: "bg-error-fondo text-error-texto border-coral-700/20",
    punto: "bg-coral-700",
  },
  CANCELADA: {
    label: "Cancelada",
    estilos: "bg-fondo-suave text-texto-secundario border-borde-suave",
    punto: "bg-texto-secundario",
  },
  ATENDIDA: {
    label: "Atendida",
    estilos: "bg-morado-100 text-morado-700 border-morado-300",
    punto: "bg-morado-600",
  },
  NO_ASISTIO: {
    label: "No asistió",
    estilos: "bg-error-fondo text-error-texto border-coral-700/20",
    punto: "bg-coral-700",
  },
  VENCIDA: {
    label: "Vencida",
    estilos: "bg-fondo-suave text-texto-secundario/60 border-borde-suave line-through",
    punto: "bg-texto-secundario/40",
  },
};

export function PildoraEstado({ estado, className }: PildoraEstadoProps) {
  const config = CONFIG_ESTADOS[estado] || {
    label: estado,
    estilos: "bg-fondo-suave text-texto-secundario border-borde-suave",
    punto: "bg-texto-secundario",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pildora text-caption font-weight-medio border shadow-2xs whitespace-nowrap",
        config.estilos,
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-circulo", config.punto)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
