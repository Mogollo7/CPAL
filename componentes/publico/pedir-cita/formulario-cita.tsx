"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/componentes/cn";
import { TransicionSuave } from "@/componentes/atomos/transicion-suave";
import type { CitaCreada } from "@/contratos/cita";
import { SIN_CONEXION } from "@/contratos/resultado";
import { crearCitaAccion } from "@/servidor/acciones";
import { aEntrada } from "./entrada";
import { PasoConfirmar } from "./paso-confirmar";
import { PasoDatos } from "./paso-datos";
import { PasoHorario } from "./paso-horario";
import { PasoParaQuien } from "./paso-para-quien";
import { PasoServicio } from "./paso-servicio";
import {
  TOTAL_PASOS,
  type Borrador,
  type ServicioDelFormulario,
} from "./piezas";
import { SolicitudRecibida } from "./solicitud-recibida";

const NOMBRES_PASOS = [
  "Servicio",
  "Para quién",
  "Horario",
  "Tus datos",
  "Confirmación",
];

const VACIO: Omit<Borrador, "servicioId"> = {
  paraQuien: "PROPIA",
  pacienteNombre: "",
  pacienteDocumento: "",
  pacienteEdad: "",
  acudienteNombre: "",
  acudienteDocumento: "",
  psicologoId: "",
  psicologoNombre: "",
  inicio: "",
  solicitanteNombre: "",
  solicitanteDocumento: "",
  solicitanteCorreo: "",
  solicitanteTelefono: "",
  motivo: "",
  sitioWeb: "",
  aceptaTratamiento: false,
};

/** /pedir-cita (RF-CIT-01): 5 pasos y la pantalla de solicitud recibida. Cada paso vive en su archivo. */
export function FormularioCita({
  servicios,
}: {
  servicios: ServicioDelFormulario[];
}) {
  // ?servicio=slug llega desde «Pedir cita» en /servicios.
  const slug = useSearchParams().get("servicio");
  const [datos, setDatos] = useState<Borrador>(() => ({
    ...VACIO,
    servicioId:
      (servicios.find((s) => s.slug === slug) ?? servicios[0])?.id ?? "",
  }));
  const cambiar = (parcial: Partial<Borrador>) =>
    setDatos((d) => ({ ...d, ...parcial }));

  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [avisoHorario, setAvisoHorario] = useState<string | null>(null);
  const [creada, setCreada] = useState<CitaCreada | null>(null);

  const ir = (n: number) => {
    setError(null);
    setPaso(n);
  };

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const r = await crearCitaAccion(aEntrada(datos));
      if (r.ok) return setCreada(r.datos);
      if (r.codigo === "CUPO_OCUPADO" || r.codigo === "FUERA_DE_RANGO") {
        // Otra persona tomó el horario mientras llenaba: volver a elegir con la lista al día.
        cambiar({ inicio: "" });
        setAvisoHorario(r.mensaje);
        return ir(3);
      }
      if (r.codigo === "VALIDACION" && r.campos) {
        setErrores(r.campos);
        setError(r.mensaje);
        return ir(4);
      }
      setError(r.mensaje);
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setEnviando(false);
    }
  };

  if (creada)
    return (
      <div className="mx-auto max-w-[900px] rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-10 shadow-xs">
        <TransicionSuave key="exito" direccion="arriba">
          <SolicitudRecibida cita={creada} correo={datos.solicitanteCorreo} />
        </TransicionSuave>
      </div>
    );

  const servicio = servicios.find((s) => s.id === datos.servicioId);

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <div aria-label="Progreso del formulario" className="space-y-4">
        <div className="flex items-center justify-between text-caption font-medio text-texto-secundario">
          <span className="text-morado-900 font-fuerte">
            Paso {paso} de {TOTAL_PASOS}: {NOMBRES_PASOS[paso - 1]}
          </span>
        </div>
        <div
          className="h-2 w-full bg-morado-50 rounded-pildora overflow-hidden"
          role="progressbar"
          aria-valuenow={paso}
          aria-valuemin={1}
          aria-valuemax={TOTAL_PASOS}
        >
          <div
            className="h-full bg-morado-600 transition-all duration-mov-medio ease-entrada rounded-pildora"
            style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }}
          />
        </div>
        <ol className="hidden sm:grid grid-cols-5 gap-2 pt-1 text-center">
          {NOMBRES_PASOS.map((nombre, i) => (
            <li
              key={nombre}
              aria-current={paso === i + 1 ? "step" : undefined}
              className={cn(
                "text-caption font-medio py-1 px-2 rounded-s",
                paso === i + 1 && "text-morado-900 font-fuerte bg-morado-100",
                paso > i + 1 && "text-agua-700",
                paso < i + 1 && "text-tinta-suave",
              )}
            >
              {i + 1}. {nombre}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-10 shadow-xs">
        <TransicionSuave key={paso} direccion="arriba">
          {paso === 1 && (
            <PasoServicio
              datos={datos}
              cambiar={cambiar}
              servicios={servicios}
              alSeguir={() => ir(2)}
            />
          )}
          {paso === 2 && (
            <PasoParaQuien
              datos={datos}
              cambiar={cambiar}
              alVolver={() => ir(1)}
              alSeguir={() => ir(3)}
            />
          )}
          {paso === 3 && (
            <PasoHorario
              datos={datos}
              cambiar={cambiar}
              aviso={avisoHorario}
              alVolver={() => ir(2)}
              alSeguir={() => {
                setAvisoHorario(null);
                ir(4);
              }}
            />
          )}
          {paso === 4 && (
            <PasoDatos
              datos={datos}
              cambiar={cambiar}
              errores={errores}
              alVolver={() => ir(3)}
              alSeguir={() => {
                setErrores({});
                ir(5);
              }}
            />
          )}
          {paso === 5 && (
            <PasoConfirmar
              datos={datos}
              cambiar={cambiar}
              servicio={servicio?.nombre ?? ""}
              psicologo={
                datos.psicologoNombre || "Cualquier profesional disponible"
              }
              enviando={enviando}
              error={error}
              alVolver={() => ir(4)}
              alEnviar={enviar}
            />
          )}
        </TransicionSuave>
      </div>
    </div>
  );
}
