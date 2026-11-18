// Operaciones públicas de cupos (E05): `obtenerCupos` (la usa GET /api/cupos) y `listarPsicologosDeServicio`.
import {
  consultaCupoSchema,
  type Cupo,
  type PsicologoDeServicio,
} from "../../contratos/cupo";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { bd } from "../bd";
import { limitar } from "../limites";
import { redTruncada, registrar } from "../registro";
import { cuposDeServicio } from "./datos";

export async function obtenerCupos(
  entrada: unknown,
  { ip, ahora = new Date() }: { ip: string; ahora?: Date },
): Promise<Resultado<Cupo[]>> {
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
  const r = await cuposDeServicio(
    servicioId,
    new Date(desde),
    new Date(hasta),
    ahora,
    { psicologoId: psicologoId || undefined },
  );
  if (!r)
    return fallo(
      "SERVICIO_NO_DISPONIBLE",
      "Este servicio no se puede pedir en línea por ahora.",
    );
  return ok(r.cupos);
}

/** Psicólogos activos que atienden el servicio y tienen horario (para elegir con quién). */
export async function listarPsicologosDeServicio(
  servicioId: string,
): Promise<Resultado<PsicologoDeServicio[]>> {
  const usuarios = await bd.usuario.findMany({
    where: {
      rol: "PSICOLOGO",
      activo: true,
      perfil: { servicios: { some: { id: servicioId } } },
      disponibilidades: { some: {} },
    },
    select: {
      id: true,
      nombre: true,
      perfil: { select: { presentacion: true, fotoRuta: true } },
    },
    orderBy: { nombre: "asc" },
  });
  return ok(
    usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      presentacion: u.perfil?.presentacion ?? "",
      fotoUrl: u.perfil?.fotoRuta ? `/archivos/${u.perfil.fotoRuta}` : null, // SUPUESTO: igual que servidor/psicologos
    })),
  );
}
