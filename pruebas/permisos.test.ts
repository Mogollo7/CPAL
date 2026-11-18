/**
 * Tarea T-215: Pruebas de permisos de operaciones del servidor.
 *
 * Verifica sistemáticamente que toda operación que recibe `sesion` como primer argumento:
 *  1. Sin sesión (`null`) responde con código de error "NO_AUTENTICADO".
 *  2. Con un rol no permitido por la especificación (E05, S02) responde con código de error "SIN_PERMISO".
 *
 * El permiso se evalúa mediante `exigir()` en memoria antes de validar esquemas y antes de tocar
 * la base de datos, por lo que las entradas pueden ser vacías y no se requiere base de datos activa.
 *
 * -------------------------------------------------------------------------------------------------
 * OPERACIONES Y FUNCIONES EXCLUIDAS (no reciben sesión como primer argumento o son auxiliares/públicas):
 * -------------------------------------------------------------------------------------------------
 * 1. servidor/psicologos/perfil.ts:
 *    - `esImagenPermitida`: Función auxiliar pura de validación de encabezados binarios (JPEG, PNG, WebP).
 *
 * 2. servidor/centro/configuracion.ts:
 *    - `configuracionActual`: Consulta interna a la base de datos sin sesión para leer la configuración.
 *    - `dominioPermitido`: Función auxiliar pura para verificar dominios de correo institucional.
 *
 * 3. servidor/centro/bloqueos.ts:
 *    - `aBloqueoGuardado`: Función auxiliar pura de mapeo de fila de BD a contrato `BloqueoGuardado`.
 *
 * 4. servidor/eventos/eventos.ts:
 *    - `listarEventosPublicos`: Operación pública para consultar eventos vigentes en cartelera; no recibe sesión.
 *    - `verEventoPublico`: Operación pública para ver detalle de evento por slug; no recibe sesión.
 *
 * 5. servidor/citas/admin.ts:
 *    - `consultarCitas`: Consulta interna paginada de base de datos sin verificación de permisos; no recibe sesión.
 *    - `citasACsv`: Función auxiliar pura para formatear citas a texto CSV con BOM y CRLF.
 * -------------------------------------------------------------------------------------------------
 */

import { describe, expect, it } from "vitest";
import type { Rol, Sesion } from "../servidor/permisos";
import * as psicologos from "../servidor/psicologos/psicologos";
import * as perfil from "../servidor/psicologos/perfil";
import * as configuracion from "../servidor/centro/configuracion";
import * as bloqueos from "../servidor/centro/bloqueos";
import * as servicios from "../servidor/centro/servicios";
import * as eventos from "../servidor/eventos/eventos";
import * as citasAdmin from "../servidor/citas/admin";

try {
  process.loadEnvFile();
} catch {}

const sesionAdmin: Sesion = {
  usuarioId: "t215-admin",
  rol: "ADMIN",
  activo: true,
};

const sesionPsicologo: Sesion = {
  usuarioId: "t215-psi",
  rol: "PSICOLOGO",
  activo: true,
};

type CasoPermiso = {
  nombre: string;
  rolRequerido: Rol;
  ejecutar: (sesion: Sesion | null) => Promise<unknown> | unknown;
};

