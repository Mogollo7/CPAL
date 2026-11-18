---
tags: [capl, especificacion, operaciones, guia, frontend]
---

# E10 · Guía de Operaciones para Pantallas

Volver a [[E00-Especificacion-Inicio]]. Complementa y aterriza a código real lo acordado en [[E05-Operaciones-y-Contratos]] para quienes maquetan y conectan las pantallas ([[E04-Pantallas-y-Rutas]]).

Esta guía describe **exactamente lo que el código implementado hace en el repositorio** en este momento. Cuando una operación planificada en especificaciones anteriores aún no existe o difiere en código, se explicita claramente para evitar suposiciones.

---

## 0. Lo que importan las pantallas: `servidor/acciones.ts`

Las pantallas **no llaman a las operaciones de los módulos directamente**: importan las acciones de servidor, que ya toman la sesión de la petición y piden confirmar la contraseña cuando la acción es sensible. Hay dos archivos:

| Archivo | Contiene |
| ------- | -------- |
| `servidor/cuentas/acciones.ts` | Ingresar, código del segundo paso, crear y cambiar contraseña, confirmar contraseña, cerrar sesión y `cerrarMisSesionesAccion` (cierra todas, en todos los dispositivos) |
| `servidor/acciones.ts` | Todo lo demás: sitio público (pedir cita, cupos, ver, cancelar y reprogramar con el enlace, eventos), administración (citas, psicólogos, administradores, configuración, bloqueos, servicios, eventos, correos de una cita) y lo propio del psicólogo (perfil, foto, horario, ausencias, mis citas) |

Cada acción se llama igual que la operación que envuelve, con el sufijo `Accion` (`autorizarCita` → `autorizarCitaAccion`), recibe solo la entrada (la sesión la pone el servidor) y devuelve el mismo `Resultado`.

```tsx
"use client";
import { autorizarCitaAccion } from "@/servidor/acciones";

const r = await autorizarCitaAccion(cita.id);
if (!r.ok) mostrarError(r.mensaje); // r.codigo dice cuál fue: SIN_PERMISO, TRANSICION_INVALIDA…
```

- **Acciones sensibles** (`crearAdministradorAccion`, `cambiarActivoAccion`, `obtenerConfiguracionAccion`, `actualizarConfiguracionAccion` y la descarga de CSV): si pasaron más de 10 minutos desde la última confirmación devuelven `CONFIRMACION_REQUERIDA`. La pantalla pide la contraseña con `confirmarClaveAccion` y reintenta.
- **Archivos**: `subirFotoAccion(formData)` espera el archivo en el campo `foto`; `subirImagenEventoAccion(id, formData)`, en el campo `imagen`. JPG, PNG o WebP de hasta 6 MB.
- **Exportar a CSV** no es una acción: es un enlace a `GET /api/admin/exportar` con los mismos filtros de la bandeja en la consulta.
- **Imágenes subidas**: se muestran con la URL que devuelve el servidor (`/archivos/fotos/….webp`, `/archivos/eventos/….webp`).

---

## 1. Patrón de Respuesta: Tipo `Resultado<T>`

Toda operación del servidor (salvo utilidades auxiliares o consultas de panel documentadas aparte) responde con la estructura unificada definida en `contratos/resultado.ts`:

```ts
export type Resultado<T> =
  | { ok: true; datos: T }
  | {
      ok: false;
      codigo: CodigoError;
      mensaje: string;
      campos?: Record<string, string>;
    };
```

### Reglas para la UI
1. **`r.ok === true`**: TypeScript estrecha la unión automáticamente y permite acceder con seguridad a `r.datos`.
2. **`r.ok === false`**:
   - `r.mensaje`: Viene redactado en español listo para mostrarse al usuario en alertas o notificaciones ([[N08-Lenguaje-y-Tono]]).
   - `r.campos`: Cuando `r.codigo === "VALIDACION"`, es un diccionario `{ [nombreCampo]: "Mensaje de error" }` para resaltar inputs específicos.
   - `r.codigo`: Permite a la pantalla reaccionar con comportamientos especiales (redirigir, abrir modales, cambiar de paso).

