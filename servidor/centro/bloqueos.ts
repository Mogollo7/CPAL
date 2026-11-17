// Bloqueos de todo el centro (RF-ADM-09) y festivos del año (RF-ADM-13). Los festivos no se guardan: se calculan.
import { z } from "zod";
import {
  bloqueoSchema,
  type BloqueoGuardado,
  type Festivo,
} from "../../contratos/bloqueo";
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { exigir, type Sesion } from "../permisos";
import { festivosColombia } from "./festivos";
import { validar } from "./validar";

type Fila = {
  id: string;
  desde: Date;
  hasta: Date;
  motivo: string | null;
  psicologoId: string | null;
};
export const aBloqueoGuardado = (b: Fila): BloqueoGuardado => ({
  id: b.id,
  desde: b.desde.toISOString(),
  hasta: b.hasta.toISOString(),
  motivo: b.motivo,
  psicologoId: b.psicologoId,
});

/** Bloqueos del centro que no han terminado, del más próximo al más lejano. */
export async function listarBloqueosCentro(
  sesion: Sesion | null | undefined,
): Promise<Resultado<BloqueoGuardado[]>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const filas = await bd.bloqueo.findMany({
    where: { psicologoId: null, hasta: { gte: new Date() } },
    orderBy: { desde: "asc" },
  });
  return ok(filas.map(aBloqueoGuardado));
}

/** Siempre es del centro entero: ignora cualquier `psicologoId` que llegue. */
export async function crearBloqueoCentro(
  sesion: Sesion | null | undefined,
  entrada: unknown,
): Promise<Resultado<BloqueoGuardado>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(bloqueoSchema, entrada);
  if (!v.ok) return v;
  const b = await bd.$transaction(async (tx) => {
    const fila = await tx.bloqueo.create({
      data: {
        desde: new Date(v.datos.desde),
        hasta: new Date(v.datos.hasta),
        motivo: v.datos.motivo,
        psicologoId: null,
        creadoPorId: p.datos.usuarioId,
      },
    });
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: "BLOQUEO_CENTRO_CREADO",
        entidad: "Bloqueo",
        entidadId: fila.id,
      },
      tx,
    );
    return fila;
  });
  return ok(aBloqueoGuardado(b));
}

export async function eliminarBloqueoCentro(
  sesion: Sesion | null | undefined,
  id: unknown,
): Promise<Resultado<{ ok: true }>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(z.string().min(1), id);
  if (!v.ok) return v;
  return bd.$transaction(async (tx) => {
    // Solo los del centro: un bloqueo personal de un psicólogo no se toca desde aquí.
    const r = await tx.bloqueo.deleteMany({
      where: { id: v.datos, psicologoId: null },
    });
    if (!r.count) return fallo("NO_ENCONTRADO", "No encontramos ese bloqueo.");
    await auditar(
      {
        usuarioId: p.datos.usuarioId,
        accion: "BLOQUEO_CENTRO_ELIMINADO",
        entidad: "Bloqueo",
        entidadId: v.datos,
      },
      tx,
    );
    return ok({ ok: true as const });
  });
}

/** Festivos de Colombia del año, para mostrarlos junto a los bloqueos. */
export async function listarFestivos(
  sesion: Sesion | null | undefined,
  anio: unknown,
): Promise<Resultado<Festivo[]>> {
  const p = exigir(sesion, "ADMIN");
  if (!p.ok) return p;
  const v = validar(z.number().int().min(2000).max(2100), anio);
  if (!v.ok) return v;
  return ok(festivosColombia(v.datos));
}
