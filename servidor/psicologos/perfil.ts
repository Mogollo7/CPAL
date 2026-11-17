// Operaciones del propio psicólogo: perfil, foto, horario semanal y ausencias (RF-PSI-01, 02, 03, 07).
// "Propio" siempre sale de la sesión, nunca de un dato enviado por el navegador (S02).
import { z } from "zod";
import { bloqueoSchema, type BloqueoGuardado } from "../../contratos/bloqueo";
import { horarioSchema } from "../../contratos/horario";
import {
  FOTO_LADO_PX,
  FOTO_MAX_BYTES,
  perfilSchema,
  type HorarioGuardado,
  type PerfilPropio,
} from "../../contratos/psicologo";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import {
  borrarArchivo,
  esImagenPermitida,
  guardarImagen,
  urlArchivo,
} from "../archivos";
import { aBloqueoGuardado } from "../centro/bloqueos";
import { validar } from "../centro/validar";
import { diaSemana, minutosDelDia } from "../fechas";
import { exigir, type Sesion } from "../permisos";

const urlFoto = urlArchivo;

const soloPsicologo = (s: Sesion | null | undefined) => exigir(s, "PSICOLOGO");

export async function obtenerMiPerfil(
  sesion: Sesion | null | undefined,
): Promise<Resultado<PerfilPropio>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const id = p.datos.usuarioId;
  const u = await bd.usuario.findUnique({
    where: { id },
    select: {
      nombre: true,
      perfil: {
        select: {
          area: true,
          presentacion: true,
          visible: true,
          fotoRuta: true,
          servicios: { select: { id: true } },
        },
      },
    },
  });
  if (!u?.perfil) return fallo("NO_ENCONTRADO", "No encontramos tu perfil.");
  const [bloques, bloqueos] = await Promise.all([
    bd.disponibilidad.findMany({
      where: { psicologoId: id },
      select: { diaSemana: true, inicioMin: true, finMin: true },
      orderBy: [{ diaSemana: "asc" }, { inicioMin: "asc" }],
    }),
    bd.bloqueo.findMany({
      where: { psicologoId: id, hasta: { gte: new Date() } },
      orderBy: { desde: "asc" },
    }),
  ]);
  return ok({
    id,
    nombre: u.nombre,
    area: u.perfil.area,
    presentacion: u.perfil.presentacion,
    visible: u.perfil.visible,
    fotoUrl: urlFoto(u.perfil.fotoRuta),
    servicioIds: u.perfil.servicios.map((s) => s.id),
    horario: { bloques },
    bloqueos: bloqueos.map(aBloqueoGuardado),
  });
}

/** Presentación, servicios que atiende y visibilidad en el directorio. Solo servicios que existen y están activos. */
export async function actualizarPerfil(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<PerfilPropio>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const v = validar(perfilSchema, entrada);
  if (!v.ok) return v;
  const ids = [...new Set(v.datos.servicioIds)];
  if (ids.length) {
    const validos = await bd.servicio.count({
      where: { id: { in: ids }, activo: true },
    });
    if (validos !== ids.length)
      return fallo(
        "VALIDACION",
        "Hay servicios que no existen o están inactivos.",
        {
          servicioIds: "Servicio no válido",
        },
      );
  }
  await bd.perfilPsicologo.update({
    where: { usuarioId: p.datos.usuarioId },
    data: {
      presentacion: v.datos.presentacion,
      visible: v.datos.visible,
      servicios: { set: ids.map((id) => ({ id })) },
    },
  });
  return obtenerMiPerfil(sesion);
}

// --- Foto ---------------------------------------------------------------------------------------------------

const MENSAJE_FOTO =
  "Tamaño máximo: 6 MB. Formatos permitidos: JPG, PNG o WebP.";

