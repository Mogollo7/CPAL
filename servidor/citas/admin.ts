// Operaciones de administración de citas (RF-ADM-03, 04, 05, 10, 12, 14). Todas empiezan con `exigir(sesion, "ADMIN")`.
// Los identificadores que llegan del navegador nunca se dan por buenos: cada operación vuelve a leer la cita.
import { encolarPlantilla } from "../correo/enviar";
import {
  asistenciaSchema,
  motivoAdminSchema,
  reasignarSchema,
  type CitaDetalle,
  type CitaLista,
  type PaginaCitas,
} from "../../contratos/cita";
import {
  filtrosCitaSchema,
  POR_PAGINA,
  type FiltrosCita,
} from "../../contratos/filtros-cita";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { validar } from "../centro/validar";
import { bd } from "../bd";
import { fechaBogota, minutosDelDia } from "../fechas";
import type { Prisma } from "../generado/client";
import { exigir, type Sesion } from "../permisos";
import { registrar } from "../registro";
import { despachar } from "./correos";
import { descifrar } from "./cifrado";
import { esCruce } from "./crear";
import { leerConfig } from "./datos";
import { transicionar, type EventoCita } from "./estados";

const HORA_MS = 3_600_000;
const MAX_EXPORTACION = 5000;

const NO_ENCONTRADA = fallo("NO_ENCONTRADO", "No encontramos esa cita.");

const incluir = {
  servicio: { select: { nombre: true } },
  psicologo: { select: { nombre: true } },
} as const;
type FilaCita = Prisma.CitaGetPayload<{ include: typeof incluir }>;

const aLista = (c: FilaCita): CitaLista => ({
  id: c.id,
  codigo: c.codigo,
  estado: c.estado,
  inicio: c.inicio.toISOString(),
  fin: c.fin.toISOString(),
  servicio: c.servicio.nombre,
  psicologoId: c.psicologoId,
  psicologoNombre: c.psicologo.nombre,
  paraQuien: c.paraQuien,
  solicitanteNombre: c.solicitanteNombre,
  solicitanteCorreo: c.solicitanteCorreo,
  solicitanteTelefono: c.solicitanteTelefono,
  pacienteNombre: c.pacienteNombre,
  pacienteDocumento: c.pacienteDocumento,
  venceEn: c.venceEn?.toISOString() ?? null,
  creadaEn: c.creadaEn.toISOString(),
});

