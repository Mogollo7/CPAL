// Estados de la cita (E03 §3). `transicionar` es la ÚNICA función que cambia el estado: aplica la tabla de E03,
// escribe la auditoría y encola los correos en la misma transacción. Lo que no esté en la tabla → TRANSICION_INVALIDA.
import type { EstadoCita } from "../../contratos/cita";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import type { bd } from "../bd";
import type { Evento } from "../registro";
import { encolarCorreoCita, type PlantillaCita } from "./correos";
import type { ConfigCitas } from "./datos";

export type EventoCita =
  | "autorizar"
  | "rechazar"
  | "vencer"
  | "cancelar"
  | "reprogramar"
  | "atendida"
  | "inasistencia";
export type Actor =
  | { tipo: "PERSONA" }
  | { tipo: "ADMIN"; usuarioId: string }
  | { tipo: "SISTEMA" };
export type CitaParaEstado = {
  id: string;
  estado: EstadoCita;
  inicio: Date;
  venceEn: Date | null;
  reprogramaciones: number;
};
export type Contexto = {
  ahora: Date;
  config: Pick<ConfigCitas, "cancelacionMinHoras" | "maxReprogramaciones">;
  motivo?: string; // obligatorio al rechazar y al cancelar como administración
};
type Cliente = Pick<typeof bd, "cita" | "auditoria" | "trabajo">;

const HORA_MS = 3_600_000;
const ACTIVAS: EstadoCita[] = ["PENDIENTE", "AUTORIZADA"];
const INVALIDA = fallo(
  "TRANSICION_INVALIDA",
  "Esta cita ya no admite esa acción.",
);
const SIN_MOTIVO = fallo("VALIDACION", "Cuéntanos el motivo.", {
  motivo: "Obligatorio",
});

type Regla = {
  desde: EstadoCita[];
  actor: Actor["tipo"];
  hacia: EstadoCita;
  accion: string; // Auditoria.accion
  log: Evento;
  /** null = se cumple la condición; si no, el error a devolver. */
  condicion: (c: CitaParaEstado, x: Contexto) => Resultado<never> | null;
};

const futuro = (c: CitaParaEstado, x: Contexto) =>
  c.inicio > x.ahora ? null : INVALIDA;
const pasado = (c: CitaParaEstado, x: Contexto) =>
  c.inicio <= x.ahora ? null : INVALIDA;
const motivo = (x: Contexto) => (x.motivo?.trim() ? null : SIN_MOTIVO);
const enPlazo = (c: CitaParaEstado, x: Contexto) =>
  x.ahora.getTime() <=
  c.inicio.getTime() - x.config.cancelacionMinHoras * HORA_MS
    ? null
    : fallo(
        "FUERA_DE_PLAZO",
        "Ya pasó el plazo para hacer este cambio. Escríbenos y lo resolvemos.",
      );

// Una fila por cada fila de la tabla de E03 §3 (la creación vive en `crearCita`).
export const TABLA: Record<EventoCita, Regla[]> = {
  autorizar: [
    {
      desde: ["PENDIENTE"],
      actor: "ADMIN",
      hacia: "AUTORIZADA",
      accion: "CITA_AUTORIZADA",
      log: "cita.autorizada",
      condicion: futuro,
    },
  ],
  rechazar: [
    {
      desde: ["PENDIENTE"],
      actor: "ADMIN",
      hacia: "RECHAZADA",
      accion: "CITA_RECHAZADA",
      log: "cita.rechazada",
      condicion: (_c, x) => motivo(x),
    },
  ],
  vencer: [
    {
      desde: ["PENDIENTE"],
      actor: "SISTEMA",
      hacia: "VENCIDA",
      accion: "CITA_VENCIDA",
      log: "cita.vencida",
      condicion: (c, x) =>
        c.venceEn && x.ahora >= c.venceEn ? null : INVALIDA,
    },
  ],
  cancelar: [
    {
      desde: ACTIVAS,
      actor: "PERSONA",
      hacia: "CANCELADA",
      accion: "CITA_CANCELADA",
      log: "cita.cancelada",
      condicion: enPlazo,
    },
    {
      desde: ACTIVAS,
      actor: "ADMIN",
      hacia: "CANCELADA",
      accion: "CITA_CANCELADA",
      log: "cita.cancelada",
      condicion: (c, x) => futuro(c, x) ?? motivo(x),
    },
  ],
  reprogramar: [
    {
      desde: ACTIVAS,
      actor: "PERSONA",
      hacia: "CANCELADA",
      accion: "CITA_REPROGRAMADA",
      log: "cita.reprogramada",
      condicion: (c, x) =>
        enPlazo(c, x) ??
        (c.reprogramaciones < x.config.maxReprogramaciones
          ? null
          : fallo(
              "LIMITE_REPROGRAMACIONES",
              "Esta cita ya se reprogramó el máximo de veces. Escríbenos y lo resolvemos.",
            )),
    },
  ],
  atendida: [
    {
      desde: ["AUTORIZADA"],
      actor: "ADMIN",
      hacia: "ATENDIDA",
      accion: "CITA_ATENDIDA",
      log: "cita.atendida",
      condicion: pasado,
    },
  ],
  inasistencia: [
    {
      desde: ["AUTORIZADA"],
      actor: "ADMIN",
      hacia: "NO_ASISTIO",
      accion: "CITA_NO_ASISTIO",
      log: "cita.inasistencia",
      condicion: pasado,
    },
  ],
};

