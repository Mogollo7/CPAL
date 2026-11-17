// Datos simulados de configuración, bloqueos del centro, festivos y servicios (E05).
import type { BloqueoGuardado, Festivo } from "./bloqueo";
import type { Configuracion } from "./configuracion";
import { ok, type Resultado } from "./resultado";
import type { ServicioGuardado } from "./servicio";

export const configuracionSimulada: Configuracion = {
  autoAutorizar: false,
  anticipacionMinHoras: 24,
  anticipacionMaxDias: 30,
  cancelacionMinHoras: 12,
  maxCitasActivas: 1,
  maxReprogramaciones: 2,
  vencimientoPendienteHoras: 48,
  duracionEnlaceHoras: 48,
  conservacionMeses: 12,
  dominiosPermitidos: ["unilasallista.edu.co"],
  correoAdministracion: "capl@unilasallista.edu.co",
};

export async function obtenerConfiguracion(): Promise<
  Resultado<Configuracion>
> {
  return ok(configuracionSimulada);
}

export async function listarBloqueosCentro(): Promise<
  Resultado<BloqueoGuardado[]>
> {
  return ok([
    {
      id: "blq-c1",
      desde: "2026-12-20T00:00:00-05:00",
      hasta: "2027-01-11T00:00:00-05:00",
      motivo: "Vacaciones",
      psicologoId: null,
    },
  ]);
}

export async function listarFestivos(): Promise<Resultado<Festivo[]>> {
  return ok([
    { fecha: "2026-11-16", nombre: "Independencia de Cartagena" },
    { fecha: "2026-12-08", nombre: "Inmaculada Concepción" },
    { fecha: "2026-12-25", nombre: "Navidad" },
  ]);
}

export async function listarServicios(): Promise<
  Resultado<ServicioGuardado[]>
> {
  return ok([
    {
      id: "srv-1",
      slug: "atencion-psicologica",
      nombre: "Atención psicológica",
      descripcion: "Orientación y acompañamiento individual.",
      duracionMin: 60,
      area: "PSICOLOGIA",
      agendableEnLinea: true,
      activo: true,
      orden: 1,
    },
    {
      id: "srv-2",
      slug: "valoracion-neuropsicologica",
      nombre: "Valoración neuropsicológica",
      descripcion: "Evaluación de atención y memoria.",
      duracionMin: 60,
      area: "NEUROPSICOLOGIA",
      agendableEnLinea: false,
      activo: true,
      orden: 2,
    },
  ]);
}