function donde(f: FiltrosCita, psicologoId?: string): Prisma.CitaWhereInput {
  const q = f.busqueda;
  return {
    ...(f.estado && { estado: f.estado }),
    ...(f.servicioId && { servicioId: f.servicioId }),
    // `psicologoId` obligatorio (el psicólogo ve solo lo suyo) manda sobre el filtro del formulario.
    ...((psicologoId ?? f.psicologoId) && {
      psicologoId: psicologoId ?? f.psicologoId,
    }),
    ...((f.desde || f.hasta) && {
      inicio: {
        ...(f.desde && { gte: new Date(f.desde) }),
        ...(f.hasta && { lte: new Date(f.hasta) }),
      },
    }),
    ...(q && {
      OR: [
        { codigo: { contains: q, mode: "insensitive" } },
        { solicitanteNombre: { contains: q, mode: "insensitive" } },
        { solicitanteCorreo: { contains: q, mode: "insensitive" } },
        { pacienteNombre: { contains: q, mode: "insensitive" } },
        { pacienteDocumento: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
}

/** Consulta paginada de citas sin permisos: la usan `listarCitas` (todas) y `listarMisCitas` (con `psicologoId` fijo). */
export async function consultarCitas(
  f: FiltrosCita,
  psicologoId?: string,
): Promise<PaginaCitas> {
  const where = donde(f, psicologoId);
  const total = await bd.cita.count({ where });
  const pagina = Math.min(f.pagina, Math.max(1, Math.ceil(total / POR_PAGINA)));
  const filas = await bd.cita.findMany({
    where,
    include: incluir,
    // Las pendientes se atienden por orden de llegada del horario; el resto, lo más reciente primero.
    orderBy: [
      { inicio: f.estado === "PENDIENTE" ? "asc" : "desc" },
      { id: "asc" },
    ],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
  });
  return {
    citas: filas.map(aLista),
    total,
    pagina,
    porPagina: POR_PAGINA,
  };
}

export async function listarCitas(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<PaginaCitas>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const f = validar(filtrosCitaSchema, entrada ?? {});
  return f.ok ? ok(await consultarCitas(f.datos)) : f;
}

export async function verCitaAdmin(
  sesion: Sesion | null | undefined,
  id: string,
): Promise<Resultado<CitaDetalle & { servicioId: string }>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const c = await bd.cita.findUnique({
    where: { id: String(id) },
    include: incluir,
  });
  if (!c) return NO_ENCONTRADA;
  const [historial, correos] = await Promise.all([
    bd.auditoria.findMany({
      where: { entidad: "Cita", entidadId: c.id },
      orderBy: { creadaEn: "asc" },
      select: { accion: true, usuarioId: true, creadaEn: true },
    }),
    bd.trabajo.findMany({
      where: { citaId: c.id, tipo: "CORREO" },
      orderBy: { creadoEn: "asc" },
      select: { llave: true, estado: true, entregado: true },
    }),
  ]);
  let motivo: string | null = null;
  if (c.motivo) {
    try {
      motivo = descifrar(c.motivo);
    } catch {
      motivo = null; // llave perdida o valor alterado: la cita se sigue pudiendo gestionar
      registrar("http.error", {
        nivel: "error",
        rol: "admin",
        entidad: `cita:${c.id}`,
        resultado: "MOTIVO_ILEGIBLE",
      });
    }
  }
  return ok({
    ...aLista(c),
    servicioId: c.servicioId,
    pacienteEdad: c.pacienteEdad,
    acudienteNombre: c.acudienteNombre,
    acudienteDocumento: c.acudienteDocumento,
    motivo,
    motivoRechazo: c.motivoRechazo,
    reprogramaciones: c.reprogramaciones,
    reprogramadaDeId: c.reprogramadaDeId,
    consentimientoEn: c.consentimientoEn.toISOString(),
    consentimientoVersion: c.consentimientoVersion,
    historial: historial.map((h) => ({
      ...h,
      creadaEn: h.creadaEn.toISOString(),
    })),
    correos,
  });
}

/** Aplica un evento de E03 §3 como administrador; devuelve la cita ya actualizada. */
async function aplicar(
  sesion: Sesion | null | undefined,
  id: string,
  evento: EventoCita,
  motivo?: string,
  ahora = new Date(),
): Promise<Resultado<CitaLista>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const config = await leerConfig();
  const r = await bd.$transaction(async (tx) => {
    const c = await tx.cita.findUnique({ where: { id: String(id) } });
    if (!c) return NO_ENCONTRADA;
    return transicionar(
      tx,
      c,
      evento,
      { tipo: "ADMIN", usuarioId: p.datos.usuarioId },
      { ahora, config, motivo },
    );
  });
  if (!r.ok) return r;
  registrar(r.datos.log, {
    rol: "admin",
    actor: p.datos.usuarioId,
    entidad: `cita:${id}`,
    resultado: "ok",
  });
  await despachar();
  const c = await bd.cita.findUniqueOrThrow({
    where: { id },
    include: incluir,
  });
  return ok(aLista(c));
}

export const autorizarCita = (
  s: Sesion | null | undefined,
  id: string,
  ahora?: Date,
) => aplicar(s, id, "autorizar", undefined, ahora);

export async function rechazarCita(
  s: Sesion | null | undefined,
  entrada: unknown,
  ahora?: Date,
) {
  const p = exigir(s, "ADMIN");
  if (!p.ok) return p;
  const v = validar(motivoAdminSchema, entrada);
  return v.ok ? aplicar(s, v.datos.id, "rechazar", v.datos.motivo, ahora) : v;
}

export async function cancelarCitaAdmin(
  s: Sesion | null | undefined,
  entrada: unknown,
  ahora?: Date,
) {
  const p = exigir(s, "ADMIN");
  if (!p.ok) return p;
  const v = validar(motivoAdminSchema, entrada);
  return v.ok ? aplicar(s, v.datos.id, "cancelar", v.datos.motivo, ahora) : v;
}

export async function marcarAsistencia(
  s: Sesion | null | undefined,
  entrada: unknown,
  ahora?: Date,
) {
  const p = exigir(s, "ADMIN");
  if (!p.ok) return p;
  const v = validar(asistenciaSchema, entrada);
  return v.ok
    ? aplicar(
        s,
        v.datos.id,
        v.datos.resultado === "ATENDIDA" ? "atendida" : "inasistencia",
        undefined,
        ahora,
      )
    : v;
}

/** Pasa la cita a otro psicólogo y/o a otro horario. Administración puede colocarla fuera del horario publicado
 *  (los bloqueos y festivos no se revisan aquí: es una decisión consciente); lo que nunca se permite es un cruce. */
export async function reasignarCita(
  sesion: Sesion | null | undefined,
  entrada: unknown,
  ahora = new Date(),
): Promise<Resultado<CitaLista>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(reasignarSchema, entrada);
  if (!v.ok) return v;
  const { id, psicologoId } = v.datos;
  const inicio = new Date(v.datos.inicio);
  if (inicio <= ahora)
    return fallo("FUERA_DE_RANGO", "El nuevo horario debe estar en el futuro.");
  try {
    const r = await bd.$transaction(async (tx) => {
      const c = await tx.cita.findUnique({
        where: { id },
        include: { servicio: { select: { duracionMin: true } } },
      });
      if (!c) return NO_ENCONTRADA;
      if (c.estado !== "PENDIENTE" && c.estado !== "AUTORIZADA")
        return fallo(
          "TRANSICION_INVALIDA",
          "Esta cita ya no admite esa acción.",
        );
      const psi = await tx.usuario.findFirst({
        where: {
          id: psicologoId,
          rol: "PSICOLOGO",
          activo: true,
          perfil: { servicios: { some: { id: c.servicioId } } },
        },
        select: { id: true },
      });
      if (!psi)
        return fallo("VALIDACION", "Ese psicólogo no atiende este servicio.", {
          psicologoId: "No disponible",
        });
      const fin = new Date(inicio.getTime() + c.servicio.duracionMin * 60_000);
      const u = await tx.cita.updateMany({
        where: { id, estado: c.estado }, // si otro la cambió mientras tanto, no se toca
        data: {
          psicologoId,
          inicio,
          fin,
          ...(c.estado === "PENDIENTE" && c.venceEn
            ? {
                venceEn: new Date(
                  Math.min(c.venceEn.getTime(), inicio.getTime() - 2 * HORA_MS),
                ),
              }
            : {}),
        },
      });
      if (u.count === 0)
        return fallo(
          "TRANSICION_INVALIDA",
          "Esta cita ya no admite esa acción.",
        );
      await auditar(
        {
          usuarioId: p.datos.usuarioId,
          accion: "CITA_REASIGNADA",
          entidad: "Cita",
          entidadId: id,
          detalle: {
            psicologoAnterior: c.psicologoId,
            psicologoNuevo: psicologoId,
            inicioAnterior: c.inicio.toISOString(),
            inicioNuevo: inicio.toISOString(),
          },
        },
        tx,
      );
      // Aviso a la persona con los datos nuevos, y al psicólogo que ahora la atiende si ya estaba autorizada.
      // La versión es el horario nuevo: cada cambio es un correo distinto.
      // ponytail: el psicólogo anterior no recibe correo (la plantilla lee al psicólogo actual de la cita); lo ve en su agenda.
      const version = inicio.getTime();
      await encolarPlantilla(
        "cita-reasignada",
        { citaId: id },
        { version },
        tx,
      );
      if (c.estado === "AUTORIZADA" && psicologoId !== c.psicologoId)
        await encolarPlantilla(
          "cita-nueva-psicologo",
          { citaId: id },
          { version },
          tx,
        );
      return ok(null);
    });
    if (!r.ok) return r;
    await despachar();
  } catch (e) {
    if (esCruce(e))
      return fallo(
        "CUPO_OCUPADO",
        "Ese horario ya está ocupado para ese psicólogo.",
      );
    throw e;
  }
  return ok(
    aLista(
      await bd.cita.findUniqueOrThrow({ where: { id }, include: incluir }),
    ),
  );
}

// ── Exportar a CSV (RF-ADM-14) ──────────────────────────────────────────────────────────────────────────────────

const ETIQUETA_ESTADO: Record<string, string> = {
  PENDIENTE: "Pendiente",
  AUTORIZADA: "Autorizada",
  RECHAZADA: "No autorizada",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
  ATENDIDA: "Atendida",
  NO_ASISTIO: "No asistió",
};
const ETIQUETA_PARA: Record<string, string> = {
  PROPIA: "Para sí",
  OTRA_PERSONA: "Otra persona",
  MENOR: "Menor de edad",
};

// Separador ";": el que usa Excel con configuración regional de Colombia/España al abrir el archivo con doble clic.
const SEP = ";";
const celda = (v: string | null | undefined) => {
  let t = v ?? "";
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // evita que Excel lo ejecute como fórmula
  return /[;"\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
const bogota = (iso: string) => {
  const d = new Date(iso);
  const m = minutosDelDia(d);
  return `${fechaBogota(d)} ${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** CSV en UTF-8 con BOM (Excel muestra bien las tildes), líneas CRLF. NUNCA incluye el motivo de consulta. */
export function citasACsv(citas: CitaLista[]): string {
  const filas = [
    [
      "Código",
      "Estado",
      "Inicio",
      "Fin",
      "Servicio",
      "Psicólogo",
      "Para quién",
      "Solicitante",
      "Correo",
      "Teléfono",
      "Paciente",
      "Documento",
      "Solicitada",
    ],
    ...citas.map((c) => [
      c.codigo,
      ETIQUETA_ESTADO[c.estado] ?? c.estado,
      bogota(c.inicio),
      bogota(c.fin),
      c.servicio,
      c.psicologoNombre,
      ETIQUETA_PARA[c.paraQuien] ?? c.paraQuien,
      c.solicitanteNombre,
      c.solicitanteCorreo,
      c.solicitanteTelefono,
      c.pacienteNombre,
      c.pacienteDocumento,
      bogota(c.creadaEn),
    ]),
  ];
  return "﻿" + filas.map((f) => f.map(celda).join(SEP)).join("\r\n") + "\r\n";
}

/** Con los mismos filtros de la bandeja (sin paginar; tope de 5000 filas). La ruta GET /api/admin/exportar lo entrega como archivo. */
export async function exportarCitas(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<string>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const f = validar(filtrosCitaSchema, entrada ?? {});
  if (!f.ok) return f;
  const filas = await bd.cita.findMany({
    where: donde(f.datos),
    include: incluir,
    orderBy: [{ inicio: "desc" }, { id: "asc" }],
    take: MAX_EXPORTACION + 1,
  });
  if (filas.length > MAX_EXPORTACION)
    return fallo(
      "VALIDACION",
      "La exportación supera las 5000 citas. Aplica más filtros e inténtalo de nuevo.",
    );
  await auditar({
    usuarioId: p.datos.usuarioId,
    accion: "CITAS_EXPORTADAS",
    entidad: "Cita",
    entidadId: "exportacion",
    detalle: { filas: filas.length },
  });
  registrar("admin.exportacion", {
    rol: "admin",
    actor: p.datos.usuarioId,
    operacion: "citas",
    resultado: String(filas.length),
  });
  return ok(citasACsv(filas.map(aLista)));
}
