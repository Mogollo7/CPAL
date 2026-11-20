// Operaciones públicas de cupos (E05): `obtenerCupos` (la usa GET /api/cupos) y `listarPsicologosDeServicio`.
import {
  consultaCupoSchema,
  type Cupo,
  type PsicologoDeServicio,
} from "../../contratos/cupo";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import type { Prisma } from "../generado/client";
import { bd } from "../bd";
import { limitar } from "../limites";
import { redTruncada, registrar } from "../registro";
import { cuposDeServicio } from "./datos";

type PaginaCupos = {
  cupos: Cupo[];
  cursor: string | null;
  siguiente: string | null;
};

type Contexto = { ip: string; ahora?: Date };

type DatosCupos<Entrada> = unknown extends Entrada
  ? Cupo[] | PaginaCupos
  : Entrada extends { modo: "agenda" }
    ? PaginaCupos
    : Cupo[];

export function obtenerCupos<Entrada>(
  entrada: Entrada,
  contexto: Contexto,
): Promise<Resultado<DatosCupos<Entrada>>>;

export async function obtenerCupos(
  entrada: unknown,
  { ip, ahora = new Date() }: Contexto,
): Promise<Resultado<Cupo[] | PaginaCupos>> {
  const lim = limitar("consultarCupos", ip, ahora.getTime());
  if (!lim.permitido) {
    registrar("limite.excedido", {
      nivel: "aviso",
      accion: "consultarCupos",
      red: redTruncada(ip),
    });
    return fallo(
      "DEMASIADOS_INTENTOS",
      `Hiciste muchas consultas. Vuelve a intentarlo en ${lim.esperaSeg} segundos.`,
    );
  }
  const v = consultaCupoSchema.safeParse(entrada);
  if (!v.success) {
    const campos: Record<string, string> = {};
    for (const i of v.error.issues)
      campos[i.path.join(".") || "_"] ??= i.message;
    return fallo("VALIDACION", "Revisa las fechas y el servicio.", campos);
  }
  const { servicioId, psicologoId, desde, hasta } = v.data;
  const opciones = { psicologoId: psicologoId || undefined };
  const fin = new Date(hasta);
  const r = await cuposDeServicio(
    servicioId,
    new Date(desde),
    fin,
    ahora,
    opciones,
  );
  if (!r)
    return fallo(
      "SERVICIO_NO_DISPONIBLE",
      "Este servicio no se puede pedir en línea por ahora.",
    );
  if (!(
    entrada &&
    typeof entrada === "object" &&
    "modo" in entrada &&
    entrada.modo === "agenda"
  ))
    return ok(r.cupos);

  const finAgenda = new Date(
    ahora.getTime() + r.config.anticipacionMaxDias * 86_400_000 + 1,
  );
  const cursor = fin < finAgenda ? fin.toISOString() : null;
  if (!cursor || r.cupos.length)
    return ok({ cupos: r.cupos, cursor, siguiente: null });

  const resto = await cuposDeServicio(
    servicioId,
    fin,
    finAgenda,
    ahora,
    opciones,
  );
  const siguiente = resto?.cupos[0]?.inicio ?? null;
  return ok({ cupos: r.cupos, cursor: siguiente ? cursor : null, siguiente });
}

/** Psicólogos activos que atienden el servicio y tienen horario (para elegir con quién). */
export async function listarPsicologosDeServicio(
  servicioId: string,
): Promise<Resultado<PsicologoDeServicio[]>> {
  return ok(
    await psicologosPublicos({
      perfil: { servicios: { some: { id: servicioId } } },
      disponibilidades: { some: {} },
    }),
  );
}

/** /equipo: todas las personas que atienden (activas), sin datos de contacto. */
export async function listarEquipoPublico(): Promise<
  Resultado<PsicologoDeServicio[]>
> {
  return ok(await psicologosPublicos({}));
}

async function psicologosPublicos(
  filtro: Prisma.UsuarioWhereInput,
): Promise<PsicologoDeServicio[]> {
  const usuarios = await bd.usuario.findMany({
    where: { rol: "PSICOLOGO", activo: true, ...filtro },
    select: {
      id: true,
      nombre: true,
      perfil: { select: { presentacion: true, fotoRuta: true } },
    },
    orderBy: { nombre: "asc" },
  });
  return usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    presentacion: u.perfil?.presentacion ?? "",
    fotoUrl: u.perfil?.fotoRuta ? `/archivos/${u.perfil.fotoRuta}` : null, // SUPUESTO: igual que servidor/psicologos
  }));
}
