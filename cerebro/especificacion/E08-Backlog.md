---
tags: [capl, especificacion, backlog]
---

# E08 · Backlog de tareas

Volver a [[E00-Especificacion-Inicio]]. Cada fila es **un issue de GitHub**: se copia el título, se asigna y se trabaja en una rama `feat/T-XXX-…`. Fases y fechas en [[08-Ruta-de-Desarrollo]]; reglas de trabajo en [[07-Protocolo-de-Equipo]].

**Columnas:** `Rol` quién la hace · `Dep.` tareas que deben estar unidas antes · `Hecho cuando` criterio verificable en el entorno de pruebas.

Las tareas marcadas *(D)* son deseables: se hacen si la fase va a tiempo.

## Quién hace cada letra

Las letras son **áreas de trabajo**. El reparto por persona (13-nov-2026) está en [[06-Division-del-Trabajo]]:

| Letra en esta nota | Persona |
|--------------------|---------|
| **B** (servidor, datos, correos) | **Tú** |
| **C** en tareas de infraestructura: T-001, T-003, T-004, T-005, T-007, T-321, T-506, T-507, T-508, T-601, T-607, y toda la sección "Servidor y observación" | **Tú** |
| **A** en tareas de diseño: T-010 y los mockups de cada fase | **Tú** |
| **A** en el resto (construir el sitio público y el formulario) | Integrante 2 |
| **C** en el resto (construir los paneles) | Integrante 3 |

---

## Fase 0 — Preparación (semana 1)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-001 | Repositorio, protección de `main`, plantilla de PR, tablero, etiquetas por fase | C | — | Nadie puede subir directo a `main`; el tablero tiene las 4 columnas |
| T-002 | Proyecto base según [[E01-Stack-y-Entorno]] ("Primer día") | B | T-001 | Se levanta en limpio en menos de 10 min; `/api/salud` responde |
| T-003 | CI: lint, tipos, pruebas, build | C | T-002 | Un PR con un error de tipos no se puede unir |
| T-004 | Servidor: Docker, cortafuegos, usuario de despliegue, Caddy, dominio de pruebas con HTTPS | C | — | El dominio de pruebas responde por HTTPS |
| T-005 | Despliegue automático a pruebas | C | T-003, T-004 | Unir un PR actualiza el sitio de pruebas sin tocar el servidor |
| T-006 | Base de datos: esquema de [[E02-Modelo-de-Datos]], primera migración con las restricciones SQL, semilla | B | T-002 | `bd:reiniciar` deja datos de ejemplo; insertar dos citas cruzadas falla |
| T-007 | Dominio verificado en Resend (SPF, DKIM, DMARC) | B + C | T-004 | Un correo de prueba llega a un buzón institucional y a Gmail, fuera de spam |
| T-008 | Cola `Trabajo` ([[S05-Colas-y-Tareas]]) y módulo de correo: envío, modos `consola` y `resend`, desvío en pruebas, plantilla base | B | T-006, T-007 | Encolar un correo lo envía; con clave inválida queda pendiente y se reintenta |
| T-009 | Utilidades del servidor: tipo `Resultado`, códigos de error, `exigir(rol)`, fechas en Bogotá, límite de intentos, auditoría | B | T-002 | Cada una con su prueba unitaria |
| T-010 | Figma: variables base y de rol, estilos de texto, componentes base ([[N10-Tokens-y-Figma]]) | A | — | La biblioteca tiene los componentes del inventario con sus estados |
| T-011 | Tokens en código: `estilos/tokens.css` y configuración de Tailwind solo con tokens | A | T-002, T-010 | No existe ningún color o tamaño por defecto de Tailwind disponible |
| T-012 | Componentes base en código: botón, campo, tarjeta, aviso, píldora de estado, modal | A | T-011 | Página interna `/_componentes` los muestra en todos sus estados; navegables con teclado |
| T-013 | Fuente alojada en el servidor, iconos, página de error y no encontrada | A | T-011 | Sin peticiones a servidores externos al cargar el sitio |

**Cierre de fase:** "Hola CAPL" desplegado solo en pruebas, correo de prueba recibido, componentes base visibles.

---