const operaciones: CasoPermiso[] = [
  // --- servidor/psicologos/psicologos.ts (8 operaciones, requieren ADMIN) ---
  {
    nombre: "psicologos.crearPsicologo",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.crearPsicologo(s, {}),
  },
  {
    nombre: "psicologos.crearAdministrador",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.crearAdministrador(s, {}),
  },
  {
    nombre: "psicologos.listarPsicologos",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.listarPsicologos(s),
  },
  {
    nombre: "psicologos.listarAdministradores",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.listarAdministradores(s),
  },
  {
    nombre: "psicologos.verPsicologo",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.verPsicologo(s, {}),
  },
  {
    nombre: "psicologos.actualizarPsicologo",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.actualizarPsicologo(s, {}),
  },
  {
    nombre: "psicologos.cambiarActivo",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.cambiarActivo(s, {}),
  },
  {
    nombre: "psicologos.reenviarInvitacion",
    rolRequerido: "ADMIN",
    ejecutar: (s) => psicologos.reenviarInvitacion(s, {}),
  },

  // --- servidor/psicologos/perfil.ts (6 operaciones, requieren PSICOLOGO) ---
  {
    nombre: "perfil.obtenerMiPerfil",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.obtenerMiPerfil(s),
  },
  {
    nombre: "perfil.actualizarPerfil",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.actualizarPerfil(s, {}),
  },
  {
    nombre: "perfil.subirFoto",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.subirFoto(s, new Uint8Array()),
  },
  {
    nombre: "perfil.guardarHorario",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.guardarHorario(s, {}),
  },
  {
    nombre: "perfil.crearBloqueo",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.crearBloqueo(s, {}),
  },
  {
    nombre: "perfil.eliminarBloqueo",
    rolRequerido: "PSICOLOGO",
    ejecutar: (s) => perfil.eliminarBloqueo(s, {}),
  },

  // --- servidor/centro/configuracion.ts (2 operaciones, requieren ADMIN) ---
  {
    nombre: "configuracion.obtenerConfiguracion",
    rolRequerido: "ADMIN",
    ejecutar: (s) => configuracion.obtenerConfiguracion(s),
  },
  {
    nombre: "configuracion.actualizarConfiguracion",
    rolRequerido: "ADMIN",
    ejecutar: (s) => configuracion.actualizarConfiguracion(s, {}),
  },

  // --- servidor/centro/bloqueos.ts (4 operaciones, requieren ADMIN) ---
  {
    nombre: "bloqueos.listarBloqueosCentro",
    rolRequerido: "ADMIN",
    ejecutar: (s) => bloqueos.listarBloqueosCentro(s),
  },
  {
    nombre: "bloqueos.crearBloqueoCentro",
    rolRequerido: "ADMIN",
    ejecutar: (s) => bloqueos.crearBloqueoCentro(s, {}),
  },
  {
    nombre: "bloqueos.eliminarBloqueoCentro",
    rolRequerido: "ADMIN",
    ejecutar: (s) => bloqueos.eliminarBloqueoCentro(s, {}),
  },
  {
    nombre: "bloqueos.listarFestivos",
    rolRequerido: "ADMIN",
    ejecutar: (s) => bloqueos.listarFestivos(s, {}),
  },

  // --- servidor/centro/servicios.ts (2 operaciones, requieren ADMIN) ---
  {
    nombre: "servicios.listarServicios",
    rolRequerido: "ADMIN",
    ejecutar: (s) => servicios.listarServicios(s),
  },
  {
    nombre: "servicios.guardarServicio",
    rolRequerido: "ADMIN",
    ejecutar: (s) => servicios.guardarServicio(s, {}),
  },

  // --- servidor/eventos/eventos.ts (4 operaciones, requieren ADMIN) ---
  {
    nombre: "eventos.crearEvento",
    rolRequerido: "ADMIN",
    ejecutar: (s) => eventos.crearEvento(s, {}),
  },
  {
    nombre: "eventos.editarEvento",
    rolRequerido: "ADMIN",
    ejecutar: (s) => eventos.editarEvento(s, {}, {}),
  },
  {
    nombre: "eventos.subirImagenEvento",
    rolRequerido: "ADMIN",
    ejecutar: (s) => eventos.subirImagenEvento(s, {}, new Uint8Array()),
  },
  {
    nombre: "eventos.listarEventos",
    rolRequerido: "ADMIN",
    ejecutar: (s) => eventos.listarEventos(s),
  },

  // --- servidor/citas/admin.ts (8 operaciones, requieren ADMIN) ---
  {
    nombre: "citasAdmin.listarCitas",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.listarCitas(s, {}),
  },
  {
    nombre: "citasAdmin.verCitaAdmin",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.verCitaAdmin(s, ""),
  },
  {
    nombre: "citasAdmin.autorizarCita",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.autorizarCita(s, ""),
  },
  {
    nombre: "citasAdmin.rechazarCita",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.rechazarCita(s, {}),
  },
  {
    nombre: "citasAdmin.cancelarCitaAdmin",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.cancelarCitaAdmin(s, {}),
  },
  {
    nombre: "citasAdmin.marcarAsistencia",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.marcarAsistencia(s, {}),
  },
  {
    nombre: "citasAdmin.reasignarCita",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.reasignarCita(s, {}),
  },
  {
    nombre: "citasAdmin.exportarCitas",
    rolRequerido: "ADMIN",
    ejecutar: (s) => citasAdmin.exportarCitas(s, {}),
  },
];

describe("T-215: verificación de permisos y autenticación en operaciones de servidor", () => {
  it.each(operaciones)(
    "$nombre: responde NO_AUTENTICADO sin sesión y SIN_PERMISO con rol no permitido ($rolRequerido)",
    async ({ ejecutar, rolRequerido }) => {
      const sesionNoPermitida =
        rolRequerido === "ADMIN" ? sesionPsicologo : sesionAdmin;

      const resultadoSinSesion = await ejecutar(null);
      expect(resultadoSinSesion).toMatchObject({
        ok: false,
        codigo: "NO_AUTENTICADO",
      });

      const resultadoSinPermiso = await ejecutar(sesionNoPermitida);
      expect(resultadoSinPermiso).toMatchObject({
        ok: false,
        codigo: "SIN_PERMISO",
      });
    },
  );
});
