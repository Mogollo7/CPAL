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
| Pie | Equipo · Privacidad · Términos · Redes · Líneas de ayuda · Ingreso del equipo |
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

## Inventario de mockups en Figma

**Corte: 17-nov-2026.** Compara esta nota, [[02-Requisitos-Funcionales]], [[E05-Operaciones-y-Contratos]], [[E06-Correos]], [[E09-Flujos-de-Usuario]] y [[N06-Componentes-y-Estados]] contra la página **CAPL · Diseño y prototipo** del archivo de Figma ([[N10-Tokens-y-Figma]]). En código solo existe la portada (`app/(publico)/page.tsx`); todo lo demás depende de estos mockups.

Marcas: ✅ existe · 🟡 existe pero incompleto · ❌ falta · ⚠️ existe pero contradice un requisito.

### 1. Lo que ya existe (40 pantallas de escritorio, 9 popups, 3 móviles)

| Sección de Figma | Pantallas a 1280 | Popups |
|------------------|------------------|--------|
| 1 · Sitio público | Inicio · Cómo funciona · Servicios · Equipo · Eventos · Detalle de evento · Ayuda inmediata · Contacto | Cookies · Privacidad · Inscripción lista ⚠️ · Respiración |
| 2 · Pedir cita y Mi cita | Pasos 1 a 5 · Solicitud recibida · Mi cita · Cita cancelada | Cancelar cita |
| 3 · Acceso y panel del psicólogo | Ingresar · Código de verificación · Recuperar contraseña · Crear contraseña · Mis citas · Mi horario · Mi perfil · Mi cuenta | Bloquear horario |
| 4 · Panel de administración | Bandeja · Detalle de cita · Calendario · Psicólogos · Nuevo psicólogo · Detalle de psicólogo · Eventos · Editor de evento · Fechas bloqueadas · Servicios · Configuración | Autorizar cita · Rechazar cita · Desactivar psicólogo |
| 5 · Estados y contingencia | Sin conexión ⚠️ · 404 · Eventos sin programar · Algo falló | — |
| 6 · Móvil 360 | Inicio · Ayuda inmediata · Pedir cita paso 1 | Menú móvil |

### 2. Pantallas y vistas completas que faltan (13)

| # | Pantalla | Ruta | Por qué hace falta | Origen |
|---|----------|------|--------------------|--------|
| F-01 | Política de tratamiento de datos (página completa; hoy solo hay popup) | `/privacidad` | Se enlaza desde todo formulario y desde el pie | RF-PUB-09 |
| F-02 | Términos y condiciones | `/terminos` | Igual que la anterior | RF-PUB-09 |
| F-03 | Administradores: lista, formulario de creación, desactivar (no deja con el último activo) | `/panel/admin/administradores` | No hay ningún marco; el correo de acceso de emergencia lleva aquí | RF-ADM-11, S02 |
| F-04 | Crear evento (editor vacío, guardar borrador) | `/panel/admin/eventos/nuevo` | Solo existe el editor con datos | RF-EVE-01 |
| F-05 | Reprogramar cita: elegir nuevo horario | dentro de `/cita/[token]` | Mi cita tiene el botón pero no la vista que sigue | RF-CIT-13, E09 §2 |
| F-06 | Enlace de cita no válido + contactos | `/cita/[token]` | `ENLACE_INVALIDO` | E05, E09 §2 |
| F-07 | Mi cita en solo lectura (pasó el plazo de 12 h) + contactos | `/cita/[token]` | `FUERA_DE_PLAZO` | E09 §2 |
| F-08 | Crear contraseña con enlace vencido: campo de correo para pedir otro | `/crear-clave/[token]` | `ENLACE_VENCIDO` | RF-AUT-03 |
| F-09 | Recuperar contraseña: "revisa tu correo" (respuesta idéntica exista o no) | `/recuperar-clave` | Fin de flujo | RF-AUT-04 |
| F-10 | Sin permiso: mensaje + enlace al inicio del panel propio | panel | `SIN_PERMISO` | E09 reglas comunes |
| F-11 | No encontrado y "algo falló" con el marco del panel (barra lateral) | panel | Los de la sección 5 son del sitio público | E05 · *inferido* |
| F-12 | Primeros auxilios emocionales: ejercicio 5-4-3-2-1 y guía para acompañantes | `/ayuda-inmediata` | Existe el popup Respiración; no aparece el 5-4-3-2-1 (`contenido/anclaje.json`) | RF-EMG-06 |
| F-13 | Mi cuenta del administrador: cambiar contraseña, cerrar todas mis sesiones y olvidar dispositivos | ruta sin definir en esta nota | Solo existe la del psicólogo; el correo `aviso-ingreso` lleva a "Cerrar mis sesiones" | S02 Otras medidas, `cambiarClave`, `cerrarMisSesiones` |