### Catálogo de códigos de error (`CODIGOS_ERROR`)

| Código | Significado en el sistema | Reacción típica en pantalla |
|---|---|---|
| `VALIDACION` | Datos que no cumplen el esquema Zod o reglas de formato | Pintar mensajes en `r.campos` bajo cada input |
| `NO_AUTENTICADO` | Sin sesión o sesión expirada | Redirigir a `/ingresar` |
| `SIN_PERMISO` | Rol insuficiente o intento de acceso a recurso ajeno | Mensaje y vuelta al inicio del panel |
| `NO_ENCONTRADO` | El recurso solicitado no existe | Mostrar vista 404 o estado vacío |
| `ENLACE_INVALIDO` | Token no existe, fue alterado o ya fue consumido | Mensaje de enlace no válido con enlace a soporte |
| `ENLACE_VENCIDO` | Token superó su ventana temporal de validez | Ofrecer solicitar un nuevo enlace |
| `CUPO_OCUPADO` | El horario seleccionado acaba de ser tomado por otra persona | Devolver al selector de horario conservando los demás datos |
| `FUERA_DE_RANGO` | Horario fuera de la anticipación permitida o no disponible | Devolver al selector de horario |
| `LIMITE_CITAS` | La persona ya alcanzó el máximo de citas activas | Explicar que debe gestionar o cancelar su cita previa |
| `SERVICIO_NO_DISPONIBLE`| Servicio inactivo o no configurable en línea | Ofrecer canales de atención presencial/telefónica |
| `TRANSICION_INVALIDA` | La acción no está permitida en el estado actual de la cita | Recargar datos actualizados de la cita |
| `FUERA_DE_PLAZO` | Se superó el límite de horas mínimas para cancelar o reprogramar | Indicar que debe comunicarse directamente con el centro |
| `LIMITE_REPROGRAMACIONES`| Se alcanzó el número máximo de reprogramaciones permitidas | Indicar que debe comunicarse directamente con el centro |
| `CUPO_LLENO` | Cupo agotado (eventos anteriores) | Notificar al usuario |
| `YA_INSCRITO` | Registro duplicado (eventos anteriores) | Notificar al usuario |
| `EVENTO_CERRADO` | Evento finalizado o despublicado | Notificar al usuario |
| `CORREO_NO_PERMITIDO` | Dominio de correo fuera de `dominiosPermitidos` | Marcar campo de correo institucional |
| `CORREO_EN_USO` | El correo ya pertenece a otra cuenta activa | Marcar campo de correo |
| `TIENE_CITAS_FUTURAS` | Intento de desactivar profesional con citas pendientes | Bloquear acción y listar citas comprometidas |
| `CREDENCIALES` | Correo o contraseña incorrectos | Mensaje genérico de autenticación |
| `CODIGO_REQUERIDO` | Administrador en dispositivo no recordado (Paso 2) | Mostrar campo para código de 6 dígitos enviado por correo |
| `CODIGO_INVALIDO` | Código 2FA incorrecto, vencido o ya utilizado | Permitir reintentar o solicitar reenvío |
| `CONFIRMACION_REQUERIDA`| Acción sensible sin verificación reciente de contraseña (10 min) | Abrir modal para reingresar contraseña |
| `DEMASIADOS_INTENTOS` | Límite de tasa (rate-limit) superado | Mostrar tiempo de espera indicado en el mensaje |
| `ARCHIVO_INVALIDO` | Archivo no soportado (solo JPG, PNG, WebP) o mayor a 6 MB | Marcar campo de subida de archivo |
| `ERROR_INTERNO` | Fallo inesperado en el servidor | "Algo falló de nuestro lado" y botón de reintentar |

---

## 2. Ejemplo Práctico de Uso en Pantalla (Next.js 16)

Ejemplo de un componente cliente (`"use client"`) consumiendo una Server Action que devuelve `Resultado<T>`:

