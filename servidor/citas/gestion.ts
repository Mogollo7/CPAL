// Gestionar una cita desde el enlace firmado, sin cuenta (RF-CIT-11, RF-CIT-13): ver, cancelar y reprogramar.
// `ENLACE_INVALIDO` es la misma respuesta para firma alterada y para cita inexistente: no revela si existe.
import {
  reprogramarSchema,
  type CitaCreada,
  type CitaPublica,
  type EstadoCita,
} from "../../contratos/cita";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { registrar, type Evento } from "../registro";
import { despachar } from "./correos";
import { enlaceDeCita, idDeToken } from "./enlace";
import { cuposDeServicio, leerConfig } from "./datos";
import {
  estadoInicial,
  insertarCita,
  personaDe,
  registrarCreacion,
} from "./crear";
import { decidir, transicionar } from "./estados";

// SUPUESTO(P-xx): dirección del CAPL de 01-Contexto; el contenido definitivo del lugar lo confirma el CAPL.
export const LUGAR =
  "Casa amarilla del CAPL, Carrera 51 # 118 Sur – 57, Caldas (Antioquia)";
const HORA_MS = 3_600_000;
const log = (evento: Evento, id: string) =>
  registrar(evento, { entidad: `cita:${id}`, resultado: "ok" });
const INVALIDO = fallo(
  "ENLACE_INVALIDO",
  "Este enlace no es válido. Si lo necesitas, escríbenos y te ayudamos.",
);

/** Sale de la transacción con un resultado de error y deshace todo lo escrito. */
class Revertir {
  constructor(public resultado: Resultado<never>) {}
}

async function citaDeToken(token: string) {
  const id = idDeToken(token);
  if (!id) return null;
  return bd.cita.findUnique({
    where: { id },
    include: {
      servicio: { select: { nombre: true } },
      psicologo: { select: { nombre: true } },
    },
  });
}

export async function verCita(
  token: string,
  { ahora = new Date() }: { ahora?: Date } = {},
): Promise<Resultado<CitaPublica>> {
  const c = await citaDeToken(token);
  if (!c) return INVALIDO;
  const config = await leerConfig();
  const activa = c.estado === "PENDIENTE" || c.estado === "AUTORIZADA";
  const enPlazo =
    ahora.getTime() <=
    c.inicio.getTime() - config.cancelacionMinHoras * HORA_MS;
  return ok({
    codigo: c.codigo,
    estado: c.estado,
    servicio: c.servicio.nombre,
    psicologoNombre: c.psicologo.nombre,
    inicio: c.inicio.toISOString(),
    fin: c.fin.toISOString(),
    lugar: LUGAR,
    puedeCancelar: activa && enPlazo,
    puedeReprogramar:
      activa && enPlazo && c.reprogramaciones < config.maxReprogramaciones,
  });
}

export async function cancelarCita(
  token: string,
  { ahora = new Date() }: { ahora?: Date } = {},
): Promise<Resultado<{ estado: EstadoCita }>> {
  const c = await citaDeToken(token);
  if (!c) return INVALIDO;
  const config = await leerConfig();
  const r = await bd.$transaction((tx) =>
    transicionar(tx, c, "cancelar", { tipo: "PERSONA" }, { ahora, config }),
  );
  if (!r.ok) return r;
  log(r.datos.log, c.id);
  await despachar();
  return ok({ estado: r.datos.estado });
}

export async function reprogramarCita(
  entrada: unknown,
  { ahora = new Date() }: { ahora?: Date } = {},
): Promise<Resultado<CitaCreada>> {
  const v = reprogramarSchema.safeParse(entrada);
  if (!v.success) {
    const campos: Record<string, string> = {};
    for (const i of v.error.issues)
      campos[i.path.join(".") || "_"] ??= i.message;
    return fallo("VALIDACION", "Revisa los datos marcados.", campos);
  }
  const { token, psicologoId } = v.data;
  const inicio = new Date(v.data.inicio);
  const original = await citaDeToken(token);
  if (!original) return INVALIDO;

  // Plazo, límite de reprogramaciones y estado, antes de mirar el cupo nuevo.
  const config = await leerConfig();
  const contexto = { ahora, config };
  const puede = decidir(original, "reprogramar", { tipo: "PERSONA" }, contexto);
  if (!puede.ok) return puede;

  const sigue = new Date(inicio.getTime() + 1);
  const opciones = {
    psicologoId: psicologoId || undefined,
    excluirCitaId: original.id,
  };
  const r = await cuposDeServicio(
    original.servicioId,
    inicio,
    sigue,
    ahora,
    opciones,
  );
  if (!r)
    return fallo(
      "SERVICIO_NO_DISPONIBLE",
      "Este servicio no se puede pedir en línea por ahora.",
    );
  const cupo = r.cupos.find((c) => Date.parse(c.inicio) === inicio.getTime());
  if (!cupo) {
    const libre = await cuposDeServicio(
      original.servicioId,
      inicio,
      sigue,
      ahora,
      { ...opciones, ignorarCitas: true },
    );
    return libre?.cupos.some((c) => Date.parse(c.inicio) === inicio.getTime())
      ? fallo("CUPO_OCUPADO", "Ese horario acaba de ser tomado. Elige otro.")
      : fallo("FUERA_DE_RANGO", "Ese horario no está disponible. Elige otro.");
  }

  // E03 §4: una sola transacción. Si algo falla, la cita original queda exactamente como estaba.
  try {
    const nueva = await bd.$transaction(async (tx) => {
      const t = await transicionar(
        tx,
        original,
        "reprogramar",
        { tipo: "PERSONA" },
        contexto,
      );
      if (!t.ok) throw new Revertir(t);
      const { estado, venceEn } = estadoInicial(config, inicio, ahora);
      const fin = new Date(inicio.getTime() + r.servicio.duracionMin * 60_000);
      const c = await insertarCita(
        tx,
        cupo.psicologoIds,
        inicio,
        fin,
        original.servicioId,
        personaDe(original),
        {
          estado,
          venceEn,
          reprogramadaDeId: original.id,
          reprogramaciones: original.reprogramaciones + 1,
        },
      );
      if (!c)
        throw new Revertir(
          fallo("CUPO_OCUPADO", "Ese horario acaba de ser tomado. Elige otro."),
        );
      await registrarCreacion(tx, { id: c.id, estado }, true);
      return { ...c, estado };
    });
    log("cita.reprogramada", original.id);
    await despachar();
    return ok({
      codigo: nueva.codigo,
      estado: nueva.estado,
      inicio: inicio.toISOString(),
      enlaceGestion: enlaceDeCita(nueva.id),
    });
  } catch (e) {
    if (e instanceof Revertir) return e.resultado;
    throw e;
  }
}
