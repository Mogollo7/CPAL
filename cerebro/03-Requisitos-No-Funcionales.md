---
tags: [capl, requisitos, rnf]
---

# 03 · Requisitos no funcionales

Volver a [[00-Inicio]]. Cada RNF trae **cómo se verifica**: si no se puede comprobar, no es un requisito.

## Seguridad (SEG)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-SEG-01 | Todo el sitio por HTTPS; HTTP redirige | Prueba con `curl -I http://…` |
| RNF-SEG-02 | Contraseñas con hash fuerte (argon2 o bcrypt); nunca en texto plano ni en logs | Revisión de código + inspección de BD |
| RNF-SEG-03 | Autorización por rol comprobada **en el servidor** en cada ruta y acción del panel | Prueba: psicólogo intenta abrir ruta de admin → 403 |
| RNF-SEG-04 | Un psicólogo solo accede a datos de sus propias citas | Prueba con dos cuentas |
| RNF-SEG-05 | Toda entrada se valida en el servidor (esquemas), no solo en el navegador | Envío directo a la API con datos inválidos |
| RNF-SEG-06 | Límite de intentos en login, recuperación y formularios públicos | 10 envíos seguidos → bloqueo temporal |
| RNF-SEG-07 | Anti-spam en formularios públicos (campo trampa + límite por IP) | Prueba automatizada |
| RNF-SEG-08 | Ningún secreto en el repositorio; `.env` fuera de git, `.env.example` dentro | Revisión de PR + escaneo de secretos de GitHub |
| RNF-SEG-09 | Enlaces de cancelación / invitación / recuperación: token aleatorio con caducidad, que **se invalida al completar la acción** (crear contraseña, cancelar). Mientras esté vigente y sin usar puede abrirse varias veces | Completar la acción y reabrir el enlace → rechazado; enlace vencido → rechazado |
| RNF-SEG-10 | Cookies de sesión `HttpOnly`, `Secure`, `SameSite` | Inspección en navegador |
| RNF-SEG-11 | Los administradores ingresan con **segundo paso** (código al correo) en dispositivos nuevos, y confirman su contraseña en acciones sensibles ([[S02-Acceso-y-Permisos]]) | Ingreso desde otro navegador pide código |
| RNF-SEG-12 | Los avisos entrantes de servicios externos se aceptan solo con firma válida | Petición sin firma → 401 |
| RNF-SEG-13 | La aplicación se conecta a la base de datos con un usuario que no puede alterar el esquema | Intento de `ALTER` con ese usuario falla |
| RNF-SEG-14 | Cabeceras de seguridad y política de contenido que solo admite recursos propios ([[S01-Seguridad]]) | Comprobación con herramienta en línea |

El detalle completo de amenazas y medidas está en [[S01-Seguridad]].

## Observación (OBS)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-OBS-01 | Todo evento relevante se registra en formato estructurado, **sin datos personales** ([[S06-Observabilidad]]) | Prueba automática que busca datos sembrados en los registros |
| RNF-OBS-02 | Registros centralizados en Loki, 30 días de retención, consultables en Grafana con ingreso | Abrir un tablero |
| RNF-OBS-03 | Alertas automáticas por correo ante caída, cola parada, correos sin salir y errores altos | Provocar cada una en pruebas |
| RNF-OBS-04 | La aplicación funciona aunque Loki o Grafana estén caídos | Detener ambos y pedir una cita |

## Privacidad y datos personales (PRI)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-PRI-01 | Se recoge **solo lo necesario para agendar**. Sin historia clínica, diagnósticos ni notas de sesión | Revisión del modelo de datos |
| RNF-PRI-02 | Consentimiento explícito antes de enviar cualquier formulario; se guarda fecha y versión | Registro en BD |
| RNF-PRI-03 | Política de tratamiento de datos publicada y aprobada por la universidad | Documento firmado |
| RNF-PRI-04 | Para menores: datos y autorización del acudiente | Prueba del formulario |
| RNF-PRI-05 | Los correos no incluyen el motivo de consulta ni datos sensibles | Revisión de plantillas |
| RNF-PRI-06 | Plazo de conservación definido; pasado el plazo las citas se anonimizan | Tarea programada + prueba |
| RNF-PRI-07 | El titular puede pedir consultar, corregir o eliminar sus datos (canal de contacto visible) | Texto en la política |
| RNF-PRI-08 | **Sin analítica de terceros.** La medición de uso es propia, anónima y agregada: sin cookies, sin identificadores guardados, sin grabar sesiones ni contenido de campos ([[S07-Medicion-de-Uso]]) | Inspección de red: ninguna petición a otro dominio; con "no rastrear" activo, ninguna a `/api/medir` |
| RNF-PRI-09 | El motivo de consulta se guarda **cifrado** en la base de datos | Inspección de la tabla |
| RNF-PRI-10 | A servicios externos (correo, calendario) nunca llega el motivo ni datos innecesarios del paciente | Revisión de plantillas y de eventos de calendario |