```tsx
"use client";

import { useState, useTransition } from "react";
import type { Resultado } from "../../contratos/resultado";
import { ingresarAccion } from "../../servidor/cuentas/acciones";

export function FormularioIngreso() {
  const [pendiente, startTransition] = useTransition();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [pedirSegundoPaso, setPedirSegundoPaso] = useState(false);

  function manejarEnvio(formData: FormData) {
    setErrorGlobal(null);
    setErroresCampos({});

    startTransition(async () => {
      const res: Resultado<never> = await ingresarAccion(null, formData);

      if (!res.ok) {
        if (res.codigo === "CODIGO_REQUERIDO") {
          // Administrador en dispositivo nuevo: la acción ya guardó la cookie temporal capl_paso
          setPedirSegundoPaso(true);
          return;
        }

        setErrorGlobal(res.mensaje);
        if (res.campos) {
          setErroresCampos(res.campos);
        }
      }
      // Si res.ok es true, ingresarAccion redirige internamente al panel correspondiente
    });
  }

  return (
    <form action={manejarEnvio}>
      {errorGlobal && <div role="alert" className="aviso-error">{errorGlobal}</div>}

      <div>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" name="correo" type="email" required />
        {erroresCampos.correo && <span className="error-campo">{erroresCampos.correo}</span>}
      </div>

      <div>
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" name="clave" type="password" required />
        {erroresCampos.clave && <span className="error-campo">{erroresCampos.clave}</span>}
      </div>

      <button type="submit" disabled={pendiente}>
        {pendiente ? "Ingresando..." : "Iniciar sesión"}
      </button>

      {pedirSegundoPaso && (
        <p>Se envió un código de 6 dígitos a tu correo. Por favor ingrésalo para continuar.</p>
      )}
    </form>
  );
}
```

---

## 3. Módulo Cuentas y Sesión (`servidor/cuentas`)

Gestiona autenticación, cambio y recuperación de contraseñas, doble factor (2FA) para administradores y guardas de sesión.

### Operaciones principales

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `crearClave` | `servidor/cuentas/claves.ts` | Público con token | `crearClaveSchema` (`cuenta.ts`) | `Resultado<SesionIniciada>` | `VALIDACION`, `ENLACE_INVALIDO`, `ENLACE_VENCIDO` |
| `solicitarEnlace` | `servidor/cuentas/claves.ts` | Público | `solicitarEnlaceSchema` (`cuenta.ts`) | `Resultado<{ ok: true }>` *(siempre ok salvo rate limit o sintaxis)* | `VALIDACION`, `DEMASIADOS_INTENTOS` |
| `cambiarClave` | `servidor/cuentas/claves.ts` | `ADMIN` o `PSICOLOGO` | `cambiarClaveSchema` (`cuenta.ts`) | `Resultado<{ ok: true }>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `DEMASIADOS_INTENTOS`, `CREDENCIALES` |
| `validarEnlace` | `servidor/cuentas/enlaces.ts` | Público | `token: unknown` (string de 1 a 200 caracteres) | `Resultado<EnlaceValido>` | `ENLACE_INVALIDO`, `ENLACE_VENCIDO` |
| `verificarCodigo` | `servidor/cuentas/segundoPaso.ts` | Admin en paso 2 | `paso` (cookie `capl_paso`), `codigoSchema` (`cuenta.ts`) | `Resultado<SesionConDispositivo>` | `NO_AUTENTICADO`, `CODIGO_INVALIDO`, `DEMASIADOS_INTENTOS` |
| `reenviarCodigo` | `servidor/cuentas/segundoPaso.ts` | Admin en paso 2 | `paso` (cookie `capl_paso`) | `Resultado<{ ok: true }>` | `NO_AUTENTICADO`, `DEMASIADOS_INTENTOS`, `SERVICIO_NO_DISPONIBLE` |
| `confirmarClave` | `servidor/cuentas/confirmacion.ts` | `ADMIN` o `PSICOLOGO` | `confirmarClaveSchema` (`cuenta.ts`) | `Resultado<{ token: string; maxAgeS: number }>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `CREDENCIALES`, `DEMASIADOS_INTENTOS` |
| `obtenerSesion` | `servidor/cuentas/sesionActual.ts` | Cualquiera (interno) | Ninguno (lee cookie `capl_sesion`) | `Promise<Sesion \| null>` | No usa `Resultado`; retorna `null` si no hay sesión o si el usuario fue desactivado en BD |
| `paginaProtegida` | `servidor/cuentas/sesionActual.ts` | Server Components | `roles: Rol \| Rol[]` | `Promise<Sesion>` | Redirige con `redirect()` a `/ingresar` (`NO_AUTENTICADO`) o `/panel?error=sin-permiso` (`SIN_PERMISO`) |
| `sesionDeOperacion` | `servidor/cuentas/sesionActual.ts` | Server Actions / Route Handlers | `roles: Rol \| Rol[]` | `Promise<Resultado<Sesion>>` | `NO_AUTENTICADO`, `SIN_PERMISO` |
| `exigirClaveReciente` | `servidor/cuentas/sesionActual.ts` | Acciones sensibles | `sesion: Sesion` (lee cookie `capl_confirmacion`) | `Promise<Resultado<Sesion>>` | `CONFIRMACION_REQUERIDA` |

