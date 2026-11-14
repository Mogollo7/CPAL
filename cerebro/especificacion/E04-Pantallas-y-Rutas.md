---
tags: [capl, especificacion, pantallas]
---

# E04 · Pantallas y rutas

Volver a [[E00-Especificacion-Inicio]]. Es también la **lista de mockups** del rol A. Las operaciones citadas están en [[E05-Operaciones-y-Contratos]].

**Tipo:** `E` estática (no toca la base de datos) · `R` estática que se regenera cada pocos minutos (sigue visible si la base de datos cae) · `D` dinámica.

## Sitio público — rol A

| Ruta | Pantalla | Tipo | Contenido | Datos | RF |
|------|----------|------|-----------|-------|----|
| `/` | Inicio | E | Portada con casa amarilla, qué es el CAPL, gratuidad, 3 pasos, servicios destacados, próximos eventos (bloque R), botón "Pedir mi cita" | `contenido/` + `listarEventosPublicos` | PUB-01 |
| `/como-funciona` | Cómo funciona | E | Camino de pasos: pedir → autorización → asistir; qué llevar; cancelar y reprogramar; quiénes atienden | `contenido/` | PUB-02 |
| `/servicios` | Servicios | E | Tarjeta por servicio con viñeta, para quién es y botón que abre `/pedir-cita?servicio=slug`; los no agendables llevan a contacto | `contenido/servicios.json` | PUB-03 |
| `/equipo` | Directorio | R | Tarjetas con foto circular, nombre, área y presentación | `listarEquipoPublico` | PUB-07 |
| `/eventos` | Eventos | R | Lista de próximos eventos; estado vacío ilustrado | `listarEventosPublicos` | EVE-02 |
| `/eventos/[slug]` | Detalle de evento | R | Imagen, fecha, lugar, descripción, cupos, formulario de inscripción | `verEventoPublico`, `inscribirseEvento` | EVE-02, 03 |
| `/ayuda-inmediata` | Guía de emergencias | E | Orientador de 3–4 preguntas arriba; tarjetas por código; directorio de líneas con botón de llamada; fecha de última revisión | `contenido/emergencias.json` | EMG-01…05 |
| `/preguntas-frecuentes` | Preguntas frecuentes | E | Acordeón | `contenido/faq.json` | PUB-04 |
| `/contacto` | Contacto | E | Dirección con mapa (enlace, no mapa incrustado de terceros), correo, WhatsApp, horarios, redes | `contenido/` | PUB-05, 06 |
| `/pedir-cita` | Formulario de cita | D | 5 pasos (abajo) | `obtenerCupos`, `listarPsicologosDeServicio`, `crearCita` | CIT-01…10 |
| `/pedir-cita/confirmacion` | Solicitud recibida | E | Código de la cita, qué sigue, plazo de respuesta, líneas de ayuda | Estado del navegador | CIT-08 |
| `/cita/[token]` | Mi cita | D | Resumen y estado; botones cancelar y reprogramar si aún se puede | `verCita`, `cancelarCita`, `reprogramarCita` | CIT-11, 13 |
| `/privacidad` · `/terminos` | Legales | E | Texto aprobado por la universidad | `contenido/legal/` | PUB-09 |
| `/sin-conexion` | Sin conexión | E | Aviso amable + guía de emergencias guardada | — | PUB-10 |
| `no encontrada` · `error` | Páginas de error | E | Ilustración serena, volver al inicio, contactos del CAPL | — | — |

Presentes en **todas**: encabezado, pie con contacto y redes, botón flotante "Necesito ayuda ahora" → `/ayuda-inmediata`, enlace "Saltar al contenido".

### Pasos de `/pedir-cita`

| Paso | Pregunta | Contenido | Validación para avanzar |
|------|----------|-----------|-------------------------|
| 1 | ¿Qué servicio necesitas? | Tarjetas de servicios agendables. Si llega `?servicio=`, viene preseleccionado | Un servicio |
| 2 | ¿Para quién es la cita? | Para mí · Para otra persona · Para un menor de edad | Una opción |
| 3 | ¿Con quién y cuándo? | "Cualquiera disponible" + tarjetas de psicólogos; fila de días; horas como píldoras. Sin cupos → próxima fecha y contactos | Un horario |
| 4 | Tus datos | Nombre, documento, edad, correo, teléfono; datos del paciente si es otra persona; datos del acudiente si es menor; motivo opcional | Esquema `cita` |
| 5 | Revisa y confirma | Resumen editable por sección; casilla de tratamiento de datos; botón "Pedir mi cita" | Casilla marcada |

El avance se guarda en `sessionStorage` y se borra al enviar. Si al enviar el cupo ya fue tomado (`CUPO_OCUPADO`), se vuelve al paso 3 conservando todo lo demás, con un aviso amable.

## Acceso — pantalla A, lógica B

| Ruta | Pantalla | Contenido | Operación |
|------|----------|-----------|-----------|
| `/ingresar` | Ingreso | Correo y contraseña; enlace "No recuerdo mi contraseña". Para administradores en dispositivo nuevo, segundo paso en la misma pantalla: código de 6 dígitos, casilla "Recordar este dispositivo 30 días", reenviar | `ingresar`, `verificarCodigo`, `reenviarCodigo` |
| `/crear-clave/[token]` | Crear contraseña | Saludo con el nombre; contraseña y confirmación; si el enlace venció, campo de correo para pedir otro | `validarEnlace`, `crearClave`, `solicitarEnlace` |
| `/recuperar-clave` | Recuperar | Campo de correo; respuesta idéntica exista o no | `solicitarEnlace` |

