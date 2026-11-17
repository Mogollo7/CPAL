// Pasos de la tarea programada (S05). Cada uno es idempotente: ejecutarlo dos veces no duplica nada.
// Reciben `ahora` para poder probarlos adelantando la fecha (T-328).
import { bd } from "../bd";
import { auditar } from "../auditoria";
import { registrar } from "../registro";
import { encolarPlantilla } from "../correo/enviar";

const H = 3_600_000;
const DIA = 24 * H;

/** Citas PENDIENTE con `venceEn` cumplido → VENCIDA (libera el cupo: la restricción anti cruce solo cuenta PENDIENTE y
 *  AUTORIZADA) y avisa a la persona. T-322.
 *  ponytail: el cambio de estado va directo con Prisma; unificar con `transicionar()` de servidor/citas cuando exista. */
export async function vencerSolicitudes(ahora: Date): Promise<number> {
  const citas = await bd.cita.findMany({
    where: { estado: "PENDIENTE", venceEn: { lte: ahora } },
    select: { id: true },
    take: 100, // si quedan más, la siguiente vuelta sigue
  });
  let vencidas = 0;
  for (const { id } of citas) {
    const hecho = await bd.$transaction(async (tx) => {
      // El estado debe seguir siendo PENDIENTE: si administración la autorizó justo ahora, no se toca.
      const r = await tx.cita.updateMany({
        where: { id, estado: "PENDIENTE", venceEn: { lte: ahora } },
        data: { estado: "VENCIDA", venceEn: null },
      });
      if (!r.count) return false;
      await auditar(
        { accion: "CITA_VENCIDA", entidad: "cita", entidadId: id },
        tx,
      );
      await encolarPlantilla("cita-vencida", { citaId: id }, {}, tx);
      return true;
    });
    if (hecho) {
      vencidas++;
      registrar("cita.vencida", { entidad: `cita:${id}`, rol: "sistema" });
    }
  }
  return vencidas;
}

/** Citas AUTORIZADA que empiezan entre 23 y 25 horas y sin recordatorio → encola el correo y marca `recordatorioEn`. T-323. */
export async function enviarRecordatorios(ahora: Date): Promise<number> {
  const citas = await bd.cita.findMany({
    where: {
      estado: "AUTORIZADA",
      recordatorioEn: null,
      anonimizadaEn: null,
      inicio: {
        gte: new Date(ahora.getTime() + 23 * H),
        lte: new Date(ahora.getTime() + 25 * H),
      },
    },
    select: { id: true },
    take: 100,
  });
  let enviados = 0;
  for (const { id } of citas) {
    const hecho = await bd.$transaction(async (tx) => {
      // Marcar y encolar juntos: una sola vuelta gana aunque dos corran a la vez.
      const r = await tx.cita.updateMany({
        where: { id, estado: "AUTORIZADA", recordatorioEn: null },
        data: { recordatorioEn: ahora },
      });
      if (!r.count) return false;
      await encolarPlantilla("recordatorio", { citaId: id }, {}, tx);
      return true;
    });
    if (hecho) enviados++;
  }
  return enviados;
}

// SUPUESTO(P-16): conservación de 12 meses (E03), configurable en Configuracion.conservacionMeses.
const CONSERVACION_MESES = 12;

const conservacionMeses = async () =>
  (await bd.configuracion.findUnique({ where: { id: 1 } }))
    ?.conservacionMeses ?? CONSERVACION_MESES;

const restarMeses = (d: Date, meses: number) => {
  const r = new Date(d);
  r.setUTCMonth(r.getUTCMonth() - meses);
  return r;
};

/** Citas con `inicio` anterior al plazo de conservación: se vacían los datos personales y se marca `anonimizadaEn`.
 *  Quedan servicio, psicólogo, fecha y estado para estadísticas (E02). RNF-PRI-06 / T-328. */
export async function anonimizarCitas(ahora: Date): Promise<number> {
  const limite = restarMeses(ahora, await conservacionMeses());
  const r = await bd.cita.updateMany({
    where: { inicio: { lt: limite }, anonimizadaEn: null },
    data: {
      solicitanteNombre: null,
      solicitanteCorreo: null,
      solicitanteTelefono: null,
      pacienteNombre: null,
      pacienteDocumento: null,
      pacienteEdad: null,
      acudienteNombre: null,
      acudienteDocumento: null,
      motivo: null,
      motivoRechazo: null, // lo escribe administración y puede nombrar a la persona
      anonimizadaEn: ahora,
    },
  });
  if (r.count)
    await auditar({
      accion: "CITAS_ANONIMIZADAS",
      entidad: "cita",
      entidadId: "lote",
      detalle: { cantidad: r.count },
    });
  return r.count;
}

/** Tokens vencidos hace más de 7 días, trabajos terminados hace más de 30, códigos y dispositivos vencidos, e inscripciones
 *  de eventos terminados hace más del plazo de conservación (E03 §9, paso 5). */
export async function limpiar(ahora: Date) {
  const hace = (dias: number) => new Date(ahora.getTime() - dias * DIA);
  const limite = restarMeses(ahora, await conservacionMeses());
  const [tokens, trabajos, codigos, dispositivos, inscripciones] =
    await Promise.all([
      bd.tokenAcceso.deleteMany({ where: { venceEn: { lt: hace(7) } } }),
      bd.trabajo.deleteMany({
        where: { estado: "HECHO", hechoEn: { lt: hace(30) } },
      }),
      bd.codigoAcceso.deleteMany({ where: { venceEn: { lt: ahora } } }),
      bd.dispositivoConfiable.deleteMany({ where: { venceEn: { lt: ahora } } }),
      bd.inscripcion.deleteMany({
        where: {
          evento: {
            OR: [
              { fin: { lt: limite } },
              { fin: null, inicio: { lt: limite } },
            ],
          },
        },
      }),
    ]);
  return {
    tokens: tokens.count,
    trabajos: trabajos.count,
    codigos: codigos.count,
    dispositivos: dispositivos.count,
    inscripciones: inscripciones.count,
  };
}