### Acciones de servidor (`servidor/cuentas/acciones.ts`)
Conectadas directamente a formularios HTML / React:

| Función | Archivo | Quién (Rol) | Qué recibe | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `ingresarAccion` | `servidor/cuentas/acciones.ts` | Público | `FormData` (`correo`, `clave`) | `Promise<Resultado<never>>` *(redirige o devuelve error)* | `CREDENCIALES`, `DEMASIADOS_INTENTOS`, `CODIGO_REQUERIDO` |
| `verificarCodigoAccion` | `servidor/cuentas/acciones.ts` | Admin en paso 2 | `FormData` (`codigo`, `recordar?`) | `Promise<Resultado<never>>` *(redirige al panel)* | `NO_AUTENTICADO`, `CODIGO_INVALIDO`, `DEMASIADOS_INTENTOS` |
| `reenviarCodigoAccion` | `servidor/cuentas/acciones.ts` | Admin en paso 2 | Ninguno (lee cookie `capl_paso`) | `Promise<Resultado<{ ok: true }>>` | `NO_AUTENTICADO`, `DEMASIADOS_INTENTOS`, `SERVICIO_NO_DISPONIBLE` |
| `crearClaveAccion` | `servidor/cuentas/acciones.ts` | Público con token | `FormData` (`token`, `clave`, `confirmacion`) | `Promise<Resultado<never>>` *(redirige al panel)* | `VALIDACION`, `ENLACE_INVALIDO`, `ENLACE_VENCIDO` |
| `solicitarEnlaceAccion` | `servidor/cuentas/acciones.ts` | Público | `FormData` (`correo`) | `Promise<Resultado<{ ok: true }>>` | `VALIDACION`, `DEMASIADOS_INTENTOS` |
| `cambiarClaveAccion` | `servidor/cuentas/acciones.ts` | `ADMIN` o `PSICOLOGO` | `FormData` (`claveActual`, `claveNueva`) | `Promise<Resultado<{ ok: true }>>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `DEMASIADOS_INTENTOS`, `CREDENCIALES` |
| `confirmarClaveAccion` | `servidor/cuentas/acciones.ts` | `ADMIN` o `PSICOLOGO` | `FormData` (`clave`) | `Promise<Resultado<{ ok: true }>>` *(deja cookie válida 10 min)* | `NO_AUTENTICADO`, `SIN_PERMISO`, `CREDENCIALES`, `DEMASIADOS_INTENTOS` |
| `cerrarSesionAccion` | `servidor/cuentas/acciones.ts` | `ADMIN` o `PSICOLOGO` | Ninguno | `Promise<void>` *(borra cookies y redirige a `/ingresar`)* | Ninguno (siempre redirige) |

---

## 4. Módulo Psicólogos (`servidor/psicologos`)

Operaciones dedicadas a la autogestión del perfil, foto, disponibilidad horaria y ausencias del psicólogo autenticado.

> [!NOTE] Estado de implementación real del código
> En este momento, `servidor/psicologos/` implementa **únicamente las operaciones del propio psicólogo** en `servidor/psicologos/perfil.ts` (RF-PSI-01, 02, 03, 07).
> Las operaciones de administración general de profesionales descritas en [[E05-Operaciones-y-Contratos]] (`listarPsicologos`, `crearPsicologo`, `actualizarPsicologo`, `cambiarActivo`, `reenviarInvitacion`, `crearAdministrador` de T-205) y el directorio público `listarEquipoPublico` (T-213) tienen sus esquemas definidos en `contratos/psicologo.ts`, pero sus funciones en servidor aún no están creadas en esta carpeta.

### Operaciones del psicólogo (`servidor/psicologos/perfil.ts`)

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `obtenerMiPerfil` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion: Sesion \| null \| undefined` | `Resultado<PerfilPropio>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `NO_ENCONTRADO` |
| `actualizarPerfil` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion`, `perfilSchema` (`psicologo.ts`) | `Resultado<PerfilPropio>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO` |
| `subirFoto` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion`, `archivo: Uint8Array` *(JPG/PNG/WebP máx 6 MB)* | `Resultado<{ fotoUrl: string }>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `ARCHIVO_INVALIDO` |
| `guardarHorario` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion`, `horarioSchema` (`horario.ts`) | `Resultado<HorarioGuardado>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `crearBloqueo` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion`, `bloqueoSchema` (`bloqueo.ts`) *(ignora psicologoId y usa sesión)* | `Resultado<BloqueoGuardado>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `eliminarBloqueo` | `servidor/psicologos/perfil.ts` | `PSICOLOGO` | `sesion`, `id: unknown` (`z.string().min(1)`) *(solo propios)* | `Resultado<{ ok: true }>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO` |

