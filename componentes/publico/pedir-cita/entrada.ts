import type { CitaEntrada } from "@/contratos/cita";
import type { Borrador } from "./piezas";

const opcional = (t: string) => t.trim() || undefined;

/** Borrador del formulario → entrada de `crearCitaAccion` (forma de `citaSchema`). Solo viaja lo que aplica a
 *  «para quién»: en «para mí» el paciente es quien pide, así que su documento es el del paciente. */
export function aEntrada(d: Borrador): CitaEntrada {
  const propia = d.paraQuien === "PROPIA";
  const menor = d.paraQuien === "MENOR";
  return {
    servicioId: d.servicioId,
    psicologoId: d.psicologoId || undefined,
    inicio: d.inicio,
    paraQuien: d.paraQuien,
    solicitanteNombre: d.solicitanteNombre.trim(),
    solicitanteCorreo: d.solicitanteCorreo.trim(),
    solicitanteTelefono: d.solicitanteTelefono.trim(),
    pacienteNombre: propia ? undefined : opcional(d.pacienteNombre),
    pacienteDocumento: opcional(
      propia ? d.solicitanteDocumento : d.pacienteDocumento,
    ),
    pacienteEdad: menor && d.pacienteEdad ? Number(d.pacienteEdad) : undefined,
    acudienteNombre: menor ? opcional(d.acudienteNombre) : undefined,
    acudienteDocumento: menor ? opcional(d.acudienteDocumento) : undefined,
    motivo: opcional(d.motivo),
    aceptaTratamiento: d.aceptaTratamiento as true,
    sitioWeb: d.sitioWeb,
  };
}
