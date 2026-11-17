// Carga de la BD lo que cada plantilla necesita y la renderiza (E06). El trabajo en la cola solo lleva ids (S05): los
// datos personales se leen AL ENVIAR y nunca viajan en `Trabajo.datos`. Devuelve null cuando ya no hay nada que enviar
// (cita anonimizada, cancelada entretanto, enlace usado…): el trabajo se da por hecho.
import { bd } from "../bd";
import { renderizar, type NombrePlantilla } from "../../correos/indice";
import { rutaCita } from "./enlaces";
import type { Correo } from "../externos/resend";

export type DatosCorreo = Omit<Correo, "llave" | "trabajoId">;

/** Lo que otros módulos pasan al encolar, por plantilla (ids; nada más). */
export type Payloads = {
  "solicitud-recibida": { citaId: string };
  "nueva-solicitud": { citaId: string };
  "cita-autorizada": { citaId: string };
  "cita-no-autorizada": { citaId: string };
  "cita-vencida": { citaId: string };
  "cita-cancelada": {
    citaId: string;
    canceladaPor: "persona" | "capl";
    motivo?: string;
  };
  "cita-cancelada-psicologo": { citaId: string };
  "cita-nueva-psicologo": { citaId: string };
  recordatorio: { citaId: string };
  invitacion: { tokenId: string; token: string };
  "recuperar-clave": { tokenId: string; token: string };
  "inscripcion-evento": { inscripcionId: string };
  "codigo-ingreso": { usuarioId: string; codigo: string };
  "aviso-ingreso": { usuarioId: string; navegador: string; cuando?: string };
};

type Cargado = { para: string; datos: unknown } | null;

const cargarCita = (id: string) =>
  bd.cita.findUnique({
    where: { id },
    include: { servicio: true, psicologo: true },
  });
type Cita = NonNullable<Awaited<ReturnType<typeof cargarCita>>>;

// SUPUESTO: si aún no existe la fila de Configuracion, valen los valores por defecto de E03.
const config = async () =>
  (await bd.configuracion.findUnique({ where: { id: 1 } })) ?? {
    vencimientoPendienteHoras: 48,
    cancelacionMinHoras: 12,
    correoAdministracion: process.env.CORREO_RESPUESTA ?? "",
  };

/** Cita y destinatario solicitante; null si fue anonimizada o no tiene correo. */
const delSolicitante = (c: Cita) =>
  c.anonimizadaEn || !c.solicitanteCorreo
    ? null
    : { para: c.solicitanteCorreo, nombre: c.solicitanteNombre ?? "" };

const delPsicologo = (c: Cita) => ({
  para: c.psicologo.correo,
  nombrePsicologo: c.psicologo.nombre,
});

async function conCita(
  p: { citaId: string },
  f: (c: Cita) => Cargado | Promise<Cargado>,
): Promise<Cargado> {
  const c = await cargarCita(p.citaId);
  return c ? f(c) : null;
}

