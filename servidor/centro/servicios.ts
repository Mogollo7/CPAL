// Gestión de servicios (RF-ADM-08). Nunca se borran: se desactivan (E02).
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import {
  servicioSchema,
  type ServicioGuardado,
} from "../../contratos/servicio";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { exigir, type Sesion } from "../permisos";
import { esDuplicado, slugificar, validar } from "./validar";

const SEL = {
  id: true,
  slug: true,
  nombre: true,
  descripcion: true,
  duracionMin: true,
  area: true,
  agendableEnLinea: true,
  activo: true,
  orden: true,
} as const;

export async function listarServicios(
  sesion: Sesion | null | undefined,
): Promise<Resultado<ServicioGuardado[]>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  return ok(
    await bd.servicio.findMany({
      select: SEL,
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    }),
  );
}

/** Crea (sin `id`) o edita (con `id`). El `slug` de un servicio ya creado no cambia salvo que se envíe. */
export async function guardarServicio(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<ServicioGuardado>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(servicioSchema, entrada);
  if (!v.ok) return v;
  const { id, slug, ...datos } = v.datos;
  try {
    const s = await bd.$transaction(async (tx) => {
      const fila = id
        ? await tx.servicio.update({
            where: { id },
            data: { ...datos, ...(slug && { slug }) },
            select: SEL,
          })
        : await tx.servicio.create({
            data: { ...datos, slug: slug ?? slugificar(datos.nombre) },
            select: SEL,
          });
      await auditar(
        {
          usuarioId: p.datos.usuarioId,
          accion: id ? "SERVICIO_EDITADO" : "SERVICIO_CREADO",
          entidad: "Servicio",
          entidadId: fila.id,
          detalle: {
            activo: fila.activo,
            agendableEnLinea: fila.agendableEnLinea,
          },
        },
        tx,
      );
      return fila;
    });
    return ok(s);
  } catch (e) {
    if (esDuplicado(e))
      return fallo(
        "VALIDACION",
        "Ya existe un servicio con ese identificador.",
        {
          slug: "Ya existe",
        },
      );
    if ((e as { code?: string }).code === "P2025")
      return fallo("NO_ENCONTRADO", "No encontramos ese servicio.");
    throw e;
  }
}
