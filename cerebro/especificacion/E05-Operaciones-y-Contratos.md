---
tags: [capl, especificacion, contratos]
---

# E05 · Operaciones y contratos

Volver a [[E00-Especificacion-Inicio]]. Es el **acuerdo entre los tres roles**: A y C programan contra esto con datos simulados mientras B lo implementa.

## Cómo se exponen

- Cada operación es una función en `servidor/`, llamada desde la pantalla como **acción de servidor**.
- Solo cuatro son rutas HTTP, porque las llama algo que no es una pantalla: `GET /api/cupos`, `POST /api/tareas`, `GET /api/salud`, `GET /api/admin/exportar`.
- La entrada de toda operación se valida con su esquema de `contratos/`.

## Forma de la respuesta

Toda operación devuelve uno de dos:

```ts
{ ok: true,  datos: T }
{ ok: false, codigo: CodigoError, mensaje: string, campos?: Record<string, string> }
```

`mensaje` ya viene redactado para mostrarse ([[N08-Lenguaje-y-Tono]]). `campos` trae el error de cada campo cuando `codigo` es `VALIDACION`.

## Códigos de error

| Código | Cuándo | Qué hace la pantalla |
|--------|--------|----------------------|
| `VALIDACION` | Datos que no cumplen el esquema | Marca los campos |
| `NO_AUTENTICADO` | Sin sesión | Lleva a `/ingresar` |
| `SIN_PERMISO` | Rol insuficiente o recurso ajeno | Mensaje y vuelta al inicio del panel |
| `NO_ENCONTRADO` | El recurso no existe | Página no encontrada |
| `ENLACE_INVALIDO` | Firma o token incorrecto | Mensaje + contactos |
| `ENLACE_VENCIDO` | Token vencido o ya usado | Ofrece pedir otro |
| `CUPO_OCUPADO` | Otra persona tomó el horario | Vuelve a elegir horario |
| `FUERA_DE_RANGO` | Horario fuera de la anticipación o no es un cupo válido | Vuelve a elegir horario |
| `LIMITE_CITAS` | Ya tiene el máximo de citas activas | Mensaje + cómo gestionar la existente |
| `SERVICIO_NO_DISPONIBLE` | Servicio inactivo o no agendable | Lleva a contacto |
| `TRANSICION_INVALIDA` | La cita no admite esa acción en su estado | Recarga el detalle |
| `FUERA_DE_PLAZO` | Pasó el límite para cancelar o reprogramar | Mensaje + contactos |
| `LIMITE_REPROGRAMACIONES` | Ya reprogramó el máximo | Mensaje + contactos |
| `CUPO_LLENO` · `YA_INSCRITO` · `EVENTO_CERRADO` | Eventos | Mensaje en la tarjeta |
| `CORREO_NO_PERMITIDO` | Dominio fuera de la lista | Marca el campo |
| `CORREO_EN_USO` | Ya existe ese usuario | Marca el campo |
| `TIENE_CITAS_FUTURAS` | Desactivar psicólogo con citas activas | Lista las citas |
| `CREDENCIALES` | Ingreso fallido | Mensaje genérico |
| `CODIGO_REQUERIDO` | Administrador en dispositivo nuevo | Pide el código enviado al correo |
| `CODIGO_INVALIDO` | Código errado, vencido o agotado | Permite reintentar o reenviar |
| `CONFIRMACION_REQUERIDA` | Acción sensible sin confirmación reciente | Pide la contraseña y repite la acción |
| `DEMASIADOS_INTENTOS` | Límite de intentos | Mensaje con el tiempo de espera |
| `ARCHIVO_INVALIDO` | Formato o tamaño de imagen | Marca el campo |
| `ERROR_INTERNO` | Cualquier fallo no previsto | "Algo falló de nuestro lado" + reintentar |

## Esquemas principales (`contratos/`)

### `cita.ts` — solicitud de cita

| Campo | Tipo | Regla |
|-------|------|-------|
| `servicioId` | texto | Obligatorio |
| `psicologoId` | texto o vacío | Vacío = cualquiera disponible |
| `inicio` | fecha y hora ISO | Obligatorio |
| `paraQuien` | `PROPIA` · `OTRA_PERSONA` · `MENOR` | Obligatorio |
| `solicitanteNombre` | texto | 3–80 caracteres |
| `solicitanteCorreo` | correo | Se normaliza a minúsculas |
| `solicitanteTelefono` | texto | 7–15 dígitos; admite `+` y espacios |
| `pacienteNombre` | texto | Obligatorio si no es `PROPIA` |
| `pacienteDocumento` | texto | 5–15 caracteres alfanuméricos |
| `pacienteEdad` | entero | 0–120. Si es menor de 18, `paraQuien` debe ser `MENOR` |
| `acudienteNombre`, `acudienteDocumento` | texto | Obligatorios si `MENOR` |
| `motivo` | texto | Opcional, máx. 300 |
| `aceptaTratamiento` | verdadero | Debe ser verdadero |
| `sitioWeb` | texto | Campo trampa: debe llegar vacío |

