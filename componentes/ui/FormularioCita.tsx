"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Video,
  User,
  Users,
  Baby,
  AlertTriangle,
  Home,
} from "lucide-react";
import { TransicionSuave } from "./transicion-suave";
import { cn } from "./cn";
import serviciosData from "../../contenido/servicios.json";
import citasSimuladas from "../../contenido/citas-simuladas.json";
import type { Servicios } from "../../contratos/servicio-contenido";

const datosServicios = serviciosData as Servicios;

// Filtramos solo los servicios que se pueden agendar en línea
const serviciosAgendables = datosServicios.servicios.filter(
  (s) => s.agendableEnLinea,
);

export function FormularioCita() {
  const searchParams = useSearchParams();
  const servicioParam = searchParams.get("servicio");

  // Estado del paso actual (1 al 5; 6 = pantalla de éxito)
  const [paso, setPaso] = useState<number>(1);

  // Datos del formulario
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>(
    () => {
      if (servicioParam) {
        const existe = serviciosAgendables.find(
          (s) => s.slug === servicioParam,
        );
        if (existe) return existe.slug;
      }
      return serviciosAgendables[0]?.slug || "";
    },
  );
  const [paraQuien, setParaQuien] = useState<
    "PROPIA" | "OTRA_PERSONA" | "MENOR"
  >("PROPIA");

  // Datos de menores o terceros
  const [pacienteNombre, setPacienteNombre] = useState<string>("");
  const [pacienteDocumento, setPacienteDocumento] = useState<string>("");
  const [pacienteEdad, setPacienteEdad] = useState<string>("");
  const [acudienteNombre, setAcudienteNombre] = useState<string>("");
  const [acudienteDocumento, setAcudienteDocumento] = useState<string>("");
  const [acudienteParentesco, setAcudienteParentesco] =
    useState<string>("Madre");

  // Paso 3: Modalidad, Psicólogo y Horario
  const [modalidad, setModalidad] = useState<string>("presencial");
  const [psicologoId, setPsicologoId] = useState<string>("cualquiera");
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(
    citasSimuladas.diasDisponibles[0]?.fecha || "",
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState<{
    hora: string;
    iso: string;
  } | null>(() => {
    const primerDia = citasSimuladas.diasDisponibles[0];
    const primeraHora = primerDia?.horas.find((h) => h.disponible);
    return primeraHora
      ? { hora: primeraHora.hora, iso: primeraHora.iso }
      : null;
  });

  const cambiarDia = (nuevoDia: string) => {
    setDiaSeleccionado(nuevoDia);
    const diaObj = citasSimuladas.diasDisponibles.find(
      (d) => d.fecha === nuevoDia,
    );
    const primeraHora = diaObj?.horas.find((h) => h.disponible);
    setHoraSeleccionada(
      primeraHora ? { hora: primeraHora.hora, iso: primeraHora.iso } : null,
    );
  };

  // Paso 4: Datos de contacto del solicitante
  const [solicitanteNombre, setSolicitanteNombre] = useState<string>("");
  const [solicitanteTipoDoc, setSolicitanteTipoDoc] = useState<string>("CC");
  const [solicitanteDocumento, setSolicitanteDocumento] = useState<string>("");
  const [solicitanteCorreo, setSolicitanteCorreo] = useState<string>("");
  const [solicitanteTelefono, setSolicitanteTelefono] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [sitioWeb, setSitioWeb] = useState<string>(""); // Honeypot antispam

  // Paso 5: Consentimiento y envío
  const [aceptaTratamiento, setAceptaTratamiento] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [radicado, setRadicado] = useState<string>("CAPL-7K3F");

  // Objeto con el servicio elegido actualmente
  const servicioActual =
    serviciosAgendables.find((s) => s.slug === servicioSeleccionado) ||
    serviciosAgendables[0];

  // Objeto con el psicólogo seleccionado
  const psicologoActual =
    citasSimuladas.psicologos.find((p) => p.id === psicologoId) ||
    citasSimuladas.psicologos[0];

  // Validaciones para habilitar el botón "Siguiente"
  const puedeAvanzarPaso1 = Boolean(servicioSeleccionado);

  const puedeAvanzarPaso2 =
    paraQuien === "PROPIA"
      ? true
      : paraQuien === "OTRA_PERSONA"
        ? Boolean(pacienteNombre.trim() && pacienteDocumento.trim())
        : Boolean(
            pacienteNombre.trim() &&
            pacienteDocumento.trim() &&
            acudienteNombre.trim() &&
            acudienteDocumento.trim(),
          );

  const puedeAvanzarPaso3 = Boolean(
    horaSeleccionada && diaSeleccionado && modalidad,
  );

  const puedeAvanzarPaso4 = Boolean(
    solicitanteNombre.trim() &&
    solicitanteDocumento.trim() &&
    solicitanteCorreo.includes("@") &&
    solicitanteTelefono.trim().length >= 7,
  );

  const puedeEnviar = aceptaTratamiento && !enviando && sitioWeb.length === 0;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) return;

    setEnviando(true);
    setErrorEnvio(null);

    try {
      // Simulación de envío según contrato
      await new Promise((res) => setTimeout(res, 800));
      const radicadoGenerado = `CAPL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setRadicado(radicadoGenerado);
      setPaso(6); // Pantalla de éxito
    } catch {
      setErrorEnvio(
        "Ocurrió un error temporal al registrar tu solicitud. Intenta nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const pasosNombres = [
    "Servicio",
    "Consultante",
    "Horario",
    "Tus datos",
    "Confirmación",
  ];

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      {/* Barra de Progreso y Pasos (1 al 5) */}
      {paso <= 5 && (
        <div aria-label="Progreso del formulario" className="space-y-4">
          <div className="flex items-center justify-between text-caption font-medio text-texto-secundario">
            <span className="text-morado-900 font-fuerte">
              Paso {paso} de 5: {pasosNombres[paso - 1]}
            </span>
            <span>{Math.round((paso / 5) * 100)}% completado</span>
          </div>

          <div
            className="h-2 w-full bg-morado-50 rounded-pildora overflow-hidden"
            role="progressbar"
            aria-valuenow={paso}
            aria-valuemin={1}
            aria-valuemax={5}
          >
            <div
              className="h-full bg-morado-600 transition-all duration-mov-medio ease-entrada rounded-pildora"
              style={{ width: `${(paso / 5) * 100}%` }}
            />
          </div>

          {/* Stepper visual discreto */}
          <div className="hidden sm:grid grid-cols-5 gap-2 pt-1 text-center">
            {pasosNombres.map((nombrePaso, idx) => {
              const num = idx + 1;
              const esActual = paso === num;
              const esCompletado = paso > num;
              return (
                <div
                  key={num}
                  className={cn(
                    "text-caption font-medio py-1 px-2 rounded-s transition-colors duration-mov-rapido",
                    esActual && "text-morado-900 font-fuerte bg-morado-100",
                    esCompletado && "text-agua-700",
                    !esActual && !esCompletado && "text-tinta-suave",
                  )}
                >
                  <span>
                    {num}. {nombrePaso}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DEL PASO */}
      <div className="rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-10 shadow-xs">
        {/* ============================================================ */}
        {/* PASO 1: SELECCIÓN DEL SERVICIO */}
        {/* ============================================================ */}
        {paso === 1 && (
          <TransicionSuave key="paso-1" direccion="arriba">
            <div className="space-y-6">
              <div className="border-b border-borde-suave pb-4">
                <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
                  Paso 1 de 5
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">
                  ¿Qué servicio necesitas agendar?
                </h2>
                <p className="text-p text-texto-secundario mt-1">
                  Selecciona el tipo de atención psicológica o neuropsicológica
                  que requieres.
                </p>
              </div>

              <div
                className="grid grid-cols-1 gap-4"
                role="radiogroup"
                aria-label="Selecciona un servicio agendable"
              >
                {serviciosAgendables.map((serv) => {
                  const seleccionado = servicioSeleccionado === serv.slug;
                  return (
                    <button
                      key={serv.slug}
                      type="button"
                      role="radio"
                      aria-checked={seleccionado}
                      onClick={() => setServicioSeleccionado(serv.slug)}
                      className={cn(
                        "w-full p-5 rounded-m border text-left transition-colors duration-mov-rapido flex items-start justify-between gap-4",
                        "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                        seleccionado
                          ? "border-morado-600 bg-morado-50/80 shadow-xs ring-1 ring-morado-600"
                          : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                      )}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-caption font-medio text-morado-700 bg-morado-100 px-2.5 py-0.5 rounded-pildora">
                            {serv.area === "NEUROPSICOLOGIA"
                              ? "Neuropsicología"
                              : "Psicología"}
                          </span>
                          <span className="text-caption text-agua-700 font-medio">
                            100% Gratuito
                          </span>
                        </div>
                        <h3 className="text-h2 font-medio text-texto-titulo">
                          {serv.nombre}
                        </h3>
                        <p className="text-p text-texto-principal leading-texto">
                          {serv.descripcion}
                        </p>
                        <p className="text-caption text-tinta-suave pt-1">
                          <strong>Para quién:</strong> {serv.paraQuien}
                        </p>
                      </div>

                      <div className="shrink-0 mt-1">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-circulo border-2 flex items-center justify-center transition-colors",
                            seleccionado
                              ? "border-morado-600 bg-morado-600 text-blanco"
                              : "border-borde bg-blanco",
                          )}
                        >
                          {seleccionado && (
                            <span className="w-2 h-2 rounded-circulo bg-blanco" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!puedeAvanzarPaso1}
                  onClick={() => setPaso(2)}
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </TransicionSuave>
        )}

        {/* ============================================================ */}
        {/* PASO 2: ¿PARA QUIÉN ES LA CITA? */}
        {/* ============================================================ */}
        {paso === 2 && (
          <TransicionSuave key="paso-2" direccion="arriba">
            <div className="space-y-6">
              <div className="border-b border-borde-suave pb-4">
                <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
                  Paso 2 de 5
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">
                  ¿Para quién es la cita?
                </h2>
                <p className="text-p text-texto-secundario mt-1">
                  La legislación de salud colombiana requiere registrar con
                  precisión si la atención es personal, para otra persona o para
                  un menor de edad.
                </p>
              </div>

              {/* Opciones de destinatario */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setParaQuien("PROPIA")}
                  className={cn(
                    "p-5 rounded-m border text-left flex flex-col justify-between gap-3 transition-colors",
                    "focus-visible:outline-3 focus-visible:outline-foco",
                    paraQuien === "PROPIA"
                      ? "border-morado-600 bg-morado-50 shadow-xs ring-1 ring-morado-600"
                      : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                  )}
                >
                  <User
                    className="w-6 h-6 text-morado-600"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-fuerte text-p text-texto-titulo">
                      Para mí
                    </h3>
                    <p className="text-caption text-texto-secundario mt-1">
                      Soy la persona que asistirá a la sesión.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setParaQuien("OTRA_PERSONA")}
                  className={cn(
                    "p-5 rounded-m border text-left flex flex-col justify-between gap-3 transition-colors",
                    "focus-visible:outline-3 focus-visible:outline-foco",
                    paraQuien === "OTRA_PERSONA"
                      ? "border-morado-600 bg-morado-50 shadow-xs ring-1 ring-morado-600"
                      : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                  )}
                >
                  <Users
                    className="w-6 h-6 text-morado-600"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-fuerte text-p text-texto-titulo">
                      Otra persona adulta
                    </h3>
                    <p className="text-caption text-texto-secundario mt-1">
                      Agendo para un familiar o allegado mayor de 18 años.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setParaQuien("MENOR")}
                  className={cn(
                    "p-5 rounded-m border text-left flex flex-col justify-between gap-3 transition-colors",
                    "focus-visible:outline-3 focus-visible:outline-foco",
                    paraQuien === "MENOR"
                      ? "border-morado-600 bg-morado-50 shadow-xs ring-1 ring-morado-600"
                      : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                  )}
                >
                  <Baby
                    className="w-6 h-6 text-morado-600"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-fuerte text-p text-texto-titulo">
                      Menor de edad
                    </h3>
                    <p className="text-caption text-texto-secundario mt-1">
                      Niño, niña o adolescente menor de 18 años.
                    </p>
                  </div>
                </button>
              </div>

              {/* Formulario condicional para OTRA PERSONA */}
              {paraQuien === "OTRA_PERSONA" && (
                <div className="rounded-m bg-crema border border-borde-suave p-6 space-y-4">
                  <h3 className="font-fuerte text-p text-texto-titulo">
                    Datos del paciente (persona que asistirá)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="paciente-nombre"
                        className="block text-caption font-medio text-texto-principal mb-1"
                      >
                        Nombre completo del paciente *
                      </label>
                      <input
                        id="paciente-nombre"
                        type="text"
                        required
                        value={pacienteNombre}
                        onChange={(e) => setPacienteNombre(e.target.value)}
                        placeholder="Ej. Carlos Restrepo"
                        className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="paciente-doc"
                        className="block text-caption font-medio text-texto-principal mb-1"
                      >
                        Documento de identidad *
                      </label>
                      <input
                        id="paciente-doc"
                        type="text"
                        required
                        value={pacienteDocumento}
                        onChange={(e) => setPacienteDocumento(e.target.value)}
                        placeholder="Número de cédula o documento"
                        className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario condicional para MENOR DE EDAD */}
              {paraQuien === "MENOR" && (
                <div className="rounded-m bg-crema border border-borde-suave p-6 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-fuerte text-p text-texto-titulo">
                      Datos del menor de edad
                    </h3>
                    <p className="text-caption text-tinta-suave">
                      Debe acudir a la cita presencial en compañía de su
                      acudiente legal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="menor-nombre"
                        className="block text-caption font-medio text-texto-principal mb-1"
                      >
                        Nombre completo del menor *
                      </label>
                      <input
                        id="menor-nombre"
                        type="text"
                        required
                        value={pacienteNombre}
                        onChange={(e) => setPacienteNombre(e.target.value)}
                        placeholder="Nombre y apellidos"
                        className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="menor-edad"
                        className="block text-caption font-medio text-texto-principal mb-1"
                      >
                        Edad (años) *
                      </label>
                      <input
                        id="menor-edad"
                        type="number"
                        min="1"
                        max="17"
                        value={pacienteEdad}
                        onChange={(e) => setPacienteEdad(e.target.value)}
                        placeholder="Ej. 14"
                        className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                      />
                    </div>
                  </div>

                  <div className="border-t border-borde-suave pt-4 space-y-3">
                    <h4 className="font-fuerte text-p text-texto-titulo">
                      Datos del padre, madre o acudiente legal responsable *
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="acudiente-nombre"
                          className="block text-caption font-medio text-texto-principal mb-1"
                        >
                          Nombre completo del acudiente *
                        </label>
                        <input
                          id="acudiente-nombre"
                          type="text"
                          required
                          value={acudienteNombre}
                          onChange={(e) => setAcudienteNombre(e.target.value)}
                          placeholder="Nombre del adulto responsable"
                          className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="acudiente-parentesco"
                          className="block text-caption font-medio text-texto-principal mb-1"
                        >
                          Parentesco *
                        </label>
                        <select
                          id="acudiente-parentesco"
                          value={acudienteParentesco}
                          onChange={(e) =>
                            setAcudienteParentesco(e.target.value)
                          }
                          className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                        >
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Tutor legal">
                            Tutor / Representante legal
                          </option>
                          <option value="Abuelo/a">Abuelo / Abuela</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="acudiente-doc"
                          className="block text-caption font-medio text-texto-principal mb-1"
                        >
                          Documento de identidad del acudiente *
                        </label>
                        <input
                          id="acudiente-doc"
                          type="text"
                          required
                          value={acudienteDocumento}
                          onChange={(e) =>
                            setAcudienteDocumento(e.target.value)
                          }
                          placeholder="Cédula de ciudadanía o documento"
                          className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botonera de navegación */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="min-h-[48px] px-6 py-2.5 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  disabled={!puedeAvanzarPaso2}
                  onClick={() => setPaso(3)}
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors"
                >
                  <span>Continuar a horario</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </TransicionSuave>
        )}

        {/* ============================================================ */}
        {/* PASO 3: MODALIDAD, PROFESIONAL Y HORARIO */}
        {/* ============================================================ */}
        {paso === 3 && (
          <TransicionSuave key="paso-3" direccion="arriba">
            <div className="space-y-6">
              <div className="border-b border-borde-suave pb-4">
                <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
                  Paso 3 de 5
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">
                  Modalidad, profesional y horario
                </h2>
                <p className="text-p text-texto-secundario mt-1">
                  Elige cómo y cuándo deseas tener tu sesión de atención.
                </p>
              </div>

              {/* 1. Modalidad */}
              <div className="space-y-3">
                <label className="block text-p font-fuerte text-texto-titulo">
                  1. Modalidad de atención
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {citasSimuladas.modalidades.map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setModalidad(mod.id)}
                      className={cn(
                        "p-4 rounded-m border text-left flex items-start gap-3 transition-colors",
                        "focus-visible:outline-3 focus-visible:outline-foco",
                        modalidad === mod.id
                          ? "border-morado-600 bg-morado-50 ring-1 ring-morado-600"
                          : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                      )}
                    >
                      {mod.id === "presencial" ? (
                        <MapPin
                          className="w-5 h-5 text-morado-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Video
                          className="w-5 h-5 text-morado-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <h3 className="font-medio text-p text-texto-titulo">
                          {mod.nombre}
                        </h3>
                        <p className="text-caption text-texto-secundario mt-1">
                          {mod.descripcion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Profesional */}
              <div className="space-y-3 pt-2">
                <label
                  htmlFor="selector-psicologo"
                  className="block text-p font-fuerte text-texto-titulo"
                >
                  2. Profesional de tu preferencia
                </label>
                <select
                  id="selector-psicologo"
                  value={psicologoId}
                  onChange={(e) => setPsicologoId(e.target.value)}
                  className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal font-medio focus-visible:outline-3 focus-visible:outline-foco"
                >
                  {citasSimuladas.psicologos.map((psi) => (
                    <option key={psi.id} value={psi.id}>
                      {psi.nombre} · {psi.presentacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Selección de Día y Hora */}
              <div className="space-y-4 pt-2 border-t border-morado-50">
                <label className="block text-p font-fuerte text-texto-titulo">
                  3. Selecciona la fecha y hora disponible
                </label>

                {/* Píldoras de Días */}
                <div
                  role="tablist"
                  aria-label="Días disponibles para atención"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  {citasSimuladas.diasDisponibles.map((dia) => {
                    const seleccionado = diaSeleccionado === dia.fecha;
                    return (
                      <button
                        key={dia.fecha}
                        type="button"
                        role="tab"
                        aria-selected={seleccionado}
                        onClick={() => cambiarDia(dia.fecha)}
                        className={cn(
                          "min-h-[48px] p-3 rounded-m border text-center transition-colors",
                          "focus-visible:outline-3 focus-visible:outline-foco",
                          seleccionado
                            ? "bg-accion-fondo text-accion-texto font-medio border-accion-fondo shadow-xs"
                            : "bg-fondo-superficie border-borde-suave text-texto-principal hover:bg-morado-50",
                        )}
                      >
                        <span className="block text-caption font-normal opacity-90">
                          {dia.diaSemana}
                        </span>
                        <span className="block font-fuerte text-p">
                          {dia.fecha.slice(8)} nov
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Franjas Horarias */}
                <div className="space-y-2 pt-2">
                  <span className="text-caption font-medio text-texto-secundario">
                    Horas disponibles para el día seleccionado:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {citasSimuladas.diasDisponibles
                      .find((d) => d.fecha === diaSeleccionado)
                      ?.horas.map((slot) => {
                        const seleccionada = horaSeleccionada?.iso === slot.iso;
                        return (
                          <button
                            key={slot.iso}
                            type="button"
                            disabled={!slot.disponible}
                            onClick={() =>
                              setHoraSeleccionada({
                                hora: slot.hora,
                                iso: slot.iso,
                              })
                            }
                            className={cn(
                              "min-h-[48px] px-4 py-2.5 rounded-m border text-center font-medio text-p transition-colors flex items-center justify-center gap-2",
                              "focus-visible:outline-3 focus-visible:outline-foco",
                              seleccionada
                                ? "bg-morado-900 text-blanco border-morado-900 shadow-xs"
                                : slot.disponible
                                  ? "bg-blanco border-borde text-texto-principal hover:bg-morado-50"
                                  : "bg-morado-50 border-borde-suave text-tinta-suave/50 cursor-not-allowed line-through",
                            )}
                          >
                            <Clock
                              className="w-4 h-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{slot.hora}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Botonera de navegación */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  className="min-h-[48px] px-6 py-2.5 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  disabled={!puedeAvanzarPaso3}
                  onClick={() => setPaso(4)}
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors"
                >
                  <span>Continuar a tus datos</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </TransicionSuave>
        )}

        {/* ============================================================ */}
        {/* PASO 4: DATOS DE CONTACTO Y MOTIVO */}
        {/* ============================================================ */}
        {paso === 4 && (
          <TransicionSuave key="paso-4" direccion="arriba">
            <div className="space-y-6">
              <div className="border-b border-borde-suave pb-4">
                <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
                  Paso 4 de 5
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">
                  Tus datos de contacto
                </h2>
                <p className="text-p text-texto-secundario mt-1">
                  Enviaremos la confirmación oficial y el recordatorio a tu
                  correo electrónico.
                </p>
              </div>

              {/* Campo trampa antispam honeypot */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="campo-trampa">No llenes este campo:</label>
                <input
                  id="campo-trampa"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={sitioWeb}
                  onChange={(e) => setSitioWeb(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="sol-nombre"
                    className="block text-caption font-medio text-texto-principal mb-1"
                  >
                    Nombre completo del solicitante *
                  </label>
                  <input
                    id="sol-nombre"
                    type="text"
                    required
                    value={solicitanteNombre}
                    onChange={(e) => setSolicitanteNombre(e.target.value)}
                    placeholder="Ej. María Fernanda Ospina"
                    className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="sol-tipodoc"
                      className="block text-caption font-medio text-texto-principal mb-1"
                    >
                      Tipo de documento *
                    </label>
                    <select
                      id="sol-tipodoc"
                      value={solicitanteTipoDoc}
                      onChange={(e) => setSolicitanteTipoDoc(e.target.value)}
                      className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                    >
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="CE">Cédula de extranjería</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="sol-doc"
                      className="block text-caption font-medio text-texto-principal mb-1"
                    >
                      Número de documento *
                    </label>
                    <input
                      id="sol-doc"
                      type="text"
                      required
                      value={solicitanteDocumento}
                      onChange={(e) => setSolicitanteDocumento(e.target.value)}
                      placeholder="Sin puntos ni comas"
                      className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sol-correo"
                      className="block text-caption font-medio text-texto-principal mb-1"
                    >
                      Correo electrónico *
                    </label>
                    <input
                      id="sol-correo"
                      type="email"
                      required
                      value={solicitanteCorreo}
                      onChange={(e) => setSolicitanteCorreo(e.target.value)}
                      placeholder="nombre@correo.com"
                      className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sol-tel"
                      className="block text-caption font-medio text-texto-principal mb-1"
                    >
                      Teléfono celular / WhatsApp *
                    </label>
                    <input
                      id="sol-tel"
                      type="tel"
                      required
                      value={solicitanteTelefono}
                      onChange={(e) => setSolicitanteTelefono(e.target.value)}
                      placeholder="Ej. 300 123 4567"
                      className="w-full min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="sol-motivo"
                      className="text-caption font-medio text-texto-principal"
                    >
                      Motivo de consulta (Opcional)
                    </label>
                    <span className="text-caption text-tinta-suave">
                      Máx. 300 caracteres
                    </span>
                  </div>
                  <textarea
                    id="sol-motivo"
                    rows={3}
                    maxLength={300}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Cuéntanos brevemente qué te motiva a consultar (puedes dejarlo vacío si prefieres hablarlo en la sesión)..."
                    className="w-full p-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco resize-none"
                  />
                  <p className="text-caption text-tinta-suave mt-1">
                    * Tu motivo se guarda con cifrado estricto y no se comparte
                    por correo electrónico.
                  </p>
                </div>
              </div>

              {/* Botonera de navegación */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setPaso(3)}
                  className="min-h-[48px] px-6 py-2.5 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  disabled={!puedeAvanzarPaso4}
                  onClick={() => setPaso(5)}
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors"
                >
                  <span>Revisar y confirmar</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </TransicionSuave>
        )}

        {/* ============================================================ */}
        {/* PASO 5: RESUMEN, CONSENTIMIENTO Y CONFIRMACIÓN */}
        {/* ============================================================ */}
        {paso === 5 && (
          <TransicionSuave key="paso-5" direccion="arriba">
            <form onSubmit={manejarEnvio} className="space-y-6">
              <div className="border-b border-borde-suave pb-4">
                <span className="text-caption font-medio uppercase tracking-wider text-morado-700">
                  Paso 5 de 5
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-1">
                  Revisa y confirma tu solicitud
                </h2>
                <p className="text-p text-texto-secundario mt-1">
                  Verifica que los datos ingresados sean correctos antes de
                  enviar tu solicitud de cita.
                </p>
              </div>

              {/* Alerta de urgencias */}
              <div
                role="alert"
                className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-4 text-p text-tinta flex items-start gap-3"
              >
                <AlertTriangle
                  className="w-5 h-5 text-amarillo-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-caption leading-texto">
                  <strong>Recuerda:</strong> El CAPL no es un servicio de
                  urgencias médicas ni de crisis en tiempo real. Si estás en
                  peligro inmediato o tienes pensamientos de autolesión,
                  comunícate ya con la{" "}
                  <Link
                    href="/ayuda-inmediata"
                    className="text-morado-900 font-fuerte underline"
                  >
                    Línea 123 o consulta la Guía de Ayuda Inmediata
                  </Link>
                  .
                </div>
              </div>

              {/* Tarjeta de Resumen estructurado */}
              <div className="rounded-m bg-crema border border-borde-suave p-6 space-y-4">
                <h3 className="font-fuerte text-p text-texto-titulo border-b border-morado-100 pb-2">
                  Resumen de la cita solicitada
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-p">
                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Servicio:
                    </span>
                    <strong className="font-medio text-texto-titulo">
                      {servicioActual.nombre}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Destinatario:
                    </span>
                    <strong className="font-medio text-texto-titulo">
                      {paraQuien === "PROPIA"
                        ? "Personal (Para mí)"
                        : paraQuien === "OTRA_PERSONA"
                          ? `Otra persona: ${pacienteNombre}`
                          : `Menor de edad: ${pacienteNombre} (Acudiente: ${acudienteNombre})`}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Fecha y hora:
                    </span>
                    <strong className="font-medio text-texto-titulo">
                      {diaSeleccionado} · {horaSeleccionada?.hora}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Modalidad:
                    </span>
                    <strong className="font-medio text-texto-titulo capitalize">
                      {modalidad === "presencial"
                        ? "Presencial (Casa Amarilla)"
                        : "Virtual"}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Profesional:
                    </span>
                    <strong className="font-medio text-texto-titulo">
                      {psicologoActual.nombre}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-caption text-tinta-suave font-normal">
                      Notificaciones a:
                    </span>
                    <strong className="font-medio text-texto-titulo">
                      {solicitanteCorreo}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Casilla de Tratamiento de Datos (Obligatoria) */}
              <div className="rounded-m bg-fondo-superficie border border-borde-suave p-5 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={aceptaTratamiento}
                    onChange={(e) => setAceptaTratamiento(e.target.checked)}
                    className="w-5 h-5 rounded-s border-borde text-morado-600 focus:ring-morado-600 shrink-0 mt-0.5"
                  />
                  <span className="text-caption text-texto-principal leading-texto">
                    Acepto la{" "}
                    <Link
                      href="/politica-datos"
                      target="_blank"
                      className="text-texto-enlace font-medio underline decoration-1 underline-offset-2"
                    >
                      Política de Tratamiento de Datos Personales
                    </Link>{" "}
                    del CAPL conforme a la Ley 1581 de 2012 de Colombia,
                    autorizando el uso de mis datos exclusivamente para
                    coordinar y notificar esta cita.
                  </span>
                </label>
              </div>

              {errorEnvio && (
                <div
                  role="alert"
                  className="p-4 rounded-m bg-error-fondo text-error-texto text-caption font-medio"
                >
                  {errorEnvio}
                </div>
              )}

              {/* Botonera de confirmación */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setPaso(4)}
                  className="min-h-[48px] px-6 py-2.5 rounded-m border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  disabled={!puedeEnviar}
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo disabled:opacity-50 font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco transition-colors"
                >
                  {enviando ? (
                    <span>Procesando solicitud...</span>
                  ) : (
                    <>
                      <CalendarPlus
                        className="w-5 h-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Pedir mi cita</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </TransicionSuave>
        )}

        {/* ============================================================ */}
        {/* PANTALLA 6: CONFIRMACIÓN DE ÉXITO CÁLIDA */}
        {/* ============================================================ */}
        {paso === 6 && (
          <TransicionSuave key="paso-exito" direccion="arriba">
            <div className="text-center space-y-6 py-6 sm:py-8">
              <div className="w-16 h-16 rounded-circulo bg-agua-100 text-agua-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
              </div>

              <div className="space-y-2 max-w-[65ch] mx-auto">
                <span className="text-caption font-medio uppercase tracking-wider text-agua-700 bg-agua-100 px-3 py-1 rounded-pildora">
                  Solicitud registrada con éxito
                </span>
                <h2 className="text-h1 font-fuerte text-texto-titulo mt-2">
                  ¡Hemos recibido tu solicitud de cita!
                </h2>
                <p className="text-p text-texto-secundario leading-texto">
                  Gracias por dar este paso para tu bienestar. Nuestro equipo de
                  coordinación revisará la asignación y te enviará un correo
                  institucional de confirmación.
                </p>
              </div>

              {/* Número de Radicado ficticio */}
              <div className="p-6 rounded-m bg-crema border border-morado-100 max-w-[500px] mx-auto space-y-2">
                <span className="text-caption text-tinta-suave block">
                  Código de radicado de tu solicitud:
                </span>
                <span className="font-fuerte text-h1 text-morado-900 tracking-wider block font-mono">
                  {radicado}
                </span>
                <p className="text-caption text-tinta-suave">
                  Guarda este código para cualquier consulta de seguimiento.
                </p>
              </div>

              {/* Qué sigue ahora */}
              <div className="max-w-[600px] mx-auto text-left rounded-m bg-fondo-suave border border-borde-suave p-6 space-y-3">
                <h3 className="font-fuerte text-p text-texto-titulo flex items-center gap-2">
                  <Clock
                    className="w-5 h-5 text-morado-600"
                    aria-hidden="true"
                  />
                  <span>¿Qué pasará a continuación?</span>
                </h3>
                <ul className="space-y-2 text-p text-texto-principal">
                  <li className="flex items-start gap-2">
                    <span className="text-agua-700 font-fuerte">•</span>
                    <span>
                      En un plazo habitual de{" "}
                      <strong>24 a 48 horas hábiles</strong> recibirás un correo
                      en <strong>{solicitanteCorreo}</strong> con el enlace
                      personal para gestionar tu cita.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-agua-700 font-fuerte">•</span>
                    <span>
                      Si necesitas cancelar o reprogramar, podrás hacerlo con un
                      solo clic directamente desde tu correo sin costo alguno.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-agua-700 font-fuerte">•</span>
                    <span>
                      Te esperamos en la Casa Amarilla de Unilasallista (Caldas,
                      Antioquia).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Botones de acción posterior */}
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="min-h-[48px] px-8 py-3 rounded-m bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo font-medio text-p inline-flex items-center gap-2 shadow-sm focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <Home className="w-5 h-5" aria-hidden="true" />
                  <span>Volver al inicio</span>
                </Link>

                <Link
                  href="/como-funciona"
                  className="min-h-[48px] px-6 py-3 rounded-m bg-fondo-superficie border border-borde-suave text-texto-principal hover:bg-morado-50 font-medio text-p inline-flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-foco"
                >
                  <span>Recomendaciones para tu cita</span>
                </Link>
              </div>
            </div>
          </TransicionSuave>
        )}
      </div>
    </div>
  );
}
