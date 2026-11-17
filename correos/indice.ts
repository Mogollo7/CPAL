// Registro de plantillas: nombre (el de E06) → { render, ejemplo }. Quien encola un correo usa SOLO estos nombres.
import type { CorreoRender } from "./base";
import * as solicitudRecibida from "./solicitud-recibida";
import * as nuevaSolicitud from "./nueva-solicitud";
import * as citaAutorizada from "./cita-autorizada";
import * as citaNoAutorizada from "./cita-no-autorizada";
import * as citaVencida from "./cita-vencida";
import * as citaCancelada from "./cita-cancelada";
import * as citaCanceladaPsicologo from "./cita-cancelada-psicologo";
import * as citaNuevaPsicologo from "./cita-nueva-psicologo";
import * as recordatorio from "./recordatorio";
import * as invitacion from "./invitacion";
import * as recuperarClave from "./recuperar-clave";
import * as inscripcionEvento from "./inscripcion-evento";
import * as codigoIngreso from "./codigo-ingreso";
import * as avisoIngreso from "./aviso-ingreso";
import * as avisoAccesoEmergencia from "./aviso-acceso-emergencia";
import * as citaReasignada from "./cita-reasignada";

export const plantillas = {
  "solicitud-recibida": solicitudRecibida,
  "nueva-solicitud": nuevaSolicitud,
  "cita-autorizada": citaAutorizada,
  "cita-no-autorizada": citaNoAutorizada,
  "cita-vencida": citaVencida,
  "cita-cancelada": citaCancelada,
  "cita-cancelada-psicologo": citaCanceladaPsicologo,
  "cita-nueva-psicologo": citaNuevaPsicologo,
  recordatorio,
  invitacion,
  "recuperar-clave": recuperarClave,
  "inscripcion-evento": inscripcionEvento,
  "codigo-ingreso": codigoIngreso,
  "aviso-ingreso": avisoIngreso,
  // Fuera de E06 (añadidas después):
  "aviso-acceso-emergencia": avisoAccesoEmergencia,
  "cita-reasignada": citaReasignada,
};

export type NombrePlantilla = keyof typeof plantillas;
export const NOMBRES = Object.keys(plantillas) as NombrePlantilla[];
export const esPlantilla = (n: string): n is NombrePlantilla => n in plantillas;

/** Resuelve nombre → render(datos). `datos` ya trae todo lo que la plantilla muestra (lo carga `servidor/correo`). */
export const renderizar = (n: NombrePlantilla, datos: unknown): CorreoRender =>
  (plantillas[n].render as (d: unknown) => CorreoRender)(datos);
