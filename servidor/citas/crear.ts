// Crear una cita (E03 §5, RF-CIT-04…10). Orden: datos → límite de red → servicio → rango/cupo → límite por persona → inserción.
// Quien decide la doble reserva es la restricción `cita_sin_cruce` de la base de datos, no este código.
import {
  citaSchema,
  type CitaCreada,
  type EstadoCita,
} from "../../contratos/cita";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { diaSemana, fechaBogota, inicioDelDia } from "../fechas";
import type { Cita } from "../generado/client";
import { limitar } from "../limites";
import { redTruncada, registrar } from "../registro";
import { cifrar } from "./cifrado";
import { despachar, encolarCorreoCita } from "./correos";
import { cuposDeServicio, type ConfigCitas } from "./datos";
import { enlaceDeCita } from "./enlace";

const HORA_MS = 3_600_000;
const DIA_MS = 86_400_000;
type Tx = Pick<
  typeof bd,
  "cita" | "auditoria" | "trabajo" | "$executeRawUnsafe"
>;

export type DatosPersona = Pick<
  Cita,
  | "paraQuien"
  | "solicitanteNombre"
  | "solicitanteCorreo"
  | "solicitanteTelefono"
  | "pacienteNombre"
  | "pacienteDocumento"
  | "pacienteEdad"
  | "acudienteNombre"
  | "acudienteDocumento"
  | "motivo"
  | "consentimientoEn"
  | "consentimientoVersion"
>;

/** Los datos de la persona de una cita existente (para copiarlos a la cita nueva al reprogramar). */
export const personaDe = (c: DatosPersona): DatosPersona => ({
  paraQuien: c.paraQuien,
  solicitanteNombre: c.solicitanteNombre,
  solicitanteCorreo: c.solicitanteCorreo,
  solicitanteTelefono: c.solicitanteTelefono,
  pacienteNombre: c.pacienteNombre,
  pacienteDocumento: c.pacienteDocumento,
  pacienteEdad: c.pacienteEdad,
  acudienteNombre: c.acudienteNombre,
  acudienteDocumento: c.acudienteDocumento,
  motivo: c.motivo, // ya cifrado
  consentimientoEn: c.consentimientoEn,
  consentimientoVersion: c.consentimientoVersion,
});

// Prisma envuelve el error de Postgres: 23P01 = violación de exclusión (cruce), P2002 = código repetido.
const codigoPg = (e: unknown) =>
  (
    e as {
      meta?: { driverAdapterError?: { cause?: { originalCode?: string } } };
    }
  )?.meta?.driverAdapterError?.cause?.originalCode;
export const esCruce = (e: unknown) => codigoPg(e) === "23P01";
const esCodigoRepetido = (e: unknown) =>
  (e as { code?: string })?.code === "P2002";

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I/L: se dicta por teléfono
const codigoLegible = () =>
  "CAPL-" +
  Array.from(
    { length: 4 },
    () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)],
  ).join("");

/** Psicólogos candidatos de un tramo: primero el de menos citas activas ese día; luego la semana; luego al azar (E03 §2). */
async function ordenarPorCarga(
  tx: Pick<typeof bd, "cita">,
  ids: string[],
  inicio: Date,
): Promise<string[]> {
  if (ids.length < 2) return ids;
  const lunes = new Date(
    inicioDelDia(inicio).getTime() - (diaSemana(inicio) - 1) * DIA_MS,
  );
  const citas = await tx.cita.findMany({
    where: {
      psicologoId: { in: ids },
      estado: { in: ["PENDIENTE", "AUTORIZADA"] },
      inicio: { gte: lunes, lt: new Date(lunes.getTime() + 7 * DIA_MS) },
    },
    select: { psicologoId: true, inicio: true },
  });
  const hoy = fechaBogota(inicio);
  const carga = new Map(
    ids.map((id) => [id, { dia: 0, semana: 0, azar: Math.random() }]),
  );
  for (const c of citas) {
    const x = carga.get(c.psicologoId)!;
    x.semana++;
    if (fechaBogota(c.inicio) === hoy) x.dia++;
  }
  return [...ids].sort((a, b) => {
    const [x, y] = [carga.get(a)!, carga.get(b)!];
    return x.dia - y.dia || x.semana - y.semana || x.azar - y.azar;
  });
}