## Fase 1 — Sitio público y emergencias (semanas 2–3)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-101 | Estructura pública: encabezado, menú móvil, pie, "Saltar al contenido", botón flotante de ayuda | A | T-012 | Presente en todas las páginas; el botón de ayuda nunca tapa la acción principal |
| T-102 | Inicio | A | T-101 | RF-PUB-01; mockup 360 y 1280 |
| T-103 | Cómo funciona | A | T-101 | RF-PUB-02 |
| T-104 | Servicios, desde `contenido/servicios.json` | A | T-101 | RF-PUB-03; "Pedir cita" lleva el servicio preseleccionado |
| T-105 | Preguntas frecuentes | A | T-101 | RF-PUB-04; el acordeón funciona con teclado |
| T-106 | Contacto y redes | A | T-101 | RF-PUB-05, 06; teléfono y correo tocables |
| T-107 | Privacidad y términos | A | T-101 | RF-PUB-09; texto marcado como borrador hasta aprobación |
| T-108 | `contenido/emergencias.json` con su esquema; página de ayuda inmediata (`/ayuda-inmediata`): tarjetas por código de color (Dorado, Fucsia, Blanco, Rosa), qué hacer / qué no hacer, y directorio de líneas con botón `tel:` | A | T-101 | RF-EMG-01, 02, 04, 05; la página abre incluso con la base de datos detenida; muestra fecha de última revisión |
| T-109 | Orientador "¿Qué me está pasando?" (3–4 preguntas) y ejercicio guiado de anclaje (grounding 5-4-3-2-1) | A | T-108 | RF-EMG-03, 06; interactivo, sereno, siempre termina mostrando la línea adecuada y el 123 |
| T-110 | Metadatos, mapa del sitio, `robots`, imagen para redes | A | T-102 | Lighthouse SEO ≥ 90; pruebas bloqueado a buscadores |
| T-111 | Estructura del panel: diseño, navegación por rol, guarda de sesión (con sesión simulada) | C | T-012 | Las rutas del panel existen con estados vacíos |
| T-112 | Contratos y datos simulados de la fase 2 | B | T-009 | `contratos/` tiene `cuenta`, `psicologo`, `horario`, `bloqueo` y sus simulados |
| T-113 | Enviar el [[11-Cuestionario-CAPL]] y registrar respuestas | A | — | Respuestas copiadas a [[10-Preguntas-Abiertas]] |

**Cierre de fase:** el CAPL revisa el sitio en pruebas y aprueba textos; contenido de emergencias aprobado por el CAPL.

---

## Fase 2 — Cuentas, psicólogos y horarios (semanas 4–5)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-201 | Sesiones: ingreso, cierre, expiración, comprobación de usuario activo en cada carga | B | T-009 | RF-AUT-01, 05, 07; un psicólogo que abre una ruta de admin recibe `SIN_PERMISO` |
| T-202 | Enlaces de acceso: generar, validar, consumir, invalidar anteriores | B | T-006 | [[E03-Reglas-de-Negocio]] §6; pruebas de vigente, vencido, usado y reemitido |
| T-203 | `crearClave`, `solicitarEnlace`, `cambiarClave` | B | T-201, T-202 | RF-AUT-02, 03, 04; "solicitar" responde igual exista o no el correo |
| T-204 | Correos `invitacion` y `recuperar-clave` | B | T-008, T-202 | RF-COR-07, 08; el enlace abre la pantalla correcta |
| T-205 | Operaciones de psicólogos y administradores | B | T-203 | RF-ADM-01, 02, 11; RF-AUT-06; rechaza dominios fuera de la lista |
| T-206 | Operaciones de perfil, foto, horario y bloqueos | B | T-201 | RF-PSI-01, 02, 03; la foto queda en 400 × 400 |
| T-207 | Pantallas de ingreso, crear contraseña y recuperar | A | T-112 | Mockups implementados; con enlace vencido se puede pedir otro |
| T-208 | Admin: lista, creación y detalle de psicólogos | C | T-111, T-112 | Crear → aparece como "invitado"; reenviar y desactivar funcionan |
| T-209 | Psicólogo: mi perfil y foto | C | T-111, T-112 | RF-PSI-01, 07 |
| T-210 | Psicólogo: mi horario semanal y ausencias | C | T-111, T-112 | RF-PSI-02, 03; no permite bloques cruzados |
| T-211 | Psicólogo: mi cuenta | C | T-111 | RF-PSI-06 |
| T-212 | Conectar pantallas con operaciones reales y borrar simulados | A + C | T-203…T-206 | Flujo completo en pruebas |
| T-213 | Directorio público `/equipo` *(D)* | A | T-206 | RF-PUB-07; solo perfiles visibles y activos |
| T-214 | Admin: administradores *(D)* | C | T-205 | RF-ADM-11 |
| T-215 | Pruebas de permisos: cada operación con cada rol | B | T-205, T-206 | Tabla de permisos de [[E05-Operaciones-y-Contratos]] cubierta |
| T-216 | Contrato `cita.ts`, `cupo.ts`, `filtros-cita.ts` y simulados de la fase 3 | B | — | Unido **antes** de empezar la fase 3 |