---

## 5. Módulo Centro (`servidor/centro`)

Administración de reglas globales del centro: bloqueos generales (ausencias de todo el centro), cálculo de festivos colombianos, configuración dinámica del sistema y catálogo de servicios.

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `listarBloqueosCentro` | `servidor/centro/bloqueos.ts` | `ADMIN` | `sesion: Sesion \| null \| undefined` | `Resultado<BloqueoGuardado[]>` | `NO_AUTENTICADO`, `SIN_PERMISO` |
| `crearBloqueoCentro` | `servidor/centro/bloqueos.ts` | `ADMIN` | `sesion`, `bloqueoSchema` (`bloqueo.ts`) *(fija psicologoId = null)* | `Resultado<BloqueoGuardado>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `eliminarBloqueoCentro` | `servidor/centro/bloqueos.ts` | `ADMIN` | `sesion`, `id: unknown` (`z.string().min(1)`) *(solo del centro)* | `Resultado<{ ok: true }>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO` |
| `listarFestivos` | `servidor/centro/bloqueos.ts` | `ADMIN` | `sesion`, `anio: unknown` (`z.number().int().min(2000).max(2100)`) | `Resultado<Festivo[]>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `festivosColombia` | `servidor/centro/festivos.ts` | Uso general | `anio: number` | `Festivo[]` *(cálculo puro de Ley Emiliani)* | No falla (función pura) |
| `obtenerConfiguracion` | `servidor/centro/configuracion.ts` | `ADMIN` | `sesion: Sesion \| null \| undefined` | `Resultado<Configuracion>` | `NO_AUTENTICADO`, `SIN_PERMISO` |
| `actualizarConfiguracion` | `servidor/centro/configuracion.ts` | `ADMIN` | `sesion`, `cambioConfiguracionSchema` (`configuracion.ts`) | `Resultado<Configuracion>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `listarServicios` | `servidor/centro/servicios.ts` | `ADMIN` | `sesion: Sesion \| null \| undefined` | `Resultado<ServicioGuardado[]>` | `NO_AUTENTICADO`, `SIN_PERMISO` |
| `guardarServicio` | `servidor/centro/servicios.ts` | `ADMIN` | `sesion`, `servicioSchema` (`servicio.ts`) *(id vacío = crear)* | `Resultado<ServicioGuardado>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO` |

---

## 6. Módulo Eventos (`servidor/eventos`)

Cartelera informativa de eventos y talleres institucionales.

> [!NOTE] Sin inscripciones ni cupos
> En el código actual (RF-EVE-01, 06; tareas T-403, T-405, T-407 descartadas), los eventos funcionan como cartelera informativa externa. No se gestionan inscritos ni reservas de cupos dentro de la aplicación.

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `crearEvento` | `servidor/eventos/eventos.ts` | `ADMIN` | `sesion`, `eventoSchema` (`evento.ts`) | `Resultado<EventoDetalle>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `editarEvento` | `servidor/eventos/eventos.ts` | `ADMIN` | `sesion`, `id: unknown` (`z.string().min(1)`), `eventoSchema` | `Resultado<EventoDetalle>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO` |
| `subirImagenEvento` | `servidor/eventos/eventos.ts` | `ADMIN` | `sesion`, `id: unknown`, `archivo: Uint8Array` *(1200x630 WebP máx 6 MB)* | `Resultado<EventoDetalle>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO`, `ARCHIVO_INVALIDO` |
| `listarEventos` | `servidor/eventos/eventos.ts` | `ADMIN` | `sesion: Sesion \| null \| undefined` | `Resultado<EventoDetalle[]>` | `NO_AUTENTICADO`, `SIN_PERMISO` |
| `listarEventosPublicos` | `servidor/eventos/eventos.ts` | Público | `ahora?: Date` *(por defecto `new Date()`)* | `Resultado<EventoDetalle[]>` | Siempre `ok` (vacío si no hay vigentes) |
| `verEventoPublico` | `servidor/eventos/eventos.ts` | Público | `slug: unknown` (`z.string().min(1).max(120)`), `ahora?: Date` | `Resultado<EventoDetalle>` | `NO_ENCONTRADO` |

