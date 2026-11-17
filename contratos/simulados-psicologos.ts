// Datos simulados de psicólogos, perfil, horario y bloqueos (E05): misma forma que `servidor/psicologos/`.
import { fallo, ok, type Resultado } from "./resultado";
import type {
  CrearPsicologo,
  HorarioGuardado,
  PerfilPropio,
  PsicologoDetalle,
  UsuarioResumen,
} from "./psicologo";

const lista: UsuarioResumen[] = [
  {
    id: "psi-1",
    nombre: "Laura Gómez",
    correo: "laura@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "PSICOLOGIA",
    estado: "ACTIVO",
    ultimoIngreso: "2026-11-15T14:00:00-05:00",
  },
  {
    id: "psi-2",
    nombre: "Andrés Ruiz",
    correo: "andres@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "NEUROPSICOLOGIA",
    estado: "INVITADO",
    ultimoIngreso: null,
  },
  {
    id: "psi-3",
    nombre: "Marta Díaz",
    correo: "marta@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "PSICOLOGIA",
    estado: "INACTIVO",
    ultimoIngreso: "2026-08-01T09:00:00-05:00",
  },
];

export async function listarPsicologos(): Promise<Resultado<UsuarioResumen[]>> {
  return ok(lista);
}

// El correo "otro@gmail.com" siempre responde CORREO_NO_PERMITIDO; "laura@unilasallista.edu.co", CORREO_EN_USO.
export async function crearPsicologo(
  c: CrearPsicologo,
): Promise<Resultado<UsuarioResumen>> {
  if (!c.correo.endsWith("@unilasallista.edu.co"))
    return fallo("CORREO_NO_PERMITIDO", "Usa un correo institucional.", {
      correo: "Dominio no permitido",
    });
  if (c.correo === lista[0].correo)
    return fallo("CORREO_EN_USO", "Ya existe una cuenta con ese correo.", {
      correo: "Ya existe",
    });
  return ok({
    ...lista[1],
    id: "psi-nuevo",
    nombre: c.nombre,
    correo: c.correo,
    area: c.area,
  });
}

// "psi-1" tiene citas futuras: desactivarlo responde TIENE_CITAS_FUTURAS.
export async function cambiarActivo(e: {
  id: string;
  activo: boolean;
}): Promise<Resultado<UsuarioResumen>> {
  if (e.id === "psi-1" && !e.activo)
    return fallo(
      "TIENE_CITAS_FUTURAS",
      "Tiene citas próximas. Reasígnalas primero.",
      { citas: "CAPL-7K3F" },
    );
  return ok({ ...lista[0], estado: e.activo ? "ACTIVO" : "INACTIVO" });
}

export async function reenviarInvitacion(): Promise<Resultado<{ ok: true }>> {
  return ok({ ok: true });
}

export async function verPsicologo(): Promise<Resultado<PsicologoDetalle>> {
  return ok({
    ...lista[0],
    presentacion: "Acompaño procesos de ansiedad y estrés académico.",
    visible: true,
    fotoUrl: null,
    servicioIds: ["srv-1"],
  });
}

export async function obtenerMiPerfil(): Promise<Resultado<PerfilPropio>> {
  return ok({
    id: "psi-1",
    nombre: "Laura Gómez",
    area: "PSICOLOGIA",
    presentacion: "Acompaño procesos de ansiedad y estrés académico.",
    visible: true,
    fotoUrl: null,
    servicioIds: ["srv-1"],
    horario: { bloques: [{ diaSemana: 2, inicioMin: 480, finMin: 720 }] },
    bloqueos: [
      {
        id: "blq-1",
        desde: "2026-12-01T00:00:00-05:00",
        hasta: "2026-12-03T00:00:00-05:00",
        motivo: "Congreso",
        psicologoId: "psi-1",
      },
    ],
  });
}

// Un bloque con diaSemana 7 deja la cita CAPL-7K3F fuera del horario.
export async function guardarHorario(h: {
  bloques: { diaSemana: number }[];
}): Promise<Resultado<HorarioGuardado>> {
  return ok({
    horario: h as HorarioGuardado["horario"],
    citasFueraDeHorario: h.bloques.some((b) => b.diaSemana === 7)
      ? ["CAPL-7K3F"]
      : [],
  });
}

// Una imagen de más de 6 MB responde ARCHIVO_INVALIDO.
export async function subirFoto(
  bytes: Uint8Array,
): Promise<Resultado<{ fotoUrl: string }>> {
  if (bytes.byteLength > 6 * 1024 * 1024)
    return fallo(
      "ARCHIVO_INVALIDO",
      "Tamaño máximo: 6 MB. Formatos permitidos: JPG, PNG o WebP.",
    );
  return ok({ fotoUrl: "/archivos/fotos/ejemplo.webp" });
}