**Cierre de fase:** crear psicólogo → llega el correo → abre el enlace → crea su clave → carga perfil y horario; el enlace ya no sirve.

---

## Fase 3a — Citas: núcleo (semanas 6–7)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-301 | `calcularCupos` con festivos | B | T-216 | RF-CIT-03, RF-ADM-13; todos los casos de [[E03-Reglas-de-Negocio]] §2 con prueba |
| T-302 | `GET /api/cupos` y `listarPsicologosDeServicio` | B | T-301 | Devuelve la forma del contrato; respeta el límite de consultas |
| T-303 | `crearCita`: validación, límites, asignación con "cualquiera", inserción, cola de correos | B | T-301 | RF-CIT-04…10; dos envíos simultáneos al mismo cupo: uno entra, el otro recibe `CUPO_OCUPADO` |
| T-304 | Estados de la cita: `transicionar` con auditoría | B | T-303 | [[E03-Reglas-de-Negocio]] §3; cada fila de la tabla con prueba, y las inválidas rechazadas |
| T-305 | Enlace firmado; `verCita`, `cancelarCita` | B | T-304 | RF-CIT-11; firma alterada → `ENLACE_INVALIDO` |
| T-306 | Operaciones de administración de citas | B | T-304 | RF-ADM-03, 04, 12 |
| T-307 | Correos de cita: recibida, nueva solicitud, autorizada, no autorizada, cancelada, y los dos del psicólogo | B | T-304 | RF-COR-01…06; ninguno contiene datos sensibles |
| T-308 | Operaciones de configuración y bloqueos del centro | B | T-009 | RF-ADM-06, 09; cambiar un valor cambia el comportamiento sin desplegar |
| T-309 | Formulario de cita, pasos 1 a 5 | A | T-216 | RF-CIT-01, 02; conserva lo escrito al volver y al recargar |
| T-310 | Confirmación y manejo de errores del formulario | A | T-309 | `CUPO_OCUPADO` devuelve al paso 3 sin perder datos |
| T-311 | Página "Mi cita": ver y cancelar | A | T-216 | RF-CIT-11; sin acciones cuando ya no aplica |
| T-312 | Admin: bandeja de citas con filtros y búsqueda | C | T-216 | RF-ADM-03; abre en "Pendientes" |
| T-313 | Admin: detalle de cita, autorizar, rechazar, cancelar | C | T-312 | RF-ADM-04; rechazar exige motivo |
| T-314 | Admin: configuración | C | T-308 | RF-ADM-06 |
| T-315 | Admin: fechas bloqueadas | C | T-308 | RF-ADM-09, 13; muestra los festivos del año |
| T-316 | Psicólogo: mis citas | C | T-216 | RF-PSI-04, 05; nunca muestra citas de otro |
| T-317 | Conectar con operaciones reales y borrar simulados | A + C | T-302…T-308 | Flujo completo en pruebas |

**Cierre de fase:** una persona ajena al equipo pide una cita desde su celular, recibe el correo, un administrador de prueba la autoriza y llega el segundo correo.

---

## Fase 3b — Citas: acompañamiento (semana 8)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-321 | `POST /api/tareas` y servicio `tareas`: procesar la cola, rescate, latido | B + C | T-008 | Se ejecuta cada minuto; ejecutarla dos veces no duplica nada; dos vueltas no se pisan |
| T-322 | Vencimiento de solicitudes y correo `cita-vencida` | B | T-321 | RF-CIT-12; el cupo queda libre |
| T-323 | Recordatorio 24 h | B | T-321 | RF-COR-10; se envía una sola vez |
| T-324 | Archivo `.ics` y enlace a Google Calendar | B | T-307 | RF-COR-11; se abre en el calendario del celular |
| T-325 | `reprogramarCita` | B | T-304 | RF-CIT-13; [[E03-Reglas-de-Negocio]] §4; si el cupo nuevo se ocupa, la cita original no cambia |
| T-326 | "Mi cita": reprogramar | A | T-325 | Reutiliza el selector de horario del formulario |
| T-327 | Exportar citas a CSV | B + C | T-306 | RF-ADM-14; abre bien en Excel con tildes |
| T-328 | Anonimización y limpieza diaria | B | T-321 | RNF-PRI-06; probada adelantando la fecha |
| T-329 | Reasignar cita y marcar asistencia *(D)* | B + C | T-306 | RF-ADM-05, 10 |
| T-330 | Calendario semanal del centro *(D)* | C | T-312 | RF-ADM-07 |
| T-331 | Gestión de servicios *(D)* | B + C | T-308 | RF-ADM-08 |

