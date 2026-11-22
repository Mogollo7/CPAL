import type { ReactNode } from "react";
import Link from "next/link";
import { claseBoton } from "@/componentes/atomos/boton";
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
    <div className="space-y-3">
      <span className="sr-only">
        Paso {paso} de {TOTAL_PASOS}
      </span>
      <h2 className="font-titulo text-seccion font-fuerte text-texto-titulo">
        {titulo}
      </h2>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-h2 text-texto-secundario">{children}</p>
        <Link
          href="/ayuda-inmediata"
          className="font-medio text-texto-enlace hover:underline"
        >
          ¿Necesitas ayuda inmediata?
        </Link>
      </div>
    </div>
  );
}

const CLASE_ATRAS = claseBoton("borde");
export const CLASE_PRINCIPAL = claseBoton("principal", "min-w-[125px]");

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
    <div className="flex items-center justify-between gap-4 pt-5">
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
