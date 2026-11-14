---
tags: [capl, especificacion, correos]
---

# E06 · Correos

Volver a [[E00-Especificacion-Inicio]]. Código: rol B · diseño y textos: rol A · aprobación de textos: CAPL. Normas visuales en [[N06-Componentes-y-Estados]]; tono en [[N08-Lenguaje-y-Tono]].

## Reglas comunes

- Remitente `CORREO_REMITENTE`; las respuestas llegan a `CORREO_RESPUESTA` (correo propio del CAPL).
- Una plantilla base: logo y casa amarilla arriba, tarjeta blanca, **un solo botón**, pie con dirección, contacto y la línea *"Si necesitas ayuda ahora mismo"* con enlace a `/ayuda-inmediata`.
- Cada correo tiene versión HTML y de texto plano.
- **Nunca** incluyen motivo de consulta, documento ni edad (RNF-PRI-05).
- Fechas en el formato de [[N08-Lenguaje-y-Tono]]: "martes 24 de noviembre, 2:30 p. m.".
- Todos los enlaces se arman con `URL_SITIO`.
- Se encolan en `Trabajo` dentro de la misma transacción que el hecho que los origina ([[S05-Colas-y-Tareas]]).
- Canal principal Resend; respaldo por Gmail y avisos de rebote según [[S04-Servicios-Externos]]. Seguimiento de apertura y clics **desactivado**.
- En `pruebas`, todos se desvían a `CORREO_REDIRIGIR_A` y el asunto lleva el prefijo `[PRUEBA → destinatario original]`.

## Plantillas

| Identificador | Para | Se envía cuando | Asunto | Botón | RF |
|---------------|------|-----------------|--------|-------|----|
| `solicitud-recibida` | Solicitante | Se crea una cita `PENDIENTE` | Recibimos tu solicitud de cita | Ver mi solicitud | COR-01 |
| `nueva-solicitud` | Administración | Se crea una cita `PENDIENTE` | Nueva solicitud de cita por revisar | Revisar en el panel | COR-02 |
| `cita-autorizada` | Solicitante | La cita pasa a `AUTORIZADA` (o nace así) | Tu cita ha sido autorizada | Ver mi cita | COR-03, 11 |
| `cita-no-autorizada` | Solicitante | La cita pasa a `RECHAZADA` | No pudimos confirmar tu cita | Elegir otro horario | COR-04 |
| `cita-vencida` | Solicitante | La cita pasa a `VENCIDA` | No alcanzamos a confirmar tu cita | Elegir otro horario | COR-04, CIT-12 |
| `cita-cancelada` | Solicitante | La cita pasa a `CANCELADA` | Tu cita fue cancelada | Pedir otra cita | COR-05 |
| `cita-cancelada-psicologo` | Psicólogo | Se cancela una cita que estaba `AUTORIZADA` | Se canceló una cita de tu agenda | Ver mi agenda | COR-05 |
| `cita-nueva-psicologo` | Psicólogo | La cita pasa a `AUTORIZADA` | Tienes una nueva cita | Ver mi agenda | COR-06 |
| `recordatorio` | Solicitante | 24 h antes de una cita `AUTORIZADA` | Recordatorio: tu cita es mañana | Ver mi cita | COR-10 |
| `invitacion` | Psicólogo o admin nuevo | Se crea su cuenta o se reenvía | Te damos la bienvenida al equipo del CAPL | Crear mi contraseña | COR-07 |
| `recuperar-clave` | Usuario | Solicita recuperar | Crea una nueva contraseña | Crear contraseña | COR-08 |
| `inscripcion-evento` | Inscrito | Se inscribe | Tu inscripción a {evento} | Ver el evento | COR-09 |
| `codigo-ingreso` | Administrador | Ingresa desde un dispositivo nuevo | Tu código de ingreso al CAPL | *(sin botón: muestra el código)* | AUT-08 |
| `aviso-ingreso` | Administrador | Su cuenta entró desde un dispositivo nuevo | Nuevo ingreso a tu cuenta del CAPL | Cerrar mis sesiones | AUT-08 |

## Contenido de cada una

### `solicitud-recibida`

Variables: nombre, servicio, fecha y hora, psicólogo, código, plazo de respuesta, enlace de gestión.

> Hola, {nombre}. Recibimos tu solicitud de cita y **está en proceso de autorización**.
> {servicio} · {fecha y hora} · con {psicólogo}
> Te escribiremos a este correo en máximo {plazo} horas para confirmarla. Código de tu solicitud: {código}.