### 3. Estados que faltan en pantallas que ya existen

Regla de N06: toda pantalla se diseña **con datos · vacía · cargando · con error · sin conexión**. Hoy casi todas están solo "con datos". En Figma no aparece ningún texto de carga ("Cargando…", "Enviando…") ni de error de formulario.

| Pantalla | Estados por dibujar | Origen |
|----------|---------------------|--------|
| Inicio | Bloque de próximos eventos vacío | E04 |
| Equipo | Vacío · cargando | N06 |
| Detalle de evento | Evento pasado o no encontrado | RF-EVE-06 |
| Pedir cita · paso 1 | Servicio no disponible → contacto | `SERVICIO_NO_DISPONIBLE` |
| Pedir cita · paso 3 | **Sin cupos + próxima fecha + contactos** · cargando cupos · aviso "ese horario ya fue tomado" | N06, `CUPO_OCUPADO`, `FUERA_DE_RANGO` |
| Pedir cita · paso 4 | Variante **para otra persona** (datos del paciente) · variante **menor de edad** (datos del acudiente) · errores de campo | RF-CIT-02 |
| Pedir cita · paso 5 | Casilla sin marcar · enviando · ya tienes una cita activa · demasiados intentos · algo falló | RF-CIT-07, `LIMITE_CITAS`, `DEMASIADOS_INTENTOS` |
| Pedir cita · todos los pasos | Base de datos caída: "intenta más tarde" + contactos del CAPL, nunca la pantalla de error | RNF-REN-08 |
| Mi cita | Una vista por estado: pendiente · autorizada · no autorizada · vencida · atendida · límite de reprogramaciones | E03, `LIMITE_REPROGRAMACIONES` |
| Ingresar | Credenciales erradas (mensaje genérico) · 5 intentos → espera de 15 min · 15 en un día → la cuenta exige recuperar contraseña · "tu sesión se cerró" · ingresando | RF-AUT-07, E09 §1, S02 |
| Código de verificación | Código errado o vencido · código reenviado · demasiados intentos | `CODIGO_INVALIDO` |
| Crear contraseña | Reglas de la contraseña · no coinciden · creada | RF-AUT-03 |
| Mis citas (psicólogo) | Cada pestaña vacía · vista de semana · aviso "completa tu perfil y horario" | RF-PSI-04, E04 Acceso |
| Mi horario | Sin bloques · añadir y editar bloque · sin ausencias · guardado · aviso de citas que quedan fuera del nuevo horario | RF-PSI-02, 03, `guardarHorario` |
| Mi perfil | Subiendo foto · archivo no válido · guardado | `ARCHIVO_INVALIDO` |
| Mi cuenta | Contraseña actual errada · cambiada · cerrar todas mis sesiones | RF-PSI-06, `cerrarMisSesiones` |
| Bandeja de citas | Sin pendientes · sin resultados · cargando · exportando | RF-ADM-03, 14 |
| Detalle de cita | Una vista por estado (botones cambian) · "otra persona ya la gestionó" · **correo no entregado** · la hora ya pasó | RF-ADM-04, 10, RF-COR-12, `TRANSICION_INVALIDA` |
| Calendario | Semana sin citas · cargando | RF-ADM-07 |
| Psicólogos | Vacío ("Aún no hay psicólogos. Crear el primero") · a quién le falta perfil u horario | N06, E09 §1b |
| Nuevo psicólogo | Dominio no permitido · correo en uso · creado | `CORREO_NO_PERMITIDO`, `CORREO_EN_USO` |
| Eventos (panel) | Vacío · borrador frente a publicado | RF-EVE-01 |
| Fechas bloqueadas | Vacío · formulario de bloqueo del centro | RF-ADM-09 |
| Servicios (panel) | Crear y editar servicio · inactivo | RF-ADM-08 |
| Configuración | Guardado · pide confirmar contraseña | RF-ADM-06, RF-AUT-08 |

