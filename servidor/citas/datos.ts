// Capa fina de lectura para el núcleo de citas: configuración y datos que necesita `calcularCupos`.
// Las reglas viven en funciones puras; aquí solo se consulta.
import type { Cupo } from "../../contratos/cupo";
import { bd } from "../bd";
import { esFestivo } from "../centro/festivos";
import { calcularCupos } from "./calcularCupos";

type Cliente = Pick<
  typeof bd,
  "configuracion" | "servicio" | "usuario" | "bloqueo" | "cita"
>;

export type ConfigCitas = {
  autoAutorizar: boolean;
  anticipacionMinHoras: number;
  anticipacionMaxDias: number;
  cancelacionMinHoras: number;
  maxCitasActivas: number;
  maxReprogramaciones: number;
  vencimientoPendienteHoras: number;
  correoAdministracion: string;
  versionPolitica: string;
};

// Valores por defecto de E03 §1. Rigen si la fila de Configuracion no existe (el panel de configuración la mantiene).
// SUPUESTO(P-xx): hasta que el CAPL responda el cuestionario rigen los valores que propone E03 §1.
export const CONFIG_POR_DEFECTO: ConfigCitas = {
  autoAutorizar: false,
  anticipacionMinHoras: 24,
  anticipacionMaxDias: 30,
  cancelacionMinHoras: 12,
  maxCitasActivas: 1,
  maxReprogramaciones: 2,
  vencimientoPendienteHoras: 48,
  correoAdministracion: "",
  versionPolitica: "1",
};

export async function leerConfig(
  cliente: Pick<typeof bd, "configuracion"> = bd,
): Promise<ConfigCitas> {
  const c = await cliente.configuracion.findUnique({ where: { id: 1 } });
  return c ? { ...CONFIG_POR_DEFECTO, ...c } : CONFIG_POR_DEFECTO;
}

export type Servicio = { id: string; nombre: string; duracionMin: number };

/** Cupos libres de un servicio en [desde, hasta). `null` = el servicio no existe, está inactivo o no es agendable en línea.
 *  `ignorarCitas` calcula como si nadie hubiera reservado (para distinguir CUPO_OCUPADO de FUERA_DE_RANGO). */
export async function cuposDeServicio(
  servicioId: string,
  desde: Date,
  hasta: Date,
  ahora: Date,
  opciones: {
    psicologoId?: string;
    excluirCitaId?: string;
    ignorarCitas?: boolean;
  } = {},
  cliente: Cliente = bd,
): Promise<{ servicio: Servicio; config: ConfigCitas; cupos: Cupo[] } | null> {
  const servicio = await cliente.servicio.findUnique({
    where: { id: servicioId },
  });
  if (!servicio || !servicio.activo || !servicio.agendableEnLinea) return null;
  const config = await leerConfig(cliente);

  const usuarios = await cliente.usuario.findMany({
    where: {
      rol: "PSICOLOGO",
      activo: true,
      perfil: { servicios: { some: { id: servicioId } } },
      ...(opciones.psicologoId ? { id: opciones.psicologoId } : {}),
    },
    select: {
      id: true,
      disponibilidades: {
        select: { diaSemana: true, inicioMin: true, finMin: true },
      },
    },
  });
  const ids = usuarios.map((u) => u.id);
  const [bloqueos, citas] = await Promise.all([
    cliente.bloqueo.findMany({
      where: {
        desde: { lt: hasta },
        hasta: { gt: desde },
        OR: [{ psicologoId: null }, { psicologoId: { in: ids } }],
      },
      select: { psicologoId: true, desde: true, hasta: true },
    }),
    opciones.ignorarCitas
      ? []
      : cliente.cita.findMany({
          where: {
            psicologoId: { in: ids },
            estado: { in: ["PENDIENTE", "AUTORIZADA"] },
            inicio: { lt: hasta },
            fin: { gt: desde },
          },
          select: {
            id: true,
            psicologoId: true,
            inicio: true,
            fin: true,
            estado: true,
          },
        }),
  ]);

  const cupos = calcularCupos(
    servicio,
    usuarios.map((u) => ({
      id: u.id,
      activo: true,
      servicioIds: [servicioId],
      disponibilidad: u.disponibilidades,
    })),
    desde,
    hasta,
    ahora,
    {
      bloqueos,
      citas,
      esFestivo,
      anticipacionMinHoras: config.anticipacionMinHoras,
      anticipacionMaxDias: config.anticipacionMaxDias,
      psicologoId: opciones.psicologoId,
      excluirCitaId: opciones.excluirCitaId,
    },
  );
  return { servicio, config, cupos };
}
