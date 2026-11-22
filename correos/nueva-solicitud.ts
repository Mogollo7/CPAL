import { plantillaBase, fechaCorreo } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

// Sin datos del paciente: se ven en el panel.
export type Datos = {
  citaId: string;
  codigo: string;
  servicio: string;
  inicio: Date;
  psicologo: string;
  venceEn: Date | null;
};

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-calendario",
    tono: "#efeefb",
    disposicion: "fila",
    asunto: "Nueva solicitud de cita por revisar",
    titulo: "Una solicitud por revisar",
    ...(d.venceEn
      ? { fecha: fechaCorreo(d.venceEn, "Responder antes de") }
      : {}),
    datos: [
      { rotulo: "Servicio", valor: d.servicio },
      { rotulo: "Profesional", valor: d.psicologo },
      { rotulo: "Horario solicitado", valor: formatoFechaHora(d.inicio) },
    ],
    pie_datos: `Solicitud ${d.codigo}`,
    parrafos: [
      d.venceEn
        ? "Revisa los datos y responde antes de que venza el plazo."
        : "Revisa los datos de la solicitud y responde desde el panel.",
    ],
    boton: { texto: "Revisar en el panel", ruta: RUTAS.panelCita(d.citaId) },
  });

export const ejemplo: Datos = {
  citaId: "ejemplo",
  codigo: "CAPL-7K3F",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  psicologo: "Laura Gómez",
  venceEn: new Date("2026-11-22T19:30:00Z"),
};