**Cierre de fase:** cancelar, reprogramar, vencer y recordar funcionan de principio a fin en pruebas.

---

## Fase 4 — Eventos (semana 9)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-401 | Contrato `evento.ts` y datos simulados | B | — | Unido el primer día de la fase |
| T-402 | Operaciones de eventos (crear, editar, listar activos con `fecha >= hoy`) | B | T-401 | RF-EVE-01, 06 |
| ~~T-403~~ | *(Descartado)* Correo `inscripcion-evento` con `.ics` | ❌ | — | Descartado al pasar a cartelera informativa |
| T-404 | Admin: lista, creación y edición de eventos con imagen | C | T-401 | RF-EVE-01 |
| ~~T-405~~ | *(Descartado)* Admin: inscritos y exportación | ❌ | — | Descartado al no haber inscripciones internas |
| T-406 | Eventos públicos y detalle (cartelera de presentación) | A | T-401 | RF-EVE-02; muestra fecha, lugar/link, imagen y texto |
| ~~T-407~~ | *(Descartado)* Formulario de inscripción | ❌ | — | Descartado |
| T-408 | Bloque de próximos eventos en el inicio | A | T-406 | Desaparece si no hay eventos |

**Cierre de fase:** se crea un evento en el panel de admin y se visualiza correctamente en la cartelera pública de eventos.

---

## Fase 5 — Pulido y endurecimiento (semana 10)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| ~~T-501~~ | *(Descartado)* Sitio instalable (PWA) | ❌ | — | Descartado para cumplir fecha de entrega (MVP 20-nov) |
| T-502 | Auditoría de accesibilidad de todas las pantallas | A | — | Listas de [[N09-Accesibilidad-y-Revision]] cumplidas; Lighthouse ≥ 90 |
| T-503 | Prueba de desbordes: 320–1920 px y zoom 200 % | A | — | RNF-ACC-07; sin desplazamiento horizontal |
| T-504 | Revisión de seguridad: permisos, límites, enlaces, cabeceras, registros sin datos personales | B | — | Lista RNF-SEG completa |
| T-505 | Prueba de extremo a extremo: pedir cita → autorizar | B | — | Corre en CI |
| T-506 | Copias de seguridad, copia externa y simulacro de restauración | C | — | RNF-REN-04; base restaurada en pruebas desde una copia |
| T-507 | Simulacro de caídas | C | — | RNF-REN-07, 08; tabla de [[E07-Infraestructura]] verificada |
| T-508 | Monitor externo y actualizaciones automáticas del sistema | C | — | RNF-REN-06, 09; alerta de prueba recibida |
| T-509 | Rendimiento: imágenes, fuentes, peso de página | A + C | — | RNF-REN-01; presupuestos de [[N11-Normas-Tecnicas]] |
| T-510 | Prueba con 3 personas reales | Todos | — | RNF-ACC-04; hallazgos corregidos o anotados |
| T-511 | Textos finales y política de datos aprobados | A | — | Visto bueno escrito del CAPL y la universidad |
| T-512 | Entrega de correo en Gmail, Outlook e institucional | B | — | Lista de [[E06-Correos]] cumplida en las 14 plantillas |

**Cierre de fase:** sin errores graves abiertos; todas las verificaciones de [[03-Requisitos-No-Funcionales]] pasan.

---

## Fase 6 — Lanzamiento y entrega (semana 11)

| ID | Tarea | Rol | Dep. | Hecho cuando |
|----|-------|-----|------|--------------|
| T-601 | Entorno de producción: subdominio, HTTPS, variables, Resend | C | T-506 | El subdominio oficial responde |
| T-602 | Base de producción: migraciones, servicios reales, configuración, primer administrador | B | T-601 | El administrador recibe su enlace y entra |
| T-603 | Carga de psicólogos reales y sus horarios | CAPL + C | T-602 | Hay cupos visibles en el formulario |
| T-604 | Cita real de prueba de principio a fin en producción | Todos | T-603 | Los correos llegan; la cita se cancela después |
| T-605 | Manual de administración y página "qué hacer si…" | C | — | RNF-MAN-05; una monitora lo sigue sin ayuda |
| T-606 | Capacitación a monitoras y psicólogos | Todos | T-605 | Sesión realizada |
| T-607 | Etiqueta `v1.0` y enlace desde el sitio anterior | C | T-604 | El sitio anterior apunta al nuevo |
| T-608 | Acta de entrega: accesos, responsables, contactos | Todos | T-607 | Firmada por el CAPL |

**Cierre del proyecto:** el CAPL agenda su primera cita real sin intervención del equipo.