---

## 7. Módulo Citas (`servidor/citas`)

El núcleo operativo del CAPL: agendamiento público, gestión mediante enlace firmado con HMAC, administración de bandeja y consulta de disponibilidad de cupos.

### Creación pública y gestión por enlace

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `crearCita` | `servidor/citas/crear.ts` | Público | `citaSchema` (`cita.ts`), `{ ip: string; ahora?: Date }` | `Resultado<CitaCreada>` | `VALIDACION`, `DEMASIADOS_INTENTOS`, `SERVICIO_NO_DISPONIBLE`, `CUPO_OCUPADO`, `FUERA_DE_RANGO`, `LIMITE_CITAS` |
| `verCita` | `servidor/citas/gestion.ts` | Público con token | `token: string`, `{ ahora?: Date }` | `Resultado<CitaPublica>` *(sin documento, teléfono ni motivo)* | `ENLACE_INVALIDO` |
| `cancelarCita` | `servidor/citas/gestion.ts` | Público con token | `token: string`, `{ ahora?: Date }` | `Resultado<{ estado: EstadoCita }>` | `ENLACE_INVALIDO`, `FUERA_DE_PLAZO`, `TRANSICION_INVALIDA` |
| `reprogramarCita` | `servidor/citas/gestion.ts` | Público con token | `reprogramarSchema` (`cita.ts`), `{ ahora?: Date }` | `Resultado<CitaCreada>` | `VALIDACION`, `ENLACE_INVALIDO`, `FUERA_DE_PLAZO`, `LIMITE_REPROGRAMACIONES`, `TRANSICION_INVALIDA`, `SERVICIO_NO_DISPONIBLE`, `CUPO_OCUPADO`, `FUERA_DE_RANGO` |

