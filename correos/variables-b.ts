import { formatoFechaHora, ZONA } from "../servidor/fechas";
import { fechaCorreo } from "./base";
import { enlaceAbsoluto, RUTAS } from "./centro";
import type { Mapa } from "./variables";

const f = (d: Date, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, ...o }).format(d);
const hora = (d: Date) =>
  f(d, { hour: "2-digit", minute: "2-digit", hour12: false });
const num = (n: number) => new Intl.NumberFormat("es-CO").format(n);
const corto = (d: Date) =>
  `${f(d, { day: "numeric", month: "short" })}, ${hora(d)}`;

export const variablesB: {
  recordatorio: Mapa<"recordatorio">;
  invitacion: Mapa<"invitacion">;
  "recuperar-clave": Mapa<"recuperar-clave">;
  "inscripcion-evento": Mapa<"inscripcion-evento">;
  "aviso-ingreso": Mapa<"aviso-ingreso">;
  "aviso-acceso-emergencia": Mapa<"aviso-acceso-emergencia">;
  "estado-servidor": Mapa<"estado-servidor">;
} = {
  recordatorio: {
    variables: (d) => {
      const fC = fechaCorreo(d.inicio, "Tu sesión de mañana");
      return {
        NOMBRE: d.nombre,
        PSICOLOGO: d.psicologo,
        MES: fC.mes.toLocaleUpperCase("es-CO"),
        DIA: fC.dia,
        HORA: fC.hora,
        DIA_SEMANA: fC.linea,
        URL_CITA: enlaceAbsoluto(d.rutaGestion),
      };
    },
    otros: {
      nombre: "Carlos",
      inicio: new Date("2026-12-09T15:00:00Z"),
      psicologo: "Sebastián Murillo",
      rutaGestion: "/cita/otra.gestion",
    },
  },

  invitacion: {
    variables: (d) => {
      if (d.rol !== "PSICOLOGO" || d.horas !== 48) return null;
      return {
        NOMBRE: d.nombre,
        URL_CREAR_CLAVE: enlaceAbsoluto(RUTAS.crearClave(d.token)),
      };
    },
    otros: {
      nombre: "Carlos",
      rol: "PSICOLOGO",
      token: "token-diferente",
      horas: 48,
    },
  },

  "recuperar-clave": {
    variables: (d) => {
      if (d.horas !== 48) return null;
      return {
        NOMBRE: d.nombre,
        URL_CREAR_CLAVE: enlaceAbsoluto(RUTAS.crearClave(d.token)),
      };
    },
    otros: {
      nombre: "Carlos",
      token: "token-diferente",
      horas: 48,
    },
  },

  "inscripcion-evento": {
    variables: (d) => {
      if (d.enlace) return null;
      return {
        EVENTO: d.evento,
        NOMBRE: d.nombre,
        FECHA_HORA: formatoFechaHora(d.inicio),
        LUGAR: d.lugar,
        DESCRIPCION_EVENTO: d.descripcion,
        URL_EVENTO: enlaceAbsoluto(RUTAS.evento(d.slug)),
      };
    },
    otros: {
      nombre: "Mateo",
      eventoId: "otro-evento",
      slug: "charla-de-ansiedad",
      evento: "Charla de ansiedad",
      inicio: new Date("2026-12-09T15:00:00Z"),
      fin: new Date("2026-12-09T16:30:00Z"),
      lugar: "Casa amarilla del CAPL",
      descripcion: "Un espacio para aprender a gestionar la ansiedad.",
    },
  },

  "aviso-ingreso": {
    variables: (d) => ({
      NOMBRE: d.nombre,
      DISPOSITIVO: d.navegador,
      FECHA_HORA: formatoFechaHora(d.cuando),
    }),
    otros: {
      nombre: "Carlos",
      cuando: new Date("2026-12-09T15:00:00Z"),
      navegador: "Firefox en macOS",
    },
  },

  "aviso-acceso-emergencia": {
    variables: (d) => ({
      NOMBRE: d.nombre,
      NUEVO_ADMIN: d.nuevoNombre,
      FECHA_HORA: formatoFechaHora(d.cuando),
    }),
    otros: {
      nombre: "Mateo",
      nuevoNombre: "Ana Gómez",
      cuando: new Date("2026-12-09T15:00:00Z"),
    },
  },

  "estado-servidor": {
    variables: (d) => {
      const desde = new Date(d.desde);
      const hasta = new Date(d.hasta);
      const ultimo = d.ultimoSondeo ? new Date(d.ultimoSondeo) : null;
      const activo =
        !!ultimo && hasta.getTime() - ultimo.getTime() <= 5 * 60_000;
      const titulo =
        d.disponibilidad === null
          ? "Sin datos todavía"
          : activo
            ? "Servidor operativo"
            : "Servidor sin respuesta";
      const comprobacion = ultimo
        ? `Última comprobación a las ${hora(ultimo)} del ${f(ultimo, { day: "numeric", month: "long" })}.`
        : "Aún no hay comprobaciones registradas.";
      const ventana = `${corto(desde)} – ${corto(hasta)} de ${f(hasta, { year: "numeric" })} · Hora de Colombia`;
      const disponibilidad =
        d.disponibilidad === null
          ? "—"
          : `${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(d.disponibilidad)} %`;
      const incidente = d.incidente
        ? {
            titulo: `${hora(new Date(d.incidente.desde))} – ${hora(new Date(d.incidente.hasta))} · Interrupción resuelta`,
            detalle: `El servicio dejó de responder y volvió a responder a las ${hora(new Date(d.incidente.hasta))}.`,
          }
        : {
            titulo: "Sin interrupciones",
            detalle:
              "No hubo interrupciones de 2 minutos o más en este periodo.",
          };
      const c = d.correos;
      const s = d.seguridad;

      return {
        ESTADO_TITULO: titulo,
        ULTIMA_COMPROBACION: comprobacion,
        VENTANA: ventana,
        DISPONIBILIDAD: disponibilidad,
        MINUTOS_SIN_SERVICIO: `${num(d.minutosSinServicio)} min`,
        LATENCIA_P95:
          d.latenciaP95Ms === null ? "—" : `${num(d.latenciaP95Ms)} ms`,
        INCIDENTE_TITULO: incidente.titulo,
        INCIDENTE_DETALLE: incidente.detalle,
        ENVIADOS: num(c.enviados),
        ENTREGADOS: num(c.entregados),
        REBOTADOS: num(c.rebotados),
        PENDIENTES_ENTREGA: `${num(c.pendientes)} pendientes de entrega`,
        ERRORES_ENVIO: `${num(c.errores)} errores de envío`,
        INGRESOS_OK: num(s.ingresosCorrectos),
        INTENTOS_FALLIDOS: num(s.intentosFallidos),
        CUENTAS_BLOQUEADAS: num(s.cuentasBloqueadas),
        ACCESOS_EMERGENCIA: `${num(s.accesosEmergencia)} accesos de emergencia`,
        ADMINS_CREADOS: `${num(s.administradoresCreados)} cuentas administradoras creadas`,
        URL_MONITOREO: enlaceAbsoluto("/panel/admin/correos"),
      };
    },
    otros: {
      desde: "2026-12-08T14:00:00.000Z",
      hasta: "2026-12-09T14:00:00.000Z",
      disponibilidad: 98.45,
      minutosSinServicio: 12,
      latenciaP95Ms: 210,
      ultimoSondeo: "2026-12-09T13:58:00.000Z",
      incidente: {
        desde: "2026-12-09T08:15:00.000Z",
        hasta: "2026-12-09T08:27:00.000Z",
      },
      correos: {
        enviados: 350,
        entregados: 342,
        rebotados: 5,
        pendientes: 3,
        errores: 2,
      },
      seguridad: {
        ingresosCorrectos: 112,
        intentosFallidos: 9,
        cuentasBloqueadas: 1,
        accesosEmergencia: 2,
        administradoresCreados: 1,
      },
    },
  },
};