---

## Servidor y observación (añadidas el 13-nov-2026)

Salen de [[S00-Servidor-Inicio]]. Todas son de quien lleva servidor y despliegue. Se hacen dentro de la fase indicada.

| ID | Fase | Tarea | Dep. | Hecho cuando |
|----|------|-------|------|--------------|
| T-014 | 0 | Función `registrar()`, identificador de petición, catálogo de eventos ([[S06-Observabilidad]]) | T-002 | Cada petición deja una línea JSON; la prueba de "sin datos personales en registros" pasa |
| ~~T-015~~ | 0 | *(Descartado)* Loki, Grafana y Alloy | — | Descartado: logs normales de Node/Docker son suficientes |
| T-016 | 0 | Usuarios de base de datos separados (`capl_app`, `capl_migrador`) ([[S03-Base-de-Datos]]) | T-006 | La aplicación no puede alterar tablas |
| T-217 | 2 | Segundo paso de ingreso para administradores: código, dispositivo de confianza, aviso de ingreso ([[S02-Acceso-y-Permisos]]) | T-201 | RF-AUT-08; dispositivo nuevo pide código; el recordado no, durante 30 días |
| T-218 | 2 | Confirmación de contraseña en acciones sensibles; regla del último administrador | T-201 | Exportar tras 10 min pide contraseña; no se puede desactivar al último administrador |
| T-219 | 2 | Comando de acceso de emergencia `admin:crear` | T-205 | Solo corre en el servidor; queda en auditoría |
| T-336 | 3a | Cifrado del motivo de consulta con versión de llave | T-303 | En la base de datos el motivo es ilegible; el panel lo muestra |
| T-332 | 3b | Avisos de entrega de Resend: firma, rebotes, aviso en el panel | T-307 | RF-COR-12; firma inválida → 401; un rebote se ve en el detalle de la cita |
| T-333 | 3b | Respaldo de envío por Gmail *(D, sujeto a P-22)* | T-321 | Con Resend en corte, el correo de cita sale por Gmail y queda marcado |
| T-334 | 3b | Calendario compartido de Google, nivel 1, con reconciliación diaria *(D, sujeto a P-22)* | T-321 | RF-ADM-15; autorizar crea el evento sin datos del paciente; cancelar lo borra |
| T-335 | 3b | Panel: correos de cada cita, aviso de trabajos fallidos, botón reintentar | T-321 | Un trabajo fallido se ve y se puede reintentar |
| T-513 | 5 | Medición de uso: script, `POST /api/medir`, exclusiones, respeto de "no rastrear" ([[S07-Medicion-de-Uso]]) | T-014 | Los eventos llegan a Loki; con "no rastrear" activo no llega ninguno; nada en `/ingresar` ni en el panel |
| ~~T-514~~ | 5 | *(Descartado)* Tableros de Grafana y alertas | — | Descartado junto con Grafana |
| T-515 | 5 | Mantenimiento: inventario de secretos, bitácora, recordatorios, **segunda persona con acceso** ([[S08-Mantenimiento]]) | — | La segunda persona hace sola el simulacro de restauración |

## Resumen de carga

| Fase | Semanas | A | B | C | Total |
|------|---------|---|---|---|-------|
| 0 | 1 | 4 | 5 | 5 | 13 |
| 1 | 2–3 | 11 | 1 | 1 | 13 |
| 2 | 4–5 | 3 | 8 | 6 | 16 |
| 3a | 6–7 | 4 | 8 | 6 | 17 |
| 3b | 8 | 1 | 9 | 5 | 11 |
| 4 | 9 | 3 | 3 | 2 | 8 |
| 5 | 10 | 6 | 4 | 5 | 12 |
| 6 | 11 | 3 | 4 | 7 | 8 |
| Servidor y observación | repartidas | — | 14 | — | 14 |
| **Total** | **11** | | | | **112** |

> **Atención a la carga:** con el reparto actual, quien lleva servidor y despliegue tiene además el diseño. En las fases 2, 3a y 3b concentra la mayor parte del trabajo y es dueño de todo el camino crítico. Ver la advertencia en [[06-Division-del-Trabajo]].

Las tareas compartidas cuentan para cada rol que participa. La fase 1 carga a A y la 3 a B: por eso A diseña los paneles durante la fase 1 y B adelanta contratos (T-112, T-216) antes de cada fase.

## Camino crítico

```
T-002 → T-006 → T-009 → T-201 → T-216 → T-301 → T-303 → T-304 → T-307 → T-317
```

Si algo de esta cadena se atrasa, se atrasa el lanzamiento. Todo lo demás tiene holgura.
