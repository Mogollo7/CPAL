import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PARA_QUIEN } from "@/contratos/cita";
import type { ServicioPublico } from "@/contratos/servicio";

export const TOTAL_PASOS = 5;

/** Servicio de la BD + el texto «para quién» de contenido/servicios.json (por slug). */
export type ServicioDelFormulario = ServicioPublico & { paraQuien?: string };

/** Lo que la persona va llenando. Todo texto, como sale de los campos; se convierte al enviar. */
export type Borrador = {
  servicioId: string;
  paraQuien: (typeof PARA_QUIEN)[number];
  pacienteNombre: string;
  pacienteDocumento: string;
  pacienteEdad: string;
  acudienteNombre: string;
  acudienteDocumento: string;
  psicologoId: string; // "" = cualquier psicólogo disponible
  psicologoNombre: string; // solo para el resumen; no se envía
  inicio: string; // ISO del cupo elegido
  solicitanteNombre: string;
  solicitanteDocumento: string; // solo «para mí»: es el documento del paciente
  solicitanteCorreo: string;
  solicitanteTelefono: string;
  motivo: string;
  sitioWeb: string; // campo trampa: debe quedar vacío
  aceptaTratamiento: boolean;
};

export type PropsPaso = {
  datos: Borrador;
  cambiar: (parcial: Partial<Borrador>) => void;
};

export function EncabezadoPaso({
  paso,
  titulo,
  children,
}: {
  paso: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-borde-suave pb-4">
      <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
        Paso {paso} de {TOTAL_PASOS}
      </span>
      <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">{titulo}</h2>
      <p className="text-p text-texto-secundario mt-1">{children}</p>
    </div>
  );
}

const CLASE_ATRAS =
  "min-h-[48px] px-6 py-2.5 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco";
export const CLASE_PRINCIPAL =
  "min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors";

/** Atrás / Continuar al pie de cada paso. Sin `alVolver` (paso 1) solo se muestra Continuar. */
export function Navegacion({
  alVolver,
  alSeguir,
  puedeSeguir,
  texto,
}: {
  alVolver?: () => void;
  alSeguir: () => void;
  puedeSeguir: boolean;
  texto: string;
}) {
  return (
    <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
      {alVolver ? <BotonAtras alVolver={alVolver} /> : <span />}
      <button
        type="button"
        disabled={!puedeSeguir}
        onClick={alSeguir}
        className={CLASE_PRINCIPAL}
      >
        <span>{texto}</span>
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function BotonAtras({ alVolver }: { alVolver: () => void }) {
  return (
    <button type="button" onClick={alVolver} className={CLASE_ATRAS}>
      <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      <span>Atrás</span>
    </button>
  );
}
