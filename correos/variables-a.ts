import { formatoFechaHora } from "../servidor/fechas";
import { fechaCorreo } from "./base";
import { enlaceAbsoluto, RUTAS } from "./centro";
import type { MapaVariables } from "./variables";

const utc = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

export const variablesA: MapaVariables = {
  "cita-vencida": {
    variables: (d) => ({
      NOMBRE: d.nombre,
      FECHA_HORA: formatoFechaHora(d.inicio),
    }),
    otros: { nombre: "Camila", inicio: new Date("2026-12-09T15:00:00Z") },
  },
  "codigo-ingreso": {
    variables: (d) => ({ NOMBRE: d.nombre, CODIGO: d.codigo }),
    otros: { nombre: "Mateo", codigo: "730164" },
  },
  "cita-autorizada": {
    variables: (d) => {
      if (d.cancelacionMinHoras !== 12) return null;
      const duracion = Math.round(
        (d.fin.getTime() - d.inicio.getTime()) / 60_000,
      );
      const fc = fechaCorreo(d.inicio, "");
      const urlCompleta = enlaceAbsoluto(d.rutaGestion);
      return {
        NOMBRE: d.nombre,
        MES: fc.mes.toLocaleUpperCase("es-CO"),
        DIA: fc.dia,
        HORA: fc.hora,
        DIA_SEMANA: fc.linea,
        DURACION: String(duracion),
        PSICOLOGO: d.psicologo,
        GCAL_FECHAS: `${utc(d.inicio)}%2F${utc(d.fin)}`,
        URL_CITA_CODIFICADA: encodeURIComponent(urlCompleta),
        OUTLOOK_INICIO: encodeURIComponent(d.inicio.toISOString()),
        OUTLOOK_FIN: encodeURIComponent(d.fin.toISOString()),
        URL_CITA: urlCompleta,
      };
    },
    otros: {
      citaId: "otro-id",
      nombre: "Carlos",
      inicio: new Date("2026-12-09T15:00:00Z"),
      fin: new Date("2026-12-09T15:45:00Z"),
      psicologo: "Andrés Felipe",
      rutaGestion: "/cita/otro-id.firma",
      cancelacionMinHoras: 12,
    },
  },
  "cita-no-autorizada": {
    variables: (d) => {
      if (!d.motivo) return null;
      return {
        NOMBRE: d.nombre,
        FECHA_HORA: formatoFechaHora(d.inicio),
        MENSAJE_EQUIPO: d.motivo,
      };
    },
    otros: {
      nombre: "Carlos",
      inicio: new Date("2026-12-09T15:00:00Z"),
      motivo: "El consultorio estará en mantenimiento.",
    },
  },
  "cita-cancelada": {
    variables: (d) => {
      if (d.canceladaPor !== "capl" || !d.motivo) return null;
      return {
        NOMBRE: d.nombre,
        FECHA_HORA: formatoFechaHora(d.inicio),
        MENSAJE_EQUIPO: d.motivo,
      };
    },
    otros: {
      nombre: "Carlos",
      inicio: new Date("2026-12-09T15:00:00Z"),
      canceladaPor: "capl",
      motivo: "El consultorio estará en mantenimiento.",
    },
  },
  "cita-cancelada-psicologo": {
    variables: (d) => {
      const fc = fechaCorreo(d.inicio, "");
      return {
        NOMBRE: d.nombrePsicologo,
        MES: fc.mes.toLocaleUpperCase("es-CO"),
        DIA: fc.dia,
        HORA: fc.hora,
        DIA_SEMANA: fc.linea,
        SERVICIO: d.servicio,
        CODIGO_SOLICITUD: d.codigo,
      };
    },
    otros: {
      nombrePsicologo: "Andrés",
      servicio: "Acompañamiento individual",
      inicio: new Date("2026-12-09T15:00:00Z"),
      codigo: "CAPL-9M2X",
    },
  },
  "cita-nueva-psicologo": {
    variables: (d) => {
      const fc = fechaCorreo(d.inicio, "");
      return {
        NOMBRE: d.nombrePsicologo,
        MES: fc.mes.toLocaleUpperCase("es-CO"),
        DIA: fc.dia,
        HORA: fc.hora,
        DIA_SEMANA: fc.linea,
        SERVICIO: d.servicio,
        CODIGO_SOLICITUD: d.codigo,
      };
    },
    otros: {
      nombrePsicologo: "Andrés",
      servicio: "Acompañamiento individual",
      inicio: new Date("2026-12-09T15:00:00Z"),
      codigo: "CAPL-9M2X",
    },
  },
  "cita-reasignada": {
    variables: (d) => {
      if (!d.autorizada) return null;
      const duracion = Math.round(
        (d.fin.getTime() - d.inicio.getTime()) / 60_000,
      );
      const fc = fechaCorreo(d.inicio, "");
      return {
        NOMBRE: d.nombre,
        MES: fc.mes.toLocaleUpperCase("es-CO"),
        DIA: fc.dia,
        HORA: fc.hora,
        DIA_SEMANA: fc.linea,
        DURACION: String(duracion),
        PSICOLOGO: d.psicologo,
        URL_CITA: enlaceAbsoluto(d.rutaGestion),
      };
    },
    otros: {
      nombre: "Carlos",
      inicio: new Date("2026-12-10T16:00:00Z"),
      fin: new Date("2026-12-10T16:45:00Z"),
      psicologo: "Andrés Felipe",
      rutaGestion: "/cita/otro-id.firma",
      autorizada: true,
    },
  },
  "enlace-cita": {
    variables: (d) => ({
      NOMBRE: d.nombre,
      FECHA_HORA: formatoFechaHora(d.inicio),
      URL_CITA: enlaceAbsoluto(d.rutaGestion),
    }),
    otros: {
      nombre: "Carlos",
      inicio: new Date("2026-12-09T15:00:00Z"),
      rutaGestion: "/cita/otro-enlace",
    },
  },
  "nueva-solicitud": {
    variables: (d) => {
      if (!d.venceEn) return null;
      const fc = fechaCorreo(d.venceEn, "");
      return {
        MES_LIMITE: fc.mes.toLocaleUpperCase("es-CO"),
        DIA_LIMITE: fc.dia,
        HORA_LIMITE: fc.hora,
        DIA_SEMANA_LIMITE: fc.linea,
        SERVICIO: d.servicio,
        PSICOLOGO: d.psicologo,
        FECHA_HORA: formatoFechaHora(d.inicio),
        CODIGO_SOLICITUD: d.codigo,
        URL_PANEL_CITA: enlaceAbsoluto(RUTAS.panelCita(d.citaId)),
      };
    },
    otros: {
      citaId: "otra-cita",
      codigo: "CAPL-9M2X",
      servicio: "Acompañamiento individual",
      inicio: new Date("2026-12-09T15:00:00Z"),
      psicologo: "Andrés Felipe",
      venceEn: new Date("2026-12-07T16:00:00Z"),
    },
  },
  "solicitud-recibida": {
    variables: (d) => {
      if (d.reprogramada || d.plazoHoras !== 48) return null;
      return {
        NOMBRE: d.nombre,
        SERVICIO: d.servicio,
        FECHA_HORA: formatoFechaHora(d.inicio),
        PSICOLOGO: d.psicologo,
        CODIGO_SOLICITUD: d.codigo,
        URL_CITA: enlaceAbsoluto(d.rutaGestion),
      };
    },
    otros: {
      nombre: "Carlos",
      servicio: "Acompañamiento individual",
      inicio: new Date("2026-12-09T15:00:00Z"),
      psicologo: "Andrés Felipe",
      codigo: "CAPL-9M2X",
      plazoHoras: 48,
      rutaGestion: "/cita/otro-id.firma",
    },
  },
};