Los campos obligatorios definitivos dependen de la pregunta 8 del [[11-Cuestionario-CAPL]]; cambiar uno es editar este esquema.

### Otros esquemas

| Archivo | Campos |
|---------|--------|
| `cupo.ts` | Consulta: `servicioId`, `psicologoId?`, `desde`, `hasta` (máx. 14 días). Respuesta: `{ inicio, fin, psicologoIds[] }[]` |
| `psicologo.ts` | Crear: `nombre`, `correo`, `area`. Perfil: `presentacion` (máx. 600), `servicioIds[]`, `visible` |
| `horario.ts` | `bloques: { diaSemana 1–7, inicioMin, finMin }[]`; sin cruces dentro del mismo día; reemplaza el horario completo |
| `bloqueo.ts` | `desde`, `hasta`, `motivo?`, `psicologoId?` |
| `evento.ts` | `titulo`, `descripcion`, `inicio`, `fin?`, `lugar`, `enlace?`, `cupo?`, `soloComunidad`, `publicado` |
| `inscripcion.ts` | `nombre`, `correo`, `telefono?`, `aceptaTratamiento`, campo trampa |
| `cuenta.ts` | Ingreso: `correo`, `clave`. Crear clave: `token`, `clave`, `confirmacion` |
| `configuracion.ts` | Los valores de [[E03-Reglas-de-Negocio]] §1, cada uno con mínimo y máximo |
| `filtros-cita.ts` | `estado?`, `desde?`, `hasta?`, `psicologoId?`, `servicioId?`, `busqueda?`, `pagina` |

## Operaciones

**Quién:** `Público` sin sesión · `Psi` psicólogo · `Admin` · `Sistema`.

### Públicas

| Operación | Entrada | Devuelve | Errores propios |
|-----------|---------|----------|-----------------|
| `obtenerCupos` *(GET /api/cupos)* | `cupo` | Lista de cupos | `SERVICIO_NO_DISPONIBLE`, `DEMASIADOS_INTENTOS` |
| `listarPsicologosDeServicio` | `servicioId` | `{ id, nombre, fotoUrl, presentacion }[]` (solo activos, con horario) | — |
| `crearCita` | `cita` | `{ codigo, estado, inicio, enlaceGestion }` | `CUPO_OCUPADO`, `FUERA_DE_RANGO`, `LIMITE_CITAS`, `SERVICIO_NO_DISPONIBLE`, `DEMASIADOS_INTENTOS` |
| `verCita` | `token` | `{ codigo, estado, servicio, psicologoNombre, inicio, fin, lugar, puedeCancelar, puedeReprogramar }` | `ENLACE_INVALIDO` |
| `cancelarCita` | `token` | `{ estado }` | `ENLACE_INVALIDO`, `FUERA_DE_PLAZO`, `TRANSICION_INVALIDA` |
| `reprogramarCita` | `token`, `inicio`, `psicologoId?` | `{ codigo, estado, inicio, enlaceGestion }` | Los de cancelar + `CUPO_OCUPADO`, `FUERA_DE_RANGO`, `LIMITE_REPROGRAMACIONES` |
| `listarEquipoPublico` | — | Perfiles visibles | — |
| `listarEventosPublicos` | — | Eventos visibles con cupos restantes | — |
| `verEventoPublico` | `slug` | Evento | `NO_ENCONTRADO` |
| `inscribirseEvento` | `eventoId`, `inscripcion` | `{ ok }` | `CUPO_LLENO`, `YA_INSCRITO`, `EVENTO_CERRADO`, `CORREO_NO_PERMITIDO` |

`verCita` nunca devuelve documento, teléfono ni motivo: solo lo necesario para reconocer la cita.

### Cuenta

| Operación | Quién | Entrada | Devuelve | Errores propios |
|-----------|-------|---------|----------|-----------------|
| `ingresar` | Público | `correo`, `clave` | Sesión | `CREDENCIALES`, `DEMASIADOS_INTENTOS` |
| `cerrarSesion` | Psi, Admin | — | — | — |
| `validarEnlace` | Público | `token` | `{ nombre, tipo }` | `ENLACE_INVALIDO`, `ENLACE_VENCIDO` |
| `crearClave` | Público | `token`, `clave`, `confirmacion` | Sesión iniciada | `ENLACE_INVALIDO`, `ENLACE_VENCIDO` |
| `solicitarEnlace` | Público | `correo` | Siempre `{ ok }` | `DEMASIADOS_INTENTOS` |
| `cambiarClave` | Psi, Admin | `claveActual`, `claveNueva` | `{ ok }` | `CREDENCIALES` |
| `verificarCodigo` | Admin a medio ingresar | `codigo`, `recordarDispositivo` | Sesión | `CODIGO_INVALIDO`, `DEMASIADOS_INTENTOS` |
| `reenviarCodigo` | Admin a medio ingresar | — | `{ ok }` | `DEMASIADOS_INTENTOS` |
| `confirmarClave` | Admin | `clave` | `{ ok }` (válido 10 min) | `CREDENCIALES` |
| `cerrarMisSesiones` | Psi, Admin | — | `{ ok }`; olvida también los dispositivos de confianza | — |