const cargadores: {
  [N in NombrePlantilla]: (p: Payloads[N]) => Promise<Cargado>;
} = {
  "solicitud-recibida": (p) =>
    conCita(p, async (c) => {
      const s = delSolicitante(c);
      if (!s) return null;
      return {
        para: s.para,
        datos: {
          nombre: s.nombre,
          servicio: c.servicio.nombre,
          inicio: c.inicio,
          psicologo: c.psicologo.nombre,
          codigo: c.codigo,
          plazoHoras: (await config()).vencimientoPendienteHoras,
          rutaGestion: rutaCita(c.id),
          reprogramada: !!c.reprogramadaDeId,
        },
      };
    }),
  "nueva-solicitud": (p) =>
    conCita(p, async (c) => {
      const para = (await config()).correoAdministracion;
      if (!para) return null;
      return {
        para,
        datos: {
          citaId: c.id,
          codigo: c.codigo,
          servicio: c.servicio.nombre,
          inicio: c.inicio,
          psicologo: c.psicologo.nombre,
          venceEn: c.venceEn,
        },
      };
    }),
  "cita-autorizada": (p) =>
    conCita(p, async (c) => {
      const s = delSolicitante(c);
      if (!s || c.estado !== "AUTORIZADA") return null;
      return {
        para: s.para,
        datos: {
          citaId: c.id,
          nombre: s.nombre,
          inicio: c.inicio,
          fin: c.fin,
          psicologo: c.psicologo.nombre,
          rutaGestion: rutaCita(c.id),
          cancelacionMinHoras: (await config()).cancelacionMinHoras,
        },
      };
    }),
  "cita-no-autorizada": (p) =>
    conCita(p, (c) => {
      const s = delSolicitante(c);
      return s
        ? {
            para: s.para,
            datos: {
              nombre: s.nombre,
              inicio: c.inicio,
              motivo: c.motivoRechazo,
            },
          }
        : null;
    }),
  "cita-vencida": (p) =>
    conCita(p, (c) => {
      const s = delSolicitante(c);
      return s
        ? { para: s.para, datos: { nombre: s.nombre, inicio: c.inicio } }
        : null;
    }),
  "cita-cancelada": (p) =>
    conCita(p, (c) => {
      const s = delSolicitante(c);
      return s
        ? {
            para: s.para,
            datos: {
              nombre: s.nombre,
              inicio: c.inicio,
              canceladaPor: p.canceladaPor,
              motivo: p.motivo,
            },
          }
        : null;
    }),
  "cita-cancelada-psicologo": (p) =>
    conCita(p, (c) => ({
      para: c.psicologo.correo,
      datos: {
        ...delPsicologo(c),
        servicio: c.servicio.nombre,
        inicio: c.inicio,
        codigo: c.codigo,
      },
    })),
  "cita-nueva-psicologo": (p) =>
    conCita(p, (c) =>
      c.estado !== "AUTORIZADA"
        ? null
        : {
            para: c.psicologo.correo,
            datos: {
              ...delPsicologo(c),
              servicio: c.servicio.nombre,
              inicio: c.inicio,
              codigo: c.codigo,
            },
          },
    ),
  recordatorio: (p) =>
    conCita(p, (c) => {
      const s = delSolicitante(c);
      if (!s || c.estado !== "AUTORIZADA") return null;
      return {
        para: s.para,
        datos: {
          nombre: s.nombre,
          inicio: c.inicio,
          psicologo: c.psicologo.nombre,
          rutaGestion: rutaCita(c.id),
        },
      };
    }),
  invitacion: (p) => cargarToken(p),
  "recuperar-clave": (p) => cargarToken(p),
  "inscripcion-evento": async (p) => {
    const i = await bd.inscripcion.findUnique({
      where: { id: p.inscripcionId },
      include: { evento: true },
    });
    if (!i) return null;
    const e = i.evento;
    return {
      para: i.correo,
      datos: {
        nombre: i.nombre,
        eventoId: e.id,
        slug: e.slug,
        evento: e.titulo,
        inicio: e.inicio,
        fin: e.fin,
        lugar: e.lugar,
        enlace: e.enlace,
        descripcion: e.descripcion,
      },
    };
  },
  "codigo-ingreso": async (p) => {
    const u = await bd.usuario.findUnique({ where: { id: p.usuarioId } });
    return u?.activo
      ? { para: u.correo, datos: { nombre: u.nombre, codigo: p.codigo } }
      : null;
  },
  "aviso-ingreso": async (p) => {
    const u = await bd.usuario.findUnique({ where: { id: p.usuarioId } });
    return u?.activo
      ? {
          para: u.correo,
          datos: {
            nombre: u.nombre,
            cuando: p.cuando ? new Date(p.cuando) : new Date(),
            navegador: p.navegador,
          },
        }
      : null;
  },
};

/** Invitación y recuperación: el token en claro viaja en el trabajo (en BD solo está su hash); `datos` se vacía al terminar. */
async function cargarToken(p: {
  tokenId: string;
  token: string;
}): Promise<Cargado> {
  const t = await bd.tokenAcceso.findUnique({
    where: { id: p.tokenId },
    include: { usuario: true },
  });
  if (!t || t.usadoEn || !t.usuario.activo) return null;
  return {
    para: t.usuario.correo,
    datos: {
      nombre: t.usuario.nombre,
      rol: t.usuario.rol,
      token: p.token,
      horas: Math.round(
        (t.venceEn.getTime() - t.creadoEn.getTime()) / 3_600_000,
      ),
    },
  };
}

/** Carga + render. null = nada que enviar. */
export async function prepararCorreo<N extends NombrePlantilla>(
  plantilla: N,
  payload: Payloads[N],
): Promise<DatosCorreo | null> {
  const cargado = await (
    cargadores[plantilla] as (p: Payloads[N]) => Promise<Cargado>
  )(payload);
  if (!cargado) return null;
  const { asunto, html, texto, adjuntos } = renderizar(
    plantilla,
    cargado.datos,
  );
  return { para: cargado.para, asunto, html, texto, adjuntos };
}
