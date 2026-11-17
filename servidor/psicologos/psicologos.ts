// Administración de psicólogos y administradores (RF-ADM-01, 02, 11; RF-AUT-06). Todo es de ADMIN y deja auditoría.
// Nada se borra: se desactiva (E02). Las acciones son "sensibles" (S02).
import {
  actualizarPsicologoSchema,
  cambiarActivoSchema,
  crearAdministradorSchema,
  crearPsicologoSchema,
  type EstadoPsicologo,
  type PsicologoDetalle,
  type UsuarioResumen,
} from "../../contratos/psicologo";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { z } from "zod";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { configuracionActual, dominioPermitido } from "../centro/configuracion";
import { esDuplicado, validar } from "../centro/validar";
import { exigir, exigirOtroAdminActivo, type Sesion } from "../permisos";
import { enviarInvitacion } from "./invitacion";

type Fila = {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "PSICOLOGO";
  activo: boolean;
  claveHash: string | null;
  ultimoIngreso: Date | null;
  perfil: { area: "PSICOLOGIA" | "NEUROPSICOLOGIA" } | null;
};
const INCLUIR = {
  perfil: { select: { area: true } },
} as const;

const estado = (u: Fila): EstadoPsicologo =>
  !u.activo ? "INACTIVO" : u.claveHash ? "ACTIVO" : "INVITADO";

const resumen = (u: Fila): UsuarioResumen => ({
  id: u.id,
  nombre: u.nombre,
  correo: u.correo,
  rol: u.rol,
  area: u.perfil?.area ?? null,
  estado: estado(u),
  ultimoIngreso: u.ultimoIngreso?.toISOString() ?? null,
});

const idSchema = z.string().min(1);

/** Rechaza un correo fuera de `dominiosPermitidos` (lista vacía = cualquiera; solo en pruebas). */
async function revisarCorreo(correo: string): Promise<Resultado<null>> {
  const { dominiosPermitidos } = await configuracionActual();
  return dominioPermitido(correo, dominiosPermitidos)
    ? ok(null)
    : fallo("CORREO_NO_PERMITIDO", "Usa un correo institucional.", {
        correo: "Ese dominio no está permitido",
      });
}

type Alta = {
  nombre: string;
  correo: string;
  area?: "PSICOLOGIA" | "NEUROPSICOLOGIA";
};

/** Crea el usuario sin contraseña, su perfil (si es psicólogo), el enlace y el correo: todo o nada. */
async function altaInvitada(
  sesion: { usuarioId: string },
  rol: "ADMIN" | "PSICOLOGO",
  a: Alta,
): Promise<Resultado<UsuarioResumen>> {
  const c = await revisarCorreo(a.correo);
  if (!c.ok) return c;
  try {
    const u = await bd.$transaction(async (tx) => {
      const fila = await tx.usuario.create({
        data: {
          correo: a.correo,
          nombre: a.nombre,
          rol,
          ...(a.area && { perfil: { create: { area: a.area } } }),
        },
        include: INCLUIR,
      });
      await enviarInvitacion(fila, tx);
      await auditar(
        {
          usuarioId: sesion.usuarioId,
          accion: rol === "ADMIN" ? "ADMIN_CREADO" : "PSICOLOGO_CREADO",
          entidad: "Usuario",
          entidadId: fila.id,
        },
        tx,
      );
      return fila;
    });
    return ok(resumen(u));
  } catch (e) {
    if (esDuplicado(e))
      return fallo("CORREO_EN_USO", "Ya existe una cuenta con ese correo.", {
        correo: "Ya existe una cuenta con este correo",
      });
    throw e;
  }
}

export async function crearPsicologo(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<UsuarioResumen>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(crearPsicologoSchema, entrada);
  if (!v.ok) return v;
  return altaInvitada(p.datos, "PSICOLOGO", v.datos);
}

export async function crearAdministrador(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<UsuarioResumen>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  // ponytail: S02 pide además exigirConfirmacionReciente() (acción sensible); se conecta con T-217.
  const v = validar(crearAdministradorSchema, entrada);
  if (!v.ok) return v;
  return altaInvitada(p.datos, "ADMIN", v.datos);
}

async function listar(
  sesion: Sesion | null | undefined,
  rol: "ADMIN" | "PSICOLOGO",
): Promise<Resultado<UsuarioResumen[]>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const filas = await bd.usuario.findMany({
    where: { rol },
    include: INCLUIR,
    orderBy: { nombre: "asc" },
  });
  return ok(filas.map(resumen));
}
export const listarPsicologos = (s: Sesion | null | undefined) =>
  listar(s, "PSICOLOGO");