/** Inserta la cita probando los candidatos en orden; si uno falla por cruce pasa al siguiente. `null` = ninguno libre.
 *  Cada intento va en un SAVEPOINT: un error de Postgres anula la transacción entera y así solo se deshace el intento. */
export async function insertarCita(
  tx: Tx,
  candidatos: string[],
  inicio: Date,
  fin: Date,
  servicioId: string,
  persona: DatosPersona,
  extra: {
    estado: EstadoCita;
    venceEn: Date | null;
    reprogramadaDeId?: string;
    reprogramaciones?: number;
  },
): Promise<{ id: string; codigo: string; psicologoId: string } | null> {
  for (const psicologoId of await ordenarPorCarga(tx, candidatos, inicio)) {
    for (let intento = 0; intento < 5; intento++) {
      await tx.$executeRawUnsafe("SAVEPOINT intento_cita");
      try {
        const c = await tx.cita.create({
          data: {
            ...persona,
            ...extra,
            codigo: codigoLegible(),
            servicioId,
            psicologoId,
            inicio,
            fin,
          },
          select: { id: true, codigo: true },
        });
        await tx.$executeRawUnsafe("RELEASE SAVEPOINT intento_cita");
        return { ...c, psicologoId };
      } catch (e) {
        await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT intento_cita");
        if (esCruce(e)) break; // siguiente psicólogo
        if (!esCodigoRepetido(e)) throw e; // código repetido: otro código
      }
    }
  }
  return null;
}

/** Cita recién insertada: auditoría y correos de E03 §3 «crear», en la misma transacción. */
export async function registrarCreacion(
  tx: Tx,
  c: { id: string; estado: EstadoCita },
  reprogramada: boolean,
) {
  await auditar(
    {
      accion: reprogramada ? "CITA_CREADA_POR_REPROGRAMACION" : "CITA_CREADA",
      entidad: "Cita",
      entidadId: c.id,
      detalle: { estado: c.estado },
    },
    tx,
  );
  if (c.estado === "AUTORIZADA") {
    await encolarCorreoCita(tx, "cita-autorizada", c.id);
    await encolarCorreoCita(tx, "cita-nueva-psicologo", c.id);
  } else {
    await encolarCorreoCita(tx, "solicitud-recibida", c.id); // el módulo de correos ve `reprogramadaDeId`
    await encolarCorreoCita(tx, "nueva-solicitud", c.id);
  }
}

/** Estado inicial y vencimiento: `venceEn = min(creada + vencimientoPendienteHoras, inicio − 2 h)` (E03 §3). */
export function estadoInicial(config: ConfigCitas, inicio: Date, ahora: Date) {
  return config.autoAutorizar
    ? { estado: "AUTORIZADA" as const, venceEn: null }
    : {
        estado: "PENDIENTE" as const,
        venceEn: new Date(
          Math.min(
            ahora.getTime() + config.vencimientoPendienteHoras * HORA_MS,
            inicio.getTime() - 2 * HORA_MS,
          ),
        ),
      };
}

