"use server";
// Acciones de servidor del panel y del sitio público: lo ÚNICO que las pantallas importan para operar.
// Cada una toma la sesión de la petición, exige confirmación de contraseña si la acción es sensible (S02) y delega
// en la operación, que comprueba el rol, valida la entrada y devuelve `Resultado`. Las de cuenta (ingresar, claves,
// segundo paso) viven en `servidor/cuentas/acciones.ts`. Guía de uso: cerebro/especificacion/E10-Guia-de-Operaciones.md
import { headers } from "next/headers";
import { fallo, ok, type Resultado } from "../contratos/resultado";
import { filtrosCitaSchema } from "../contratos/filtros-cita";
import * as centroBloqueos from "./centro/bloqueos";
import * as centroConfig from "./centro/configuracion";
import * as centroServicios from "./centro/servicios";
import { validar } from "./centro/validar";
import * as citasAdmin from "./citas/admin";
import { crearCita } from "./citas/crear";
import { listarPsicologosDeServicio, obtenerCupos } from "./citas/cupos";
import * as citasGestion from "./citas/gestion";
import * as correoPanel from "./correo/panel";
import { exigirClaveReciente, obtenerSesion } from "./cuentas/sesionActual";
import * as eventos from "./eventos/eventos";
import { exigir, type Sesion } from "./permisos";
import * as perfil from "./psicologos/perfil";
import * as psicologos from "./psicologos/psicologos";

/** Acción sensible: administrador con contraseña confirmada hace menos de 10 minutos; si no, `CONFIRMACION_REQUERIDA`. */
async function sensible<T>(
  op: (s: Sesion) => Promise<Resultado<T>>,
): Promise<Resultado<T>> {
  const s = exigir(await obtenerSesion(), "ADMIN");
  if (!s.ok) return s;
  const c = await exigirClaveReciente(s.datos);
  return c.ok ? op(s.datos) : c;
}

