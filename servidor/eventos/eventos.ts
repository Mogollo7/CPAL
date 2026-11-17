// Cartelera de eventos (RF-EVE-01, 06). Informativa: SIN inscripciones ni cupos (RF-EVE-03/04/05 descartados).
// Visible al público = `publicado` y `fin` (o `inicio` si no hay fin) en el futuro (E03 §10).
import { borrarArchivo, guardarImagen } from "../archivos";
import { z } from "zod";
import { eventoSchema, type EventoDetalle } from "../../contratos/evento";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { esDuplicado, slugificar, validar } from "../centro/validar";
import { exigir, type Sesion } from "../permisos";

type Fila = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  inicio: Date;
  fin: Date | null;
  lugar: string;
  enlace: string | null;
  imagenRuta: string | null;
  publicado: boolean;
};

const aDetalle = (e: Fila): EventoDetalle => ({
  id: e.id,
  slug: e.slug,
  titulo: e.titulo,
  descripcion: e.descripcion,
  inicio: e.inicio.toISOString(),
  fin: e.fin?.toISOString() ?? null,
  lugar: e.lugar,
  enlace: e.enlace,
  imagenUrl: e.imagenRuta ? `/archivos/${e.imagenRuta}` : null, // SUPUESTO: ruta pública de archivos
  publicado: e.publicado,
});

/** "No ha terminado": termina en el futuro, o no tiene fin y empieza en el futuro. */
const activo = (ahora: Date) => ({
  OR: [{ fin: { gte: ahora } }, { fin: null, inicio: { gte: ahora } }],
});

const idSchema = z.string().min(1);

/** Slug único: del título, con sufijo corto si ya existe. */
async function slugLibre(titulo: string): Promise<string> {
  const base = slugificar(titulo);
  for (let n = 0; n < 20; n++) {
    const s = n ? `${base}-${n + 1}` : base;
    if (
      !(await bd.evento.findUnique({
        where: { slug: s },
        select: { id: true },
      }))
    )
      return s;
  }
  return `${base}-${Date.now().toString(36)}`;
}

const datos = (e: z.output<typeof eventoSchema>) => ({
  titulo: e.titulo,
  descripcion: e.descripcion,
  inicio: new Date(e.inicio),
  fin: e.fin ? new Date(e.fin) : null,
  lugar: e.lugar,
  enlace: e.enlace ?? null,
  publicado: e.publicado,
});

export async function crearEvento(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<EventoDetalle>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(eventoSchema, entrada);
  if (!v.ok) return v;
  for (let intento = 0; ; intento++) {
    try {
      const e = await bd.$transaction(async (tx) => {
        const fila = await tx.evento.create({
          data: { ...datos(v.datos), slug: await slugLibre(v.datos.titulo) },
        });
        await auditar(
          {
            usuarioId: p.datos.usuarioId,
            accion: "EVENTO_CREADO",
            entidad: "Evento",
            entidadId: fila.id,
            detalle: { publicado: fila.publicado },
          },
          tx,
        );
        return fila;
      });
      return ok(aDetalle(e));
    } catch (e) {
      if (!esDuplicado(e) || intento >= 2) throw e; // dos altas simultáneas con el mismo título: reintenta con otro slug
    }
  }
}

/** Edita todos los campos (incluido publicar o despublicar). El `slug` no cambia: las direcciones compartidas siguen vivas. */
export async function editarEvento(
  sesion: Sesion | null | undefined,
  id: unknown,
  entrada: unknown,
): Promise<Resultado<EventoDetalle>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const vi = validar(idSchema, id);
  if (!vi.ok) return vi;
  const v = validar(eventoSchema, entrada);
  if (!v.ok) return v;
  return bd.$transaction(async (tx) => {
    const antes = await tx.evento.findUnique({
      where: { id: vi.datos },
      select: { publicado: true },
    });
    if (!antes) return fallo("NO_ENCONTRADO", "No encontramos ese evento.");
    const fila = await tx.evento.update({
      where: { id: vi.datos },
      data: datos(v.datos),
    });
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion:
          antes.publicado === fila.publicado
            ? "EVENTO_EDITADO"
            : fila.publicado
              ? "EVENTO_PUBLICADO"
              : "EVENTO_DESPUBLICADO",
        entidad: "Evento",
        entidadId: fila.id,
      },
      tx,
    );
    return ok(aDetalle(fila));
  });
}

const MENSAJE_IMAGEN =
  "Tamaño máximo: 6 MB. Formatos permitidos: JPG, PNG o WebP.";

/** Imagen del evento: 1200 × 630 (proporción de tarjeta para redes), WebP, sin metadatos; borra la anterior. */
export async function subirImagenEvento(
  sesion: Sesion | null | undefined,
  id: unknown,
  archivo: Uint8Array,
): Promise<Resultado<EventoDetalle>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const vi = validar(idSchema, id);
  if (!vi.ok) return vi;
  const antes = await bd.evento.findUnique({
    where: { id: vi.datos },
    select: { imagenRuta: true },
  });
  if (!antes) return fallo("NO_ENCONTRADO", "No encontramos ese evento.");
  const ruta = await guardarImagen(archivo, "eventos", {
    ancho: 1200,
    alto: 630,
    maxBytes: 6 * 1024 * 1024,
  });
  if (!ruta)
    return fallo("ARCHIVO_INVALIDO", MENSAJE_IMAGEN, {
      imagen: MENSAJE_IMAGEN,
    });
  const fila = await bd.evento.update({
    where: { id: vi.datos },
    data: { imagenRuta: ruta },
  });
  await borrarArchivo(antes.imagenRuta);
  await auditar({
    usuarioId: p.datos.usuarioId,
    accion: "EVENTO_EDITADO",
    entidad: "Evento",
    entidadId: fila.id,
  });
  return ok(aDetalle(fila));
}

/** Todos los eventos (publicados o no, pasados o futuros) para el panel; el más reciente primero. */
export async function listarEventos(
  sesion: Sesion | null | undefined,
): Promise<Resultado<EventoDetalle[]>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const filas = await bd.evento.findMany({ orderBy: { inicio: "desc" } });
  return ok(filas.map(aDetalle));
}

/** Cartelera pública (sin sesión): publicados que no han terminado, el más próximo primero (RF-EVE-06). */
export async function listarEventosPublicos(
  ahora: Date = new Date(),
): Promise<Resultado<EventoDetalle[]>> {
  const filas = await bd.evento.findMany({
    where: { publicado: true, ...activo(ahora) },
    orderBy: { inicio: "asc" },
  });
  return ok(filas.map(aDetalle));
}

export async function verEventoPublico(
  slug: unknown,
  ahora: Date = new Date(),
): Promise<Resultado<EventoDetalle>> {
  const v = validar(z.string().min(1).max(120), slug);
  if (!v.ok) return fallo("NO_ENCONTRADO", "No encontramos ese evento.");
  const e = await bd.evento.findFirst({
    where: { slug: v.datos, publicado: true, ...activo(ahora) },
  });
  return e
    ? ok(aDetalle(e))
    : fallo("NO_ENCONTRADO", "No encontramos ese evento.");
}