### 4. Popups que faltan (9)

N06: modal solo para confirmar acciones delicadas; toda acción irreversible del panel pide confirmación.

| # | Popup | Dónde | Origen |
|---|-------|-------|--------|
| P-01 | Cancelar cita desde administración (con motivo) | Detalle de cita | RF-ADM-05, `cancelarCitaAdmin` |
| P-02 | Reasignar cita: otro psicólogo u horario | Detalle de cita | RF-ADM-05, `reasignarCita` |
| P-03 | Desactivar psicólogo **con citas futuras**: lista las citas por reasignar o cancelar | Detalle de psicólogo | `TIENE_CITAS_FUTURAS` |
| P-04 | Confirma tu contraseña (acción sensible) | Configuración, administradores, desactivar | RF-AUT-08, `CONFIRMACION_REQUERIDA` |
| P-05 | Quitar bloqueo o ausencia | Fechas bloqueadas, Mi horario | N06 |
| P-06 | Despublicar evento | Editor de evento | RF-EVE-01 |
| P-07 | Confirmar reprogramación (la cita anterior se cancela) | Mi cita (F-05) | RF-CIT-13 |
| P-08 | Tu sesión está por cerrarse (5 minutos antes) · "Seguir conectado" | Los dos paneles | E03 §7 |
| P-09 | Cerrar todas mis sesiones y olvidar dispositivos | Mi cuenta (psicólogo y F-13) | S02, `cerrarMisSesiones` |

### 5. Móvil 360: faltaban 36 de 40 (más 3 del panel nuevo)

E04 pide cada pantalla a 360 y 1280. Solo están Inicio, Ayuda inmediata y Pedir cita paso 1. Orden por uso real en celular:

1. **Pedir cita pasos 2–5, Solicitud recibida, Mi cita, Cita cancelada** — el recorrido de prueba de E09 empieza "desde un celular".
2. **Resto del sitio público:** Cómo funciona, Servicios, Equipo, Eventos, Detalle de evento, Contacto, Privacidad, Términos, 404, Algo falló (sin Preguntas frecuentes, ver C-06).
3. **Acceso:** Ingresar, Código, Recuperar, Crear contraseña (el psicólogo abre la invitación desde el correo del celular).
4. **Panel del psicólogo:** las 4, con barra inferior de máximo 4 destinos (N06).
5. **Panel de administración:** las 11 existentes más F-03, F-04 y F-13; las tablas pasan a tarjetas (N06).

### 6. Correos: ninguno estaba en Figma (16 plantillas + la base)

El código ya los arma (`correos/`), pero sin mockup aprobado. Una columna de 600 px, un solo botón (N06).

| Grupo | Plantillas |
|-------|-----------|
| Base | Encabezado con logo y casa amarilla, tarjeta blanca, pie con contacto y líneas de ayuda |
| Paciente | `solicitud-recibida` · `cita-autorizada` (con enlaces de calendario) · `cita-no-autorizada` · `cita-vencida` · `cita-cancelada` · `recordatorio` |
| Psicólogo | `cita-nueva-psicologo` · `cita-cancelada-psicologo` · `cita-reasignada` *(en código, falta en E06)* |
| Administración | `nueva-solicitud` · `codigo-ingreso` (muestra el código, sin botón) · `aviso-ingreso` · `aviso-acceso-emergencia` *(en código, falta en E06)* |
| Cuentas | `invitacion` · `recuperar-clave` |
| Eventos | `inscripcion-evento` ⚠️ |

### 7. Contradicciones por resolver antes de dibujar