/** Recorta a cuadrado 400 × 400, WebP, sin metadatos EXIF, con nombre aleatorio; borra la foto anterior. */
export async function subirFoto(
  sesion: Sesion | null | undefined,
  archivo: Uint8Array,
): Promise<Resultado<{ fotoUrl: string }>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const ruta = await guardarImagen(archivo, "fotos", {
    ancho: FOTO_LADO_PX,
    alto: FOTO_LADO_PX,
    maxBytes: FOTO_MAX_BYTES,
  });
  if (!ruta)
    return fallo("ARCHIVO_INVALIDO", MENSAJE_FOTO, { foto: MENSAJE_FOTO });
  const antes = await bd.perfilPsicologo.findUnique({
    where: { usuarioId: p.datos.usuarioId },
    select: { fotoRuta: true },
  });
  await bd.perfilPsicologo.update({
    where: { usuarioId: p.datos.usuarioId },
    data: { fotoRuta: ruta },
  });
  await borrarArchivo(antes?.fotoRuta);
  return ok({ fotoUrl: `/archivos/${ruta}` });
}

// --- Horario ------------------------------------------------------------------------------------------------

/** Reemplaza el horario completo (sin bloques cruzados). No toca las citas existentes: devuelve los códigos de las
 *  citas futuras que quedan fuera del nuevo horario para que el panel avise. */
export async function guardarHorario(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<HorarioGuardado>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const v = validar(horarioSchema, entrada);
  if (!v.ok) return v;
  const id = p.datos.usuarioId;
  const bloques = v.datos.bloques;

  const citas = await bd.$transaction(async (tx) => {
    await tx.disponibilidad.deleteMany({ where: { psicologoId: id } });
    if (bloques.length)
      await tx.disponibilidad.createMany({
        data: bloques.map((b) => ({ ...b, psicologoId: id })),
      });
    return tx.cita.findMany({
      where: {
        psicologoId: id,
        estado: { in: ["PENDIENTE", "AUTORIZADA"] },
        inicio: { gte: new Date() },
      },
      select: { codigo: true, inicio: true, fin: true },
      orderBy: { inicio: "asc" },
    });
  });

  const fuera = citas.filter((c) => {
    const dia = diaSemana(c.inicio);
    const ini = minutosDelDia(c.inicio);
    const fin =
      ini + Math.round((c.fin.getTime() - c.inicio.getTime()) / 60_000);
    return !bloques.some(
      (b) => b.diaSemana === dia && b.inicioMin <= ini && fin <= b.finMin,
    );
  });
  return ok({
    horario: { bloques },
    citasFueraDeHorario: fuera.map((c) => c.codigo),
  });
}

// --- Ausencias ----------------------------------------------------------------------------------------------

/** Ausencia propia: ignora el `psicologoId` que llegue y usa el de la sesión. */
export async function crearBloqueo(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<BloqueoGuardado>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const v = validar(bloqueoSchema, entrada);
  if (!v.ok) return v;
  const b = await bd.bloqueo.create({
    data: {
      desde: new Date(v.datos.desde),
      hasta: new Date(v.datos.hasta),
      motivo: v.datos.motivo,
      psicologoId: p.datos.usuarioId,
      creadoPorId: p.datos.usuarioId,
    },
  });
  return ok(aBloqueoGuardado(b));
}

/** Solo las propias: un id ajeno responde NO_ENCONTRADO, igual que uno inexistente. */
export async function eliminarBloqueo(
  sesion: Sesion | null | undefined,
  id: unknown,
): Promise<Resultado<{ ok: true }>> {
  const p = soloPsicologo(sesion);
  if (!p.ok) return p;
  const v = validar(z.string().min(1), id);
  if (!v.ok) return v;
  const r = await bd.bloqueo.deleteMany({
    where: { id: v.datos, psicologoId: p.datos.usuarioId },
  });
  return r.count
    ? ok({ ok: true as const })
    : fallo("NO_ENCONTRADO", "No encontramos esa ausencia.");
}

export { esImagenPermitida };