const ip = async () =>
  (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ||
  "desconocida";

/** Lee el archivo del campo `campo` de un formulario; vacío si no viene (la operación responde `ARCHIVO_INVALIDO`). */
async function bytes(formData: FormData, campo: string): Promise<Uint8Array> {
  const a = formData.get(campo);
  return a instanceof File
    ? new Uint8Array(await a.arrayBuffer())
    : new Uint8Array();
}

// --- Sitio público (sin sesión) -------------------------------------------------------------------------------

export const crearCitaAccion = async (entrada: unknown) =>
  crearCita(entrada, { ip: await ip() });
export const obtenerCuposAccion = async (entrada: unknown) =>
  obtenerCupos(entrada, { ip: await ip() });
export const listarPsicologosDeServicioAccion = async (servicioId: string) =>
  listarPsicologosDeServicio(servicioId);
/** `token` es el tramo final del enlace `/cita/{token}` que llega por correo. */
export const verCitaAccion = async (token: string) =>
  citasGestion.verCita(token);
export const cancelarCitaAccion = async (token: string) =>
  citasGestion.cancelarCita(token);
export const reprogramarCitaAccion = async (entrada: unknown) =>
  citasGestion.reprogramarCita(entrada);
export const listarEventosPublicosAccion = async () =>
  eventos.listarEventosPublicos();
export const verEventoPublicoAccion = async (slug: string) =>
  eventos.verEventoPublico(slug);

// --- Administración: citas ------------------------------------------------------------------------------------

export const listarCitasAccion = async (filtros: unknown) =>
  citasAdmin.listarCitas(await obtenerSesion(), filtros);
export const verCitaAdminAccion = async (id: string) =>
  citasAdmin.verCitaAdmin(await obtenerSesion(), id);
export const autorizarCitaAccion = async (id: string) =>
  citasAdmin.autorizarCita(await obtenerSesion(), id);
export const rechazarCitaAccion = async (entrada: unknown) =>
  citasAdmin.rechazarCita(await obtenerSesion(), entrada);
export const cancelarCitaAdminAccion = async (entrada: unknown) =>
  citasAdmin.cancelarCitaAdmin(await obtenerSesion(), entrada);
export const marcarAsistenciaAccion = async (entrada: unknown) =>
  citasAdmin.marcarAsistencia(await obtenerSesion(), entrada);
export const reasignarCitaAccion = async (entrada: unknown) =>
  citasAdmin.reasignarCita(await obtenerSesion(), entrada);
// Exportar a CSV no es una acción: es la descarga GET /api/admin/exportar (mismos filtros en la consulta).

/** Correos de una cita con su estado de entrega (RF-COR-12). */
export async function correosDeCitaAccion(citaId: string) {
  const s = exigir(await obtenerSesion(), "ADMIN");
  return s.ok ? ok(await correoPanel.correosDeCita(citaId)) : s;
}
export async function trabajosFallidosAccion() {
  const s = exigir(await obtenerSesion(), "ADMIN");
  return s.ok ? ok(await correoPanel.trabajosFallidos()) : s;
}
export async function reintentarTrabajoAccion(
  trabajoId: string,
): Promise<Resultado<{ ok: true }>> {
  const s = exigir(await obtenerSesion(), "ADMIN");
  if (!s.ok) return s;
  const r = await correoPanel.reintentarTrabajo(trabajoId, s.datos.usuarioId);
  return r.ok
    ? ok({ ok: true })
    : fallo("NO_ENCONTRADO", "Ese envío ya no se puede reintentar.");
}

// --- Administración: psicólogos y administradores -------------------------------------------------------------

export const listarPsicologosAccion = async () =>
  psicologos.listarPsicologos(await obtenerSesion());
export const verPsicologoAccion = async (id: string) =>
  psicologos.verPsicologo(await obtenerSesion(), id);
export const crearPsicologoAccion = async (entrada: unknown) =>
  psicologos.crearPsicologo(await obtenerSesion(), entrada);
export const actualizarPsicologoAccion = async (entrada: unknown) =>
  psicologos.actualizarPsicologo(await obtenerSesion(), entrada);
export const reenviarInvitacionAccion = async (id: string) =>
  psicologos.reenviarInvitacion(await obtenerSesion(), id);
export const listarAdministradoresAccion = async () =>
  psicologos.listarAdministradores(await obtenerSesion());
/** Sensible: crear administradores. */
export const crearAdministradorAccion = async (entrada: unknown) =>
  sensible((s) => psicologos.crearAdministrador(s, entrada));
/** Sensible: activar o desactivar a un psicólogo o a un administrador (`{ id, activo }`). */
export const cambiarActivoAccion = async (entrada: unknown) =>
  sensible((s) => psicologos.cambiarActivo(s, entrada));

// --- Administración: centro -----------------------------------------------------------------------------------

/** Sensible: ver y cambiar la configuración. */
export const obtenerConfiguracionAccion = async () =>
  sensible((s) => centroConfig.obtenerConfiguracion(s));
export const actualizarConfiguracionAccion = async (entrada: unknown) =>
  sensible((s) => centroConfig.actualizarConfiguracion(s, entrada));
export const listarBloqueosCentroAccion = async () =>
  centroBloqueos.listarBloqueosCentro(await obtenerSesion());
export const crearBloqueoCentroAccion = async (entrada: unknown) =>
  centroBloqueos.crearBloqueoCentro(await obtenerSesion(), entrada);
export const eliminarBloqueoCentroAccion = async (id: string) =>
  centroBloqueos.eliminarBloqueoCentro(await obtenerSesion(), id);
export const listarFestivosAccion = async (anio: number) =>
  centroBloqueos.listarFestivos(await obtenerSesion(), anio);
export const listarServiciosAccion = async () =>
  centroServicios.listarServicios(await obtenerSesion());
export const guardarServicioAccion = async (entrada: unknown) =>
  centroServicios.guardarServicio(await obtenerSesion(), entrada);

// --- Administración: eventos ----------------------------------------------------------------------------------

export const listarEventosAccion = async () =>
  eventos.listarEventos(await obtenerSesion());
export const crearEventoAccion = async (entrada: unknown) =>
  eventos.crearEvento(await obtenerSesion(), entrada);
export const editarEventoAccion = async (id: string, entrada: unknown) =>
  eventos.editarEvento(await obtenerSesion(), id, entrada);
/** Formulario con el archivo en el campo `imagen`. */
export const subirImagenEventoAccion = async (id: string, formData: FormData) =>
  eventos.subirImagenEvento(
    await obtenerSesion(),
    id,
    await bytes(formData, "imagen"),
  );

// --- Psicólogo: lo propio (el "quién" sale siempre de la sesión) ------------------------------------------------

export const obtenerMiPerfilAccion = async () =>
  perfil.obtenerMiPerfil(await obtenerSesion());
export const actualizarPerfilAccion = async (entrada: unknown) =>
  perfil.actualizarPerfil(await obtenerSesion(), entrada);
/** Formulario con el archivo en el campo `foto`. */
export const subirFotoAccion = async (formData: FormData) =>
  perfil.subirFoto(await obtenerSesion(), await bytes(formData, "foto"));
export const guardarHorarioAccion = async (entrada: unknown) =>
  perfil.guardarHorario(await obtenerSesion(), entrada);
export const crearBloqueoAccion = async (entrada: unknown) =>
  perfil.crearBloqueo(await obtenerSesion(), entrada);
export const eliminarBloqueoAccion = async (id: string) =>
  perfil.eliminarBloqueo(await obtenerSesion(), id);

/** Citas del psicólogo que tiene la sesión; nunca las de otro (RF-PSI-04, 05). Mismos filtros de la bandeja. */
export async function listarMisCitasAccion(filtros: unknown) {
  const s = exigir(await obtenerSesion(), "PSICOLOGO");
  if (!s.ok) return s;
  const f = validar(filtrosCitaSchema, filtros ?? {});
  return f.ok
    ? ok(await citasAdmin.consultarCitas(f.datos, s.datos.usuarioId))
    : f;
}