export const listarAdministradores = (s: Sesion | null | undefined) =>
  listar(s, "ADMIN");

export async function verPsicologo(
  sesion: Sesion | null | undefined,
  id: unknown,
): Promise<Resultado<PsicologoDetalle>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(idSchema, id);
  if (!v.ok) return v;
  const u = await bd.usuario.findFirst({
    where: { id: v.datos, rol: "PSICOLOGO" },
    include: {
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
  if (!u?.perfil)
    return fallo("NO_ENCONTRADO", "No encontramos a esa persona.");
  return ok({
    ...resumen(u),
    presentacion: u.perfil.presentacion,
    visible: u.perfil.visible,
    fotoUrl: u.perfil.fotoRuta ? `/archivos/${u.perfil.fotoRuta}` : null, // SUPUESTO: ruta pública de archivos
    servicioIds: u.perfil.servicios.map((s) => s.id),
  });
}

/** El administrador edita solo nombre y área; el perfil y el horario son del propio psicólogo (S02). */
export async function actualizarPsicologo(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<UsuarioResumen>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(actualizarPsicologoSchema, entrada);
  if (!v.ok) return v;
  return bd.$transaction(async (tx) => {
    const existe = await tx.usuario.findFirst({
      where: { id: v.datos.id, rol: "PSICOLOGO" },
      select: { id: true },
    });
    if (!existe) return fallo("NO_ENCONTRADO", "No encontramos a esa persona.");
    const u = await tx.usuario.update({
      where: { id: v.datos.id },
      data: {
        nombre: v.datos.nombre,
        perfil: { update: { area: v.datos.area } },
      },
      include: INCLUIR,
    });
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: "PSICOLOGO_EDITADO",
        entidad: "Usuario",
        entidadId: u.id,
        detalle: { area: v.datos.area },
      },
      tx,
    );
    return ok(resumen(u));
  });
}

/** Activa o desactiva. Un psicólogo con citas futuras no se desactiva (`TIENE_CITAS_FUTURAS`, con los códigos en
 *  `campos.citas`); el último administrador activo tampoco (S02). */
export async function cambiarActivo(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<UsuarioResumen>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(cambiarActivoSchema, entrada);
  if (!v.ok) return v;
  const { id, activo } = v.datos;
  // ponytail: S02 pide además exigirConfirmacionReciente() al tocar administradores; se conecta con T-217.
  return bd.$transaction(async (tx) => {
    const objetivo = await tx.usuario.findUnique({
      where: { id },
      select: { rol: true },
    });
    if (!objetivo)
      return fallo("NO_ENCONTRADO", "No encontramos a esa persona.");
    if (!activo) {
      if (objetivo.rol === "ADMIN") {
        const otro = await exigirOtroAdminActivo(id, tx);
        if (!otro.ok) return otro;
      } else {
        const citas = await tx.cita.findMany({
          where: {
            psicologoId: id,
            estado: { in: ["PENDIENTE", "AUTORIZADA"] },
            inicio: { gte: new Date() },
          },
          select: { codigo: true },
          orderBy: { inicio: "asc" },
        });
        if (citas.length)
          return fallo(
            "TIENE_CITAS_FUTURAS",
            "Tiene citas próximas. Reasígnalas o cancélalas antes de desactivar.",
            { citas: citas.map((c) => c.codigo).join(", ") },
          );
      }
    }
    const u = await tx.usuario.update({
      where: { id },
      data: { activo },
      include: INCLUIR,
    });
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: activo ? "USUARIO_ACTIVADO" : "USUARIO_DESACTIVADO",
        entidad: "Usuario",
        entidadId: id,
        detalle: { rol: objetivo.rol },
      },
      tx,
    );
    return ok(resumen(u));
  });
}

/** Nuevo enlace e invitación; el anterior queda inválido. Solo para quien aún no creó su contraseña. */
export async function reenviarInvitacion(
  sesion: Sesion | null | undefined,
  id: unknown,
): Promise<Resultado<{ ok: true }>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(idSchema, id);
  if (!v.ok) return v;
  return bd.$transaction(async (tx) => {
    const u = await tx.usuario.findUnique({ where: { id: v.datos } });
    if (!u || !u.activo)
      return fallo("NO_ENCONTRADO", "No encontramos a esa persona.");
    if (u.claveHash)
      return fallo("TRANSICION_INVALIDA", "Esa persona ya creó su contraseña.");
    await enviarInvitacion(u, tx);
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: "INVITACION_REENVIADA",
        entidad: "Usuario",
        entidadId: u.id,
      },
      tx,
    );
    return ok({ ok: true as const });
  });
}