## Accesibilidad y usabilidad (ACC)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-ACC-01 | WCAG 2.1 nivel AA: contraste, foco visible, navegación por teclado, etiquetas en formularios | Lighthouse ≥ 90 + recorrido solo con teclado |
| RNF-ACC-02 | Diseño **móvil primero**; usable desde 360 px | Prueba en móvil real |
| RNF-ACC-03 | Lenguaje claro, cercano y no estigmatizante; español de Colombia | Revisión del CAPL |
| RNF-ACC-04 | Pedir cita en máximo 5 pasos y menos de 3 minutos | Prueba con 3 personas ajenas al proyecto |
| RNF-ACC-05 | Los mensajes de error dicen qué pasó y cómo resolverlo | Revisión de formularios |
| RNF-ACC-06 | La ayuda de emergencia está a **un toque** desde cualquier pantalla | Recorrido del sitio |
| RNF-ACC-07 | Tamaños de texto y espaciado salen de **una sola escala basada en la proporción áurea (1,618)**, fluida entre móvil y escritorio. Sin controles de tamaño para el usuario. Ningún texto se desborda ni se corta | Sin desplazamiento horizontal de 320 px a 1920 px y con zoom del navegador al 200 % |

## Rendimiento y disponibilidad (REN)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-REN-01 | Páginas públicas cargan en < 2,5 s en 4G (LCP) | Lighthouse móvil |
| RNF-REN-02 | Imágenes optimizadas y con carga diferida | Lighthouse |
| RNF-REN-03 | La guía de emergencias es estática: funciona aunque la base de datos esté caída | Apagar la BD y abrir la página |
| RNF-REN-04 | Copia de seguridad diaria de la BD, 14 días de retención, **restauración probada** | Simulacro de restauración en fase 6 |
| RNF-REN-05 | Si falla el envío de un correo, la cita se guarda igual y el envío se reintenta | Prueba con clave de Resend inválida |
| RNF-REN-06 | Monitor externo que avisa si el sitio se cae | Alerta de prueba |
| RNF-REN-07 | **Recuperación automática:** si la aplicación o la base de datos se caen o el servidor se reinicia, todo vuelve a levantar solo, sin que nadie entre al servidor | Matar el proceso y reiniciar el servidor → el sitio vuelve en < 2 min |
| RNF-REN-08 | **Degradación controlada:** con la base de datos caída, las páginas informativas y de emergencias siguen visibles y el formulario muestra "intenta más tarde" con los contactos del CAPL, nunca una pantalla de error | Apagar la BD y recorrer el sitio |
| RNF-REN-09 | **Cero tareas manuales periódicas:** certificados HTTPS, copias de seguridad, limpieza de registros y parches de seguridad del sistema se hacen solos | Revisión de `infra/` |

## Fiabilidad de datos (DAT)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-DAT-01 | La no-duplicidad de horario se garantiza con una **restricción en la base de datos**, no solo con código | Prueba de dos envíos simultáneos |
| RNF-DAT-02 | Fechas guardadas en UTC y mostradas siempre en `America/Bogota` | Prueba unitaria |
| RNF-DAT-03 | Los psicólogos se desactivan, no se borran; las citas conservan su historial | Prueba en panel |
| RNF-DAT-04 | Cambios de esquema solo mediante migraciones versionadas | Revisión de PR |

## Correo (COR)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-COR-01 | Dominio verificado en Resend con SPF, DKIM y DMARC | Panel de Resend + mail-tester ≥ 9/10 |
| RNF-COR-02 | Remitente reconocible (`citas@dominio`) y `Reply-To` a un buzón que alguien lea | Envío de prueba |
| RNF-COR-03 | Correos legibles en móvil y con versión de texto plano | Prueba en Gmail y Outlook |
| RNF-COR-04 | En pruebas no se envía correo a personas reales | Variable de entorno que redirige destinatarios |

## Mantenibilidad (MAN)

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-MAN-01 | Un solo repositorio, un solo lenguaje (TypeScript), formateo y lint automáticos | CI |
| RNF-MAN-02 | `README` con cómo levantar el proyecto en menos de 10 minutos | Lo prueba un integrante en limpio |
| RNF-MAN-03 | Pruebas automáticas de la lógica crítica: cálculo de cupos, transición de estados, permisos | CI |
| RNF-MAN-04 | Despliegue reproducible con un comando | Fase 0 |
| RNF-MAN-05 | Manual corto para administración (crear psicólogo, autorizar cita, crear evento) | Entrega fase 6 |
| RNF-MAN-06 | El CAPL puede operar el sistema sin depender del equipo de desarrollo | Capacitación + manual |

## Compatibilidad y SEO

| ID | Requisito | Verificación |
|----|-----------|--------------|
| RNF-COM-01 | Últimas 2 versiones de Chrome, Safari, Firefox y Edge; Android e iOS | Prueba manual |
| RNF-SEO-01 | Títulos, descripciones, Open Graph y `sitemap.xml` en páginas públicas | Lighthouse SEO ≥ 90 |
| RNF-SEO-02 | El panel no se indexa (`noindex`) | Inspección |