### Consulta de cupos y profesionales por servicio

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `obtenerCupos` | `servidor/citas/cupos.ts` | Público *(usada en `GET /api/cupos`)* | `consultaCupoSchema` (`cupo.ts`), `{ ip: string; ahora?: Date }` | `Resultado<Cupo[]>` | `DEMASIADOS_INTENTOS`, `VALIDACION`, `SERVICIO_NO_DISPONIBLE` |
| `listarPsicologosDeServicio` | `servidor/citas/cupos.ts` | Público | `servicioId: string` | `Resultado<PsicologoDeServicio[]>` | Siempre `ok` *(solo activos y con horario)* |

### Bandeja y acciones de administración (`servidor/citas/admin.ts`)

| Función | Archivo | Quién (Rol) | Qué recibe (Zod en `contratos/`) | Qué devuelve | Códigos de error posibles |
|---|---|---|---|---|---|
| `listarCitas` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `filtrosCitaSchema` (`filtros-cita.ts`) | `Resultado<PaginaCitas>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |
| `verCitaAdmin` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `id: string` | `Resultado<CitaDetalle>` *(motivo descifrado e historial)* | `NO_AUTENTICADO`, `SIN_PERMISO`, `NO_ENCONTRADO` |
| `autorizarCita` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `id: string`, `ahora?: Date` | `Resultado<CitaLista>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `NO_ENCONTRADO`, `TRANSICION_INVALIDA` |
| `rechazarCita` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `motivoAdminSchema` (`cita.ts`), `ahora?: Date` | `Resultado<CitaLista>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO`, `TRANSICION_INVALIDA` |
| `cancelarCitaAdmin` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `motivoAdminSchema` (`cita.ts`), `ahora?: Date` | `Resultado<CitaLista>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO`, `TRANSICION_INVALIDA` |
| `marcarAsistencia` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `asistenciaSchema` (`cita.ts`), `ahora?: Date` | `Resultado<CitaLista>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `NO_ENCONTRADO`, `TRANSICION_INVALIDA` |
| `reasignarCita` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `reasignarSchema` (`cita.ts`), `ahora?: Date` | `Resultado<CitaLista>` | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION`, `FUERA_DE_RANGO`, `NO_ENCONTRADO`, `TRANSICION_INVALIDA`, `CUPO_OCUPADO` |
| `exportarCitas` | `servidor/citas/admin.ts` | `ADMIN` | `sesion`, `filtrosCitaSchema` (`filtros-cita.ts`) | `Resultado<string>` *(CSV UTF-8 BOM, sep `;`)* | `NO_AUTENTICADO`, `SIN_PERMISO`, `VALIDACION` |

> [!NOTE] Nota sobre `listarMisCitas`
> La función `consultarCitas(f: FiltrosCita, psicologoId?: string)` exportada en `servidor/citas/admin.ts` contiene la lógica paginada reutilizable para la vista del psicólogo (`psicologoId` forzado al de la sesión). Al momento de esta guía, la envoltura directa `listarMisCitas` no se encuentra exportada en `servidor/psicologos/`; se recomienda consultar a través de `consultarCitas` pasando la sesión validada.

---

## 8. Módulo Correo y Trabajos del Panel (`servidor/correo/panel.ts`)

Funciones de soporte para el panel de administración (T-335) relativas a la entrega de correos de citas y la visualización/reintento de trabajos fallidos en cola.

> [!IMPORTANT] Control de acceso en este módulo
> A diferencia de los módulos anteriores, las funciones de `servidor/correo/panel.ts` no ejecutan `exigir(sesion, "ADMIN")` internamente ni devuelven el tipo envoltorio `Resultado<T>`. El comentario del archivo exige que **quien las invoque (Server Component o Server Action) debe comprobar previamente el rol** con `exigir(sesion, "ADMIN")`.

