"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/componentes/cn";
import { EsqueletoCalmo } from "@/componentes/atomos/esqueleto-calmo";
import { IndicadorPasos } from "@/componentes/moleculas/indicador-pasos";
import { TransicionSuave } from "@/componentes/atomos/transicion-suave";
import type { CitaCreada } from "@/contratos/cita";
import { PARA_QUIEN } from "@/contratos/cita";
import { SIN_CONEXION } from "@/contratos/resultado";
import { crearCitaAccion } from "@/servidor/acciones";
import { aEntrada } from "./entrada";
import { PasoConfirmar } from "./paso-confirmar";
import { PasoDatos } from "./paso-datos";
import { PasoHorario } from "./paso-horario";
import { PasoParaQuien } from "./paso-para-quien";
import { PasoServicio } from "./paso-servicio";
import { type Borrador, type ServicioDelFormulario } from "./piezas";
import { SolicitudRecibida } from "./solicitud-recibida";
import pensando from "@/contenido/ilustraciones/cita-pensando.webp";
import adultoMenor from "@/contenido/ilustraciones/cita-adulto-menor.webp";
import notas from "@/contenido/ilustraciones/cita-notas.webp";
import revisa from "@/contenido/ilustraciones/cita-revisa.webp";

const NOMBRES_PASOS = [
  "Servicio",
  "Para quién",
  "Horario",
  "Tus datos",
  "Confirmación",
];

// Figma: cada paso lleva su ilustración a la derecha; el de horario usa todo el ancho.
const ILUSTRACIONES: Record<number, StaticImageData | undefined> = {
  1: pensando,
  2: adultoMenor,
  4: notas,
  5: revisa,
};

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

const CLAVE_BORRADOR = "capl:solicitud-cita:v1";

function recuperarBorrador(
  servicios: ServicioDelFormulario[],
  servicioSolicitado: string,
) {
  const inicial = {
    ...VACIO,
    servicioId: servicioSolicitado || servicios[0]?.id || "",
  };
  try {
    const guardado = JSON.parse(
      sessionStorage.getItem(CLAVE_BORRADOR) ?? "null",
    );
    if (
      guardado?.datos &&
      servicios.some((servicio) => servicio.id === guardado.datos.servicioId)
    ) {
      const datos = {
        ...inicial,
        ...Object.fromEntries(
          Object.entries(inicial)
            .filter(
              ([campo, valor]) =>
                typeof valor === "string" &&
                typeof guardado.datos[campo] === "string",
            )
            .map(([campo]) => [campo, guardado.datos[campo]]),
        ),
      };
      if (!PARA_QUIEN.includes(datos.paraQuien))
        return { datos: inicial, paso: 1 };
      datos.sitioWeb = "";
      if (servicioSolicitado && datos.servicioId !== servicioSolicitado) {
        return {
          datos: {
            ...datos,
            servicioId: servicioSolicitado,
            psicologoId: "",
            psicologoNombre: "",
            inicio: "",
          },
          paso: 1,
        };
      }
      if (!(Date.parse(datos.inicio) > Date.now())) datos.inicio = "";
      const paso =
        Number.isInteger(guardado.paso) &&
        guardado.paso >= 1 &&
        guardado.paso <= NOMBRES_PASOS.length
          ? guardado.paso
          : 1;
      return { datos, paso: datos.inicio ? paso : Math.min(paso, 3) };
    }
  } catch {
    return { datos: inicial, paso: 1 };
  }
  return { datos: inicial, paso: 1 };
}

/** /pedir-cita (RF-CIT-01): 5 pasos y la pantalla de solicitud recibida. Cada paso vive en su archivo. */
export function FormularioCita({
  servicios,
}: {
  servicios: ServicioDelFormulario[];
}) {
  const slug = useSearchParams().get("servicio");
  return (
    <FlujoCita
      key={slug}
      servicios={servicios}
      servicioSolicitado={
        servicios.find((servicio) => servicio.slug === slug)?.id ?? ""
      }
    />
  );
}

function FlujoCita({
  servicios,
  servicioSolicitado,
}: {
  servicios: ServicioDelFormulario[];
  servicioSolicitado: string;
}) {
  const [datos, setDatos] = useState<Borrador>({
    ...VACIO,
    servicioId: servicioSolicitado || servicios[0]?.id || "",
  });
  const cambiar = (parcial: Partial<Borrador>) =>
    setDatos((d) => ({ ...d, ...parcial }));

  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [avisoHorario, setAvisoHorario] = useState<string | null>(null);
  const [creada, setCreada] = useState<CitaCreada | null>(null);
  const [recuperado, setRecuperado] = useState(false);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      const borrador = recuperarBorrador(servicios, servicioSolicitado);
      setDatos(borrador.datos);
      setPaso(borrador.paso);
      setRecuperado(true);
    }, 0);
    return () => window.clearTimeout(temporizador);
  }, [servicios, servicioSolicitado]);

  useEffect(() => {
    if (!recuperado || creada) return;
    try {
      sessionStorage.setItem(
        CLAVE_BORRADOR,
        JSON.stringify({
          paso,
          datos: { ...datos, sitioWeb: "", aceptaTratamiento: false },
        }),
      );
    } catch {
      return;
    }
  }, [recuperado, creada, datos, paso]);

  const ir = (n: number) => {
    setError(null);
    setPaso(n);
  };

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const r = await crearCitaAccion(aEntrada(datos));
      if (r.ok) {
        setCreada(r.datos);
        try {
          sessionStorage.removeItem(CLAVE_BORRADOR);
        } catch {
          return;
        }
        return;
      }
      if (r.codigo === "CUPO_OCUPADO" || r.codigo === "FUERA_DE_RANGO") {
        // Otra persona tomó el horario mientras llenaba: volver a elegir con la lista al día.
        cambiar({ inicio: "" });
        setAvisoHorario(r.mensaje);
        return ir(3);
      }
      if (r.codigo === "VALIDACION" && r.campos) {
        setErrores(r.campos);
        setError(r.mensaje);
        return setPaso(4);
      }
      setError(r.mensaje);
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setEnviando(false);
    }
  };

  if (!recuperado)
    return (
      <div aria-busy="true" aria-label="Cargando formulario de cita">
        <EsqueletoCalmo className="mx-auto h-[460px] max-w-[900px] rounded-l" />
      </div>
    );

  if (creada)
    return (
      <div className="mx-auto max-w-[900px]">
        <TransicionSuave key="exito" direccion="arriba">
          <SolicitudRecibida cita={creada} correo={datos.solicitanteCorreo} />
        </TransicionSuave>
      </div>
    );

  const servicio = servicios.find((s) => s.id === datos.servicioId);

  return (
    <div className="mx-auto max-w-[1100px] space-y-bloque">
      <IndicadorPasos pasos={NOMBRES_PASOS} actual={paso} />

      <div
        className={cn(
          "grid items-start gap-bloque",
          ILUSTRACIONES[paso] && "md:grid-cols-[1fr_400px]",
        )}
      >
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
            <>
              {error && (
                <p
                  role="alert"
                  className="mb-4 rounded-m bg-error-fondo p-4 text-caption text-error-texto"
                >
                  {error}
                </p>
              )}
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
            </>
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
        {ILUSTRACIONES[paso] && (
          <Image
            src={ILUSTRACIONES[paso]}
            alt=""
            sizes="375px"
            className="mx-auto hidden w-full max-w-[375px] md:block"
          />
        )}
      </div>
    </div>
  );
}
