// Encolado de correos de cita: delega en `encolarPlantilla` (servidor/correo). Solo ids y datos no sensibles; la plantilla
// la redacta el módulo de correos leyendo la cita. Llave: correo:{plantilla}:{citaId}:1.
import type { bd } from "../bd";
import { encolarPlantilla } from "../correo/enviar";
import type { Payloads } from "../correo/preparar";
import { procesarCola } from "../cola";

export type PlantillaCita =
  | "solicitud-recibida"
  | "nueva-solicitud"
  | "cita-autorizada"
  | "cita-no-autorizada"
  | "cita-vencida"
  | "cita-cancelada"
  | "cita-cancelada-psicologo"
  | "cita-nueva-psicologo";

export const encolarCorreoCita = (
  tx: Pick<typeof bd, "trabajo">,
  plantilla: PlantillaCita,
  citaId: string,
  extra: { canceladaPor?: "persona" | "capl"; motivo?: string } = {},
) =>
  encolarPlantilla(
    plantilla,
    (plantilla === "cita-cancelada"
      ? { citaId, ...extra }
      : { citaId }) as Payloads[typeof plantilla],
    {},
    tx,
  );

/** Tras confirmar la transacción: intenta enviar ya lo encolado (la tarea de cada minuto recoge lo que falle).
 *  En pruebas no se ejecuta, para no consumir los trabajos que las pruebas inspeccionan. */
export const despachar = () =>
  process.env.VITEST ? undefined : procesarCola().catch(() => undefined);