`ingresar` de un administrador en un dispositivo nuevo responde `CODIGO_REQUERIDO` en lugar de abrir sesión. Reglas en [[S02-Acceso-y-Permisos]].

### Psicólogo

| Operación | Entrada | Devuelve | Nota |
|-----------|---------|----------|------|
| `obtenerMiPerfil` | — | Perfil + horario + bloqueos | — |
| `actualizarPerfil` | `psicologo` (perfil) | Perfil | — |
| `subirFoto` | archivo | `{ fotoUrl }` | `ARCHIVO_INVALIDO` |
| `guardarHorario` | `horario` | Horario | No afecta citas ya existentes; el panel avisa si alguna queda fuera del nuevo horario |
| `crearBloqueo` / `eliminarBloqueo` | `bloqueo` / `id` | Bloqueo | Solo los propios |
| `listarMisCitas` | `filtros-cita` | Página de citas con contacto del paciente | **Solo** citas donde `psicologoId` es el suyo |

### Administración

| Operación | Entrada | Devuelve | Errores propios |
|-----------|---------|----------|-----------------|
| `listarCitas` | `filtros-cita` | Página (25 por página) + total | — |
| `verCitaAdmin` | `id` | Cita completa + historial | `NO_ENCONTRADO` |
| `autorizarCita` | `id` | Cita | `TRANSICION_INVALIDA` |
| `rechazarCita` | `id`, `motivo` | Cita | `TRANSICION_INVALIDA` |
| `cancelarCitaAdmin` | `id`, `motivo` | Cita | `TRANSICION_INVALIDA` |
| `reasignarCita` | `id`, `psicologoId`, `inicio` | Cita | `CUPO_OCUPADO` |
| `marcarAsistencia` | `id`, `ATENDIDA` o `NO_ASISTIO` | Cita | `TRANSICION_INVALIDA` |
| `exportarCitas` *(GET /api/admin/exportar?tipo=citas)* | `filtros-cita` | Archivo CSV | — |
| `listarPsicologos` | — | Lista con estado | — |
| `crearPsicologo` | `psicologo` (crear) | Psicólogo | `CORREO_NO_PERMITIDO`, `CORREO_EN_USO` |
| `actualizarPsicologo` | `id`, `nombre`, `area` | Psicólogo | — |
| `cambiarActivo` | `id`, `activo` | Psicólogo | `TIENE_CITAS_FUTURAS` |
| `reenviarInvitacion` | `id` | `{ ok }` | — |
| `crearAdministrador` | `nombre`, `correo` | Usuario | `CORREO_EN_USO` |
| `listarEventos` / `guardarEvento` / `publicarEvento` / `eliminarEvento` | `evento` | Evento | — |
| `listarInscritos` / `exportarInscritos` | `eventoId` | Lista / CSV | — |
| `listarBloqueos` / `crearBloqueo` / `eliminarBloqueo` | `bloqueo` | Bloqueo | — |
| `guardarServicio` | servicio | Servicio | — |
| `obtenerConfiguracion` / `actualizarConfiguracion` | `configuracion` | Configuración | — |

### Sistema

| Operación | Ruta | Protección | Devuelve |
|-----------|------|------------|----------|
| `ejecutarTareas` | `POST /api/tareas` | Cabecera con `CRON_SECRET` | Resumen: cuántos correos, vencidas, recordatorios |
| `salud` | `GET /api/salud` | Ninguna | `ok` y si la base de datos responde; sin más detalle |
| `recibirAvisoResend` | `POST /api/webhooks/resend` | Firma con `RESEND_WEBHOOK_SECRET` | 200; encola el procesamiento ([[S04-Servicios-Externos]]) |
| `medir` | `POST /api/medir` | Límite por visita; solo eventos reconocidos | 204 siempre ([[S07-Medicion-de-Uso]]) |
| `reintentarTrabajo` *(Admin)* | Acción de servidor | `exigir(ADMIN)` | Vuelve un trabajo `FALLIDO` a `PENDIENTE` |

## Permisos

Una sola función, `exigir(rol)`, al inicio de **toda** operación no pública. Las pantallas ocultan lo que no corresponde, pero la seguridad está en el servidor (RNF-SEG-03).

| Regla | Dónde se comprueba |
|-------|--------------------|
| Hay sesión y el usuario sigue activo | `exigir` |
| El rol alcanza | `exigir` |
| El recurso es propio (psicólogo) | En la consulta: siempre filtrada por su `id` |
| Los identificadores que llegan del navegador nunca se dan por buenos | En cada operación |

## Datos simulados

Mientras B implementa, A y C usan `contratos/simulados.ts`: una versión de cada operación que devuelve datos fijos con la forma exacta de esta nota, incluidos casos de error (por ejemplo, el horario de las 3:00 p. m. siempre responde `CUPO_OCUPADO`). Al terminar B, se cambia la importación y se borra el archivo.