| Función | Archivo | Quién (Rol) | Qué recibe | Qué devuelve | Comportamiento y Errores |
|---|---|---|---|---|---|
| `correosDeCita` | `servidor/correo/panel.ts` | `ADMIN` *(verificado por quien llama)* | `citaId: string` | `Promise<{ correos: FilaCorreo[]; hayRebote: boolean }>` | Si `hayRebote === true`, la pantalla debe mostrar `AVISO_NO_ENTREGADO` para advertir que el correo rebotó |
| `trabajosFallidos` | `servidor/correo/panel.ts` | `ADMIN` *(verificado por quien llama)* | Ninguno | `Promise<{ cantidad: number; trabajos: FilaTrabajo[] }>` | Lista hasta 100 trabajos en estado `FALLIDO` para el aviso de alerta en el inicio del panel |
| `reintentarTrabajo` | `servidor/correo/panel.ts` | `ADMIN` *(verificado por quien llama)* | `trabajoId: string`, `usuarioId: string` | `Promise<{ ok: boolean }>` | Devuelve el trabajo a estado `PENDIENTE` y resetea reintentos en transacción; retorna `{ ok: false }` si no existía en fallo |

---

## 9. Resumen de Contratos y Esquemas Zod (`contratos/`)

Referencia rápida de esquemas Zod en `contratos/` listos para usar en validación de formularios y tipado de vistas:

| Archivo | Esquemas exportados | Tipos inferidos exportados | Uso principal |
|---|---|---|---|
| `contratos/resultado.ts` | — | `Resultado<T>`, `CodigoError`, `CODIGOS_ERROR` | Firma estándar de respuesta del servidor |
| `contratos/cuenta.ts` | `ingresoSchema`, `crearClaveSchema`, `solicitarEnlaceSchema`, `cambiarClaveSchema`, `codigoSchema`, `confirmarClaveSchema` | `Ingreso`, `CrearClave` | Formularios de `/ingresar`, `/crear-clave`, 2FA y seguridad de cuenta |
| `contratos/psicologo.ts` | `areaSchema`, `crearPsicologoSchema`, `crearAdministradorSchema`, `actualizarPsicologoSchema`, `cambiarActivoSchema`, `perfilSchema`, `perfilPropioSchema` | `Area`, `CrearPsicologo`, `PerfilEntrada`, `PerfilPropio`, `UsuarioResumen`, `PsicologoDetalle`, `HorarioGuardado` | Perfil del psicólogo, horarios, fotos y gestión de equipo |
| `contratos/horario.ts` | `bloqueHorarioSchema`, `horarioSchema` | `Horario` | Configuración de disponibilidad semanal |
| `contratos/bloqueo.ts` | `bloqueoSchema`, `bloqueoGuardadoSchema`, `festivoSchema` | `Bloqueo`, `BloqueoGuardado`, `Festivo` | Ausencias puntuales y bloqueos globales del centro |
| `contratos/cita.ts` | `citaSchema`, `citaCreadaSchema`, `citaPublicaSchema`, `motivoAdminSchema`, `reasignarSchema`, `asistenciaSchema`, `reprogramarSchema` | `EstadoCita`, `CitaEntrada`, `CitaCreada`, `CitaPublica`, `CitaLista`, `CitaDetalle`, `PaginaCitas` | Flujo completo de solicitud, gestión y administración de citas |
| `contratos/cupo.ts` | `consultaCupoSchema`, `cupoSchema`, `psicologoDeServicioSchema` | `ConsultaCupo`, `Cupo`, `PsicologoDeServicio` | Búsqueda de cupos libres y psicólogos por servicio |
| `contratos/evento.ts` | `eventoSchema` | `EventoEntrada`, `EventoDetalle` | Cartelera informativa de eventos y talleres |
| `contratos/servicio.ts` | `servicioSchema` | `ServicioEntrada`, `ServicioGuardado` | Catálogo de servicios de atención |
| `contratos/configuracion.ts`| `configuracionSchema`, `cambioConfiguracionSchema` | `Configuracion`, `CambioConfiguracion` | Parámetros globales y reglas de negocio del centro |
| `contratos/filtros-cita.ts` | `filtrosCitaSchema` | `FiltrosCita` | Filtros de búsqueda y paginación en bandejas de citas |
| `contratos/simulados.ts` | `obtenerCupos`, `crearCita` | — | Mockups y pruebas provisionales de maquetación |