Tras ingresar: admin → `/panel/admin/citas`; psicólogo → `/panel/psicologo/citas`. Un psicólogo con perfil u horario incompletos ve un aviso que lo lleva a completarlos.

## Panel del psicólogo — rol C

Todas dinámicas, sin indexar, exigen sesión con rol `PSICOLOGO`.

| Ruta | Pantalla | Contenido | Operaciones | RF |
|------|----------|-----------|-------------|----|
| `/panel/psicologo/citas` | Mis citas | Pestañas próximas / pendientes / pasadas; vista de semana; contacto del paciente | `listarMisCitas` | PSI-04, 05 |
| `/panel/psicologo/perfil` | Mi perfil | Foto, presentación, área (solo lectura), servicios que atiende, visible en directorio | `obtenerMiPerfil`, `actualizarPerfil`, `subirFoto` | PSI-01, 07 |
| `/panel/psicologo/horario` | Mi horario | Semana lun–vie con bloques por día (añadir, editar, quitar); ausencias puntuales | `guardarHorario`, `crearBloqueo`, `eliminarBloqueo` | PSI-02, 03 |
| `/panel/psicologo/cuenta` | Mi cuenta | Cambiar contraseña; cerrar sesión | `cambiarClave` | PSI-06 |

## Panel de administración — rol C

Exigen rol `ADMIN`.

| Ruta | Pantalla | Contenido | Operaciones | RF |
|------|----------|-----------|-------------|----|
| `/panel/admin/citas` | Bandeja de citas | Abre en "Pendientes"; filtros por estado, fecha, psicólogo, servicio; búsqueda por código o nombre; exportar CSV | `listarCitas`, `exportarCitas` | ADM-03, 14 |
| `/panel/admin/citas/[id]` | Detalle de cita | Todos los datos, historial de acciones, botones según estado: autorizar, rechazar, cancelar, reasignar, marcar asistencia | `verCitaAdmin`, `autorizarCita`, `rechazarCita`, `cancelarCitaAdmin`, `reasignarCita`, `marcarAsistencia` | ADM-04, 05, 10, 12 |
| `/panel/admin/calendario` | Calendario | Semana de todo el centro, por psicólogo | `listarCitas` | ADM-07 |
| `/panel/admin/psicologos` | Psicólogos | Lista con estado (invitado, activo, inactivo), área, si tiene horario | `listarPsicologos` | ADM-02 |
| `/panel/admin/psicologos/nuevo` | Crear psicólogo | Nombre, correo institucional, área | `crearPsicologo` | ADM-01 |
| `/panel/admin/psicologos/[id]` | Detalle | Editar, reenviar invitación, desactivar o reactivar; ver su horario | `actualizarPsicologo`, `reenviarInvitacion`, `cambiarActivo` | ADM-02 |
| `/panel/admin/eventos` | Eventos | Lista con estado y número de inscritos | `listarEventos` | EVE-01 |
| `/panel/admin/eventos/nuevo` · `/[id]` | Crear / editar evento | Campos, imagen, cupo, publicar; pestaña de inscritos con exportación | `guardarEvento`, `publicarEvento`, `listarInscritos`, `exportarInscritos` | EVE-01, 05 |
| `/panel/admin/bloqueos` | Fechas bloqueadas | Bloqueos de todo el centro; festivos del año (solo lectura) | `listarBloqueos`, `crearBloqueo`, `eliminarBloqueo` | ADM-09, 13 |
| `/panel/admin/servicios` | Servicios | Nombre, descripción, duración, activo, agendable en línea | `guardarServicio` | ADM-08 |
| `/panel/admin/administradores` | Administradores | Lista y creación | `crearAdministrador` | ADM-11 |
| `/panel/admin/configuracion` | Configuración | Interruptor de auto-autorización y los valores de [[E03-Reglas-de-Negocio]] §1, cada uno con una línea que explica su efecto | `obtenerConfiguracion`, `actualizarConfiguracion` | ADM-06 |

## Navegación

| Zona | Enlaces |
|------|---------|
| Encabezado público | Cómo funciona · Servicios · Eventos · Contacto · **Pedir cita** (botón) |
| Pie | Preguntas frecuentes · Equipo · Privacidad · Términos · Redes · Líneas de ayuda · Ingreso del equipo |
| Panel psicólogo | Mis citas · Mi horario · Mi perfil · Mi cuenta |
| Panel admin | Citas · Calendario · Psicólogos · Eventos · Fechas bloqueadas · Configuración |

## Orden sugerido de mockups

1. Componentes base ([[N06-Componentes-y-Estados]])
2. Inicio y ayuda inmediata (fase 1)
3. Resto del sitio público (fase 1)
4. Ingreso, crear contraseña, panel: psicólogos, perfil, horario (fase 2)
5. Formulario de cita, mi cita, bandeja y detalle (fase 3)
6. Correos (fase 3)
7. Eventos, público y panel (fase 4)

Cada pantalla: 360 px y 1280 px, con sus estados vacío, cargando y error.