/** Parte pura: ¿se puede? Devuelve la regla aplicable o el error que corresponde. */
export function decidir(
  c: CitaParaEstado,
  evento: EventoCita,
  actor: Actor,
  x: Contexto,
): Resultado<Regla> {
  const reglas = TABLA[evento].filter(
    (r) => r.actor === actor.tipo && r.desde.includes(c.estado),
  );
  if (!reglas.length) return INVALIDA;
  return reglas[0].condicion(c, x) ?? ok(reglas[0]);
}

/** Correos que produce cada transición (E03 §3, E06). Solo nombres de plantilla: otro módulo los redacta con `citaId`. */
function plantillas(evento: EventoCita, desde: EstadoCita): PlantillaCita[] {
  switch (evento) {
    case "autorizar":
      return ["cita-autorizada", "cita-nueva-psicologo"];
    case "rechazar":
      return ["cita-no-autorizada"];
    case "vencer":
      return ["cita-vencida"];
    case "cancelar":
      return desde === "AUTORIZADA"
        ? ["cita-cancelada", "cita-cancelada-psicologo"]
        : ["cita-cancelada"];
    case "reprogramar":
      return desde === "AUTORIZADA" ? ["cita-cancelada-psicologo"] : []; // el solicitante recibe el correo de la cita nueva
    default:
      return [];
  }
}

/** Aplica una transición DENTRO de la transacción `tx` del llamador. Si devuelve un error no escribió nada. */
export async function transicionar(
  tx: Cliente,
  cita: CitaParaEstado,
  evento: EventoCita,
  actor: Actor,
  x: Contexto,
): Promise<Resultado<{ estado: EstadoCita; log: Evento }>> {
  const d = decidir(cita, evento, actor, x);
  if (!d.ok) return d;
  const regla = d.datos;
  // El estado debe seguir siendo el esperado: si otro lo cambió antes, este no hace nada (gana el primero).
  const r = await tx.cita.updateMany({
    where: { id: cita.id, estado: cita.estado },
    data: {
      estado: regla.hacia,
      venceEn: null,
      ...(evento === "rechazar" ||
      (evento === "cancelar" && actor.tipo === "ADMIN")
        ? { motivoRechazo: x.motivo!.trim() }
        : {}),
    },
  });
  if (r.count === 0) return INVALIDA;
  await auditar(
    {
      usuarioId: actor.tipo === "ADMIN" ? actor.usuarioId : null,
      accion: regla.accion,
      entidad: "Cita",
      entidadId: cita.id,
      detalle: { de: cita.estado, a: regla.hacia, actor: actor.tipo }, // nunca el motivo ni datos personales
    },
    tx,
  );
  for (const plantilla of plantillas(evento, cita.estado))
    await encolarCorreoCita(
      tx,
      plantilla,
      cita.id,
      evento === "cancelar"
        ? actor.tipo === "ADMIN"
          ? { canceladaPor: "capl", motivo: x.motivo?.trim() }
          : { canceladaPor: "persona" }
        : {},
    );
  return ok({ estado: regla.hacia, log: regla.log });
}
