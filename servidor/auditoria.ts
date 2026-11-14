// Toda acción de administrador y de sistema deja una fila en `Auditoria` (S02). Solo se inserta: nunca se edita ni se borra.
// `detalle` NUNCA lleva datos personales (nombres, documentos, correos, motivo): solo identificadores y valores técnicos.
import { bd } from "./bd";

export type EventoAuditoria = {
  usuarioId?: string | null; // vacío = sistema u operación
  accion: string; // CITA_AUTORIZADA, PSICOLOGO_CREADO, CONFIG_CAMBIADA…
  entidad: string;
  entidadId: string;
  detalle?: Record<string, string | number | boolean | null>;
};

/** Pasa `cliente` (la transacción) para que la auditoría quede en la misma transacción que el hecho. */
export function auditar(
  e: EventoAuditoria,
  cliente: Pick<typeof bd, "auditoria"> = bd,
) {
  return cliente.auditoria.create({
    data: {
      usuarioId: e.usuarioId ?? null,
      accion: e.accion,
      entidad: e.entidad,
      entidadId: e.entidadId,
      detalle: e.detalle,
    },
  });
}
