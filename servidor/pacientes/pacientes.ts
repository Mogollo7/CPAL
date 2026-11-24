// Fichas de pacientes del psicólogo (sin tabla propia): una ficha = las citas de un mismo `pacienteDocumento`
// atendidas por la persona de la sesión. Nunca se leen citas de otro psicólogo.
import { fallo, ok, type Resultado } from "../../contratos/resultado";
import type { EstadoCita } from "../../contratos/cita";
import { auditar } from "../auditoria";
import { bd } from "../bd";
import { descifrar } from "../citas/cifrado";
import { exigir, type Sesion } from "../permisos";
import { registrar } from "../registro";

export type PacienteResumen = {
  documento: string;
  nombre: string;
  edad: number | null;
  citas: number;
  ultimaCita: string; // ISO de la cita más reciente
  proximaEstado: EstadoCita | null; // estado de la próxima cita futura viva, si la hay
};

export type CitaDePaciente = {
  id: string;
  codigo: string;
  inicio: string;
  servicio: string;
  estado: EstadoCita;
  motivo: string | null; // descifrado; solo en la ficha
};

export type FichaPaciente = Omit<
  PacienteResumen,
  "ultimaCita" | "proximaEstado"
> & {
  historial: CitaDePaciente[]; // de la más reciente a la más antigua
};

const VIVAS: EstadoCita[] = ["PENDIENTE", "AUTORIZADA"];

export async function listarPacientes(
  sesion: Sesion | null | undefined,
  ahora = new Date(),
): Promise<Resultado<PacienteResumen[]>> {
  const p = exigir(sesion, "PSICOLOGO");
  if (!p.ok) return p;
  const filas = await bd.cita.findMany({
    where: { psicologoId: p.datos.usuarioId, pacienteDocumento: { not: null } },
    orderBy: [{ inicio: "desc" }, { id: "asc" }],
    select: {
      pacienteDocumento: true,
      pacienteNombre: true,
      solicitanteNombre: true,
      pacienteEdad: true,
      inicio: true,
      estado: true,
    },
  });
  const porDoc = new Map<string, PacienteResumen>();
  for (const c of filas) {
    const doc = c.pacienteDocumento!;
    let r = porDoc.get(doc);
    if (!r) {
      // Primera fila = la cita más reciente: de ahí salen nombre y edad vigentes.
      r = {
        documento: doc,
        nombre: c.pacienteNombre || c.solicitanteNombre || "Sin nombre",
        edad: c.pacienteEdad,
        citas: 0,
        ultimaCita: c.inicio.toISOString(),
        proximaEstado: null,
      };
      porDoc.set(doc, r);
    }
    r.citas++;
  }
  // La próxima es la futura viva más cercana: se recorre en orden ascendente.
  for (const c of [...filas].reverse()) {
    const r = porDoc.get(c.pacienteDocumento!)!;
    if (!r.proximaEstado && c.inicio >= ahora && VIVAS.includes(c.estado))
      r.proximaEstado = c.estado;
  }
  return ok([...porDoc.values()]);
}

export async function verPaciente(
  sesion: Sesion | null | undefined,
  documento: string,
): Promise<Resultado<FichaPaciente>> {
  const p = exigir(sesion, "PSICOLOGO");
  if (!p.ok) return p;
  const doc = String(documento ?? "");
  const filas = await bd.cita.findMany({
    where: { psicologoId: p.datos.usuarioId, pacienteDocumento: doc },
    orderBy: [{ inicio: "desc" }, { id: "asc" }],
    include: { servicio: { select: { nombre: true } } },
  });
  if (!filas.length)
    return fallo("NO_ENCONTRADO", "No encontramos a esa persona.");
  await auditar({
    usuarioId: p.datos.usuarioId,
    accion: "PACIENTE_FICHA_VER",
    entidad: "Paciente",
    entidadId: filas[0].id, // sin documento: la auditoría no lleva datos personales
  });
  const [ultima] = filas;
  return ok({
    documento: doc,
    nombre: ultima.pacienteNombre || ultima.solicitanteNombre || "Sin nombre",
    edad: ultima.pacienteEdad,
    citas: filas.length,
    historial: filas.map((c) => {
      let motivo: string | null = null;
      if (c.motivo) {
        try {
          motivo = descifrar(c.motivo);
        } catch {
          registrar("http.error", {
            nivel: "error",
            rol: "psicologo",
            entidad: `cita:${c.id}`,
            resultado: "MOTIVO_ILEGIBLE",
          });
        }
      }
      return {
        id: c.id,
        codigo: c.codigo,
        inicio: c.inicio.toISOString(),
        servicio: c.servicio.nombre,
        estado: c.estado,
        motivo,
      };
    }),
  });
}