export async function crearCita(
  entrada: unknown,
  { ip, ahora = new Date() }: { ip: string; ahora?: Date },
): Promise<Resultado<CitaCreada>> {
  // Campo trampa (E03 §8): lleno = bot. Se responde éxito y no se guarda nada.
  const crudo = entrada as { sitioWeb?: unknown; inicio?: unknown } | null;
  if (typeof crudo?.sitioWeb === "string" && crudo.sitioWeb.length > 0)
    return ok({
      codigo: "CAPL-0000",
      estado: "PENDIENTE",
      inicio: String(crudo.inicio ?? ""),
      enlaceGestion: "/",
    });

  // 1. Datos válidos
  const v = citaSchema.safeParse(entrada);
  if (!v.success) {
    const campos: Record<string, string> = {};
    for (const i of v.error.issues)
      campos[i.path.join(".") || "_"] ??= i.message;
    return fallo("VALIDACION", "Revisa los datos marcados.", campos);
  }
  const d = v.data;

  // 2. Límite de intentos por dirección de red
  const lim = limitar("pedirCita", ip, ahora.getTime());
  if (!lim.permitido) {
    registrar("limite.excedido", {
      nivel: "aviso",
      accion: "pedirCita",
      red: redTruncada(ip),
    });
    return fallo(
      "DEMASIADOS_INTENTOS",
      `Hiciste muchos intentos. Vuelve a intentarlo en ${Math.ceil(lim.esperaSeg / 60)} minutos.`,
    );
  }

  // 3 y 4. Servicio agendable; horario dentro de la anticipación y es un cupo válido
  const inicio = new Date(d.inicio);
  const psicologoId = d.psicologoId || undefined;
  const sigue = new Date(inicio.getTime() + 1);
  const r = await cuposDeServicio(d.servicioId, inicio, sigue, ahora, {
    psicologoId,
  });
  if (!r)
    return fallo(
      "SERVICIO_NO_DISPONIBLE",
      "Este servicio no se puede pedir en línea por ahora.",
    );
  const { servicio, config } = r;
  const cupo = r.cupos.find((c) => Date.parse(c.inicio) === inicio.getTime());
  if (!cupo) {
    // ¿Era un cupo válido que alguien ya tomó, o nunca lo fue?
    const libre = await cuposDeServicio(d.servicioId, inicio, sigue, ahora, {
      psicologoId,
      ignorarCitas: true,
    });
    return libre?.cupos.some((c) => Date.parse(c.inicio) === inicio.getTime())
      ? fallo("CUPO_OCUPADO", "Ese horario acaba de ser tomado. Elige otro.")
      : fallo("FUERA_DE_RANGO", "Ese horario no está disponible. Elige otro.");
  }

  // 5. Límite de citas activas por persona (mismo correo o mismo documento)
  // ponytail: comprobar y luego insertar no es atómico; dos envíos simultáneos de la misma persona podrían pasar.
  const documento = d.pacienteDocumento;
  const activas = await bd.cita.count({
    where: {
      estado: { in: ["PENDIENTE", "AUTORIZADA"] },
      inicio: { gt: ahora },
      OR: [
        { solicitanteCorreo: d.solicitanteCorreo },
        ...(documento ? [{ pacienteDocumento: documento }] : []),
      ],
    },
  });
  if (activas >= config.maxCitasActivas) {
    registrar("cita.limite_alcanzado", { nivel: "aviso" });
    return fallo(
      "LIMITE_CITAS",
      "Ya tienes una cita pendiente o autorizada. Puedes cambiarla o cancelarla desde el enlace de tu correo.",
    );
  }

  // 6. Inserción
  const fin = new Date(inicio.getTime() + servicio.duracionMin * 60_000);
  const { estado, venceEn } = estadoInicial(config, inicio, ahora);
  const persona: DatosPersona = {
    paraQuien: d.paraQuien,
    solicitanteNombre: d.solicitanteNombre,
    solicitanteCorreo: d.solicitanteCorreo,
    solicitanteTelefono: d.solicitanteTelefono,
    pacienteNombre:
      d.paraQuien === "PROPIA"
        ? d.solicitanteNombre
        : (d.pacienteNombre ?? null),
    pacienteDocumento: documento ?? null,
    pacienteEdad: d.pacienteEdad ?? null,
    acudienteNombre: d.acudienteNombre ?? null,
    acudienteDocumento: d.acudienteDocumento ?? null,
    motivo: d.motivo?.trim() ? cifrar(d.motivo.trim()) : null, // S03: nunca en claro
    consentimientoEn: ahora,
    consentimientoVersion: config.versionPolitica,
  };
  const creada = await bd.$transaction(async (tx) => {
    const c = await insertarCita(
      tx,
      cupo.psicologoIds,
      inicio,
      fin,
      servicio.id,
      persona,
      { estado, venceEn },
    );
    if (c) await registrarCreacion(tx, { id: c.id, estado }, false);
    return c;
  });
  if (!creada) {
    registrar("cita.cupo_ocupado", { nivel: "aviso" });
    return fallo(
      "CUPO_OCUPADO",
      "Ese horario acaba de ser tomado. Elige otro.",
    );
  }
  registrar("cita.creada", { entidad: `cita:${creada.id}`, resultado: "ok" });
  await despachar();
  return ok({
    codigo: creada.codigo,
    estado,
    inicio: inicio.toISOString(),
    enlaceGestion: enlaceDeCita(creada.id),
  });
}