Pie adicional: si cambian tus planes, puedes cancelar o cambiar el horario desde el botón.

Si la cita viene de una reprogramación, el primer párrafo dice: *"Recibimos el cambio de horario de tu cita."*

### `nueva-solicitud`

Variables: código, servicio, fecha y hora, psicólogo, vence en. **Sin datos del paciente**: se ven en el panel.

### `cita-autorizada`

Variables: nombre, servicio, fecha y hora, duración, psicólogo, dirección, enlace de gestión, enlace "Añadir a Google Calendar".

> Hola, {nombre}. **Tu cita ha sido autorizada.**
> {fecha y hora} · {duración} · con {psicólogo}
> Dónde: casa amarilla del CAPL, {dirección}.
> Qué llevar: tu documento de identidad. Llega unos minutos antes.

Adjunto: archivo `.ics` (abajo). Pie adicional: cómo cancelar o reprogramar y hasta cuándo.

### `cita-no-autorizada` y `cita-vencida`

Variables: nombre, fecha y hora, motivo (solo en rechazo), enlace a `/pedir-cita`.

Tono: nunca "rechazada". En el rechazo se incluye el motivo escrito por administración; en la vencida: *"No alcanzamos a confirmar este horario a tiempo y lo sentimos."*

### `cita-cancelada`

Variables: nombre, fecha y hora, quién canceló (tú / el CAPL), motivo si canceló el CAPL.

### `cita-nueva-psicologo` y `cita-cancelada-psicologo`

Variables: nombre del psicólogo, servicio, fecha y hora, código. **Sin datos del paciente** en el correo: se consultan en el panel.

### `recordatorio`

Variables: nombre, fecha y hora, psicólogo, dirección, enlace de gestión.

> Hola, {nombre}. Te recordamos tu cita de **mañana, {fecha y hora}**, con {psicólogo}.
> Si no puedes asistir, cancela o cambia el horario desde el botón para que otra persona pueda usar ese espacio.

### `invitacion`

Variables: nombre, rol, enlace `/crear-clave/{token}`, vigencia en horas.

> Hola, {nombre}. Has sido invitado/a como {rol} del CAPL.
> Tu usuario es este correo. Crea tu contraseña para ingresar. El enlace funciona durante {horas} horas; si vence, puedes pedir otro desde la página de ingreso.

### `recuperar-clave`

Variables: nombre, enlace, vigencia. Incluye: *"Si no pediste esto, ignora este correo; tu contraseña no cambia."*

### `inscripcion-evento`

Variables: nombre, evento, fecha y hora, lugar o enlace, descripción breve, enlace al evento. Adjunto `.ics`.

### `codigo-ingreso` y `aviso-ingreso`

`codigo-ingreso`: el código de 6 dígitos en grande, su vigencia (10 minutos) y *"Si no fuiste tú, cambia tu contraseña."* Es el único correo que **no pasa por la espera de la cola**: se intenta al instante y, si falla, la pantalla ofrece reenviar.

`aviso-ingreso`: fecha, hora y navegador del ingreso; botón para cerrar todas las sesiones.

## Archivo de calendario (`.ics`)

Texto plano generado a mano (no requiere librería):

| Campo | Valor |
|-------|-------|
| `UID` | `{id de la cita}@{dominio}` |
| `DTSTART` / `DTEND` | En UTC |
| `SUMMARY` | "Cita en el CAPL" (sin el servicio, por privacidad en calendarios compartidos) |
| `LOCATION` | Dirección del CAPL |
| `DESCRIPTION` | Enlace de gestión de la cita |
| `VALARM` | Recordatorio 2 horas antes |

El archivo `.ics` es el estándar universal y es reconocido nativamente por **Microsoft Outlook** (escritorio y móvil) y **Apple Calendar**. Además, el correo puede incluir botones directos para **Google Calendar** y **Outlook Web / Office 365** con los mismos parámetros de fecha y lugar.

## Comprobaciones antes de dar por hecho un correo

- [ ] Se ve bien en Gmail y Outlook, en móvil y escritorio
- [ ] Se entiende sin imágenes y en texto plano
- [ ] El botón funciona con la dirección del entorno correcto
- [ ] No contiene datos sensibles
- [ ] Llega a un buzón institucional (RG-02)
- [ ] El texto fue aprobado por el CAPL