| # | Asunto | Qué choca | Efecto en Figma |
|---|--------|-----------|-----------------|
| C-01 | **Inscripción a eventos** | RF-EVE-03, 04, 05 y RF-COR-09 están **descartados** (eventos = vitrina), pero esta nota, E05, E06, E09 §4 y Figma conservan formulario, cupos, popup "Inscripción lista", pestaña de inscritos y el correo | Si manda el requisito: **quitar** esas piezas en vez de diseñar más |
| C-02 | **Sin conexión** | Esta nota la ata a RF-PUB-10, que está descartado (PWA); E09 aún prueba `/ayuda-inmediata` en modo avión | Decidir si la pantalla se queda |
| C-03 | **Menú del panel admin** | La tabla de navegación no incluye Servicios ni Administradores, que sí son rutas | Definir dónde van en la barra lateral |
| C-04 | **Auditoría** | S02 da al administrador permiso de **ver** la auditoría, pero ninguna ruta la muestra; solo existe el historial dentro de cada cita (RF-ADM-12) | Decidir si hace falta una pantalla propia |
| C-05 | **Reintentar un envío fallido** | E05 define `reintentarTrabajo` para el administrador, pero ninguna pantalla lo ofrece | Decidir si va como botón junto al aviso "correo no entregado" del detalle de cita |
| C-06 | **Preguntas frecuentes** *(resuelta 17-nov-2026)* | La página aparte repetía las 6 preguntas que ya están dentro de Inicio y de Servicios | Se quitó la ruta, su marco y su nota de Figma, el enlace del pie y la ruta del sitemap; RF-PUB-04 se cumple con esos bloques. En el 404 el botón pasó a «Contacto» |
| C-07 | **Ayuda inmediata** | Es la página a la que lleva el botón flotante de todo el sitio (RF-EMG-04) y la prueba nº 9 de E09 | Se mantiene. Si la duda es el contenido clínico o los números, se valida con el CAPL ([[12-Codigos-de-Emergencia-Borrador]]), no se quita la página |

No se dibujan hasta que se autoricen: modo oscuro (PR-19) y panel de indicadores (PR-08).

### 8. Piezas de biblioteca que faltan

Del inventario de N06 no están como componente en la sección 0: área de texto · selector · opción única · tarjeta de código de emergencia · selector de día · modal · tabla del panel · estado vacío · esqueleto de carga · campo de código de 6 dígitos · subir foto · migas · barra inferior del panel móvil · plantilla de correo.

### Resumen

| Grupo | Existe | Faltaba | Marco vacío creado |
|-------|--------|---------|--------------------|
| Pantallas de escritorio | 40 | 13 (F-01 a F-13) | 14 (F-11 son dos: no encontrado y algo falló) |
| Estados de pantallas existentes | — | 25 filas | No: son variantes, se dibujan dentro de cada pantalla (tabla 3) |
| Popups | 9 | 9 | 9 |
| Móvil 360 | 3 | 36 + 3 de panel nuevas | 39 |
| Correos | 0 | 16 plantillas + base | 16 (base + 15; sin `inscripcion-evento`, ver C-01) |
| Componentes | 31 | 14 | No |

### 9. Marcos vacíos ya creados en Figma (17-nov-2026)

En la página **CAPL · Diseño y prototipo**, a la derecha de todo (desde `x = 26400`), hay 8 secciones llamadas `☐ POR DISEÑAR · …` con **78 marcos vacíos**. Cada uno trae el encabezado y el pie reales de la biblioteca (o la barra lateral del panel, o el pie móvil) y una tarjeta punteada con la etiqueta amarilla **POR DISEÑAR**, qué ruta es, qué debe llevar, los estados a dibujar y de qué requisito sale. Al diseñar un marco, se borra la tarjeta y se mueve el marco a su sección definitiva.

| Sección de Figma | Marcos |
|------------------|--------|
| 1 · Sitio público | 3: Privacidad, Términos, Primeros auxilios emocionales |
| 2 · Pedir cita y Mi cita | 3: Reprogramar, Enlace no válido, Solo lectura |
| 3 · Acceso | 2: Crear contraseña vencida, Recuperar enviado |
| 4 · Paneles | 6: Administradores, Crear evento, Mi cuenta admin, Sin permiso, No encontrado, Algo falló |
| 5 · Popups | 9: P-01 a P-09 |
| 6 · Móvil 360 · Sitio, citas y acceso | 21 |
| 7 · Móvil 360 · Paneles | 18 |
| 8 · Correos | 16 |

Faltan en la biblioteca y los marcos lo avisan: variantes de la barra lateral para **Administradores** y **Mi cuenta** (admin), un encabezado y una barra inferior del **panel en móvil**, y el pie móvil en componente (hoy es un marco suelto dentro de cada móvil).
