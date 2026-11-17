---
tags: [capl, operacion, correos, checklist, entrega]
---

# Lista de verificación de entrega de correos (T-512)

Volver a [[00-Inicio]] · Tarea de referencia: [[E08-Backlog]] (`T-512`).  
Normativa técnica y plantillas: [[E06-Correos]], [[03-Requisitos-No-Funcionales]] (`RNF-COR-01` a `RNF-COR-04`, `RNF-PRI-05`, `RNF-PRI-10`) y [[S04-Servicios-Externos]].

---

## 1. Criterios generales antes de probar

Cada una de las 14 plantillas transaccionales del sistema debe verificarse en buzones reales de los tres entornos de correo principales: **Gmail** (web y aplicación móvil), **Outlook** (web y escritorio) y **Buzón institucional** (`@unilasallista.edu.co`).

Para dar por aprobada una plantilla, debe cumplir los siguientes puntos invariables:
1. **Entrada directa a la bandeja principal:** No cae en carpeta de correo no deseado (Spam) gracias a la verificación de registros SPF, DKIM y DMARC del dominio.
2. **Sin datos sensibles del paciente:** No incluye motivo de consulta, número de documento de identidad ni edad en el cuerpo del correo ni en el asunto (`RNF-PRI-05`).
3. **Identidad visual:** Cabecera con logo y casa amarilla, tarjeta central blanca, tipografía legible y pie con dirección física, contacto y la frase *"Si necesitas ayuda ahora mismo"* con enlace directo a `/ayuda-inmediata`.
4. **Un solo botón principal:** Estilizado, claro, con verbo y objeto, que apunta a la URL del entorno correspondiente (`URL_SITIO`).
5. **Versión de texto plano (`text/plain`):** Se lee de forma ordenada y completa si el cliente de correo desactiva las imágenes o el código HTML.
6. **Formato de fecha y hora:** En español de Colombia (ejemplo: *"martes 24 de noviembre, 2:30 p. m."*).
7. **Archivos de calendario (`.ics`):** Generados en formato estándar UTC sin exponer datos clínicos en el resumen (`SUMMARY: "Cita en el CAPL"`).

---

## 2. Matriz de verificación por plantilla

Marca con `[x]` cada comprobación realizada.

### Bloque A: Citas y solicitudes (Pacientes y Administración)

| Plantilla | Destino | Asunto esperado | Gmail (Web/App) | Outlook (Web/PC) | Buzón Institucional | Sin datos sensibles | Botón / Link OK | Texto plano OK | Aprobado |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `solicitud-recibida` | Paciente | *Recibimos tu solicitud de cita* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `nueva-solicitud` | Admin | *Nueva solicitud de cita por revisar* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cita-autorizada` | Paciente | *Tu cita ha sido autorizada* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cita-no-autorizada` | Paciente | *No pudimos confirmar tu cita* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cita-vencida` | Paciente | *No alcanzamos a confirmar tu cita* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cita-cancelada` | Paciente | *Tu cita fue cancelada* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `recordatorio` | Paciente | *Recordatorio: tu cita es mañana* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Bloque B: Agenda de psicólogos en formación

| Plantilla | Destino | Asunto esperado | Gmail (Web/App) | Outlook (Web/PC) | Buzón Institucional | Sin datos sensibles | Botón / Link OK | Texto plano OK | Aprobado |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `cita-nueva-psicologo` | Psicólogo | *Tienes una nueva cita* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cita-cancelada-psicologo` | Psicólogo | *Se canceló una cita de tu agenda* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Bloque C: Cuentas, seguridad y eventos

| Plantilla | Destino | Asunto esperado | Gmail (Web/App) | Outlook (Web/PC) | Buzón Institucional | Sin datos sensibles | Botón / Link OK | Texto plano OK | Aprobado |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `invitacion` | Psicólogo/Admin | *Te damos la bienvenida al equipo del CAPL* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `recuperar-clave` | Usuario | *Crea una nueva contraseña* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `codigo-ingreso` | Admin | *Tu código de ingreso al CAPL* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `aviso-ingreso` | Admin | *Nuevo ingreso a tu cuenta del CAPL* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `inscripcion-evento` | Asistente | *Tu inscripción a {evento}* | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 3. Verificaciones técnicas particulares

| Aspecto técnico | Qué verificar | Estado |
|---|---|:---:|
| **Remitente y respuesta** | Remitente configurado con el dominio oficial (`citas@dominio`); encabezado `Reply-To` configurado al correo de atención del CAPL (`capl@unilasallista.edu.co`). | [ ] |
| **Calificación mail-tester** | Puntuación obtenida en prueba de entregabilidad (`mail-tester.com` o similar): meta ≥ 9/10 (`RNF-COR-01`). Puntuación: `[POR COMPLETAR]`. | [ ] |
| **Archivos .ics** | En `cita-autorizada` e `inscripcion-evento`, el archivo adjunto se abre nativamente en Apple Calendar, Google Calendar y Outlook Desktop sin errores de zona horaria. | [ ] |
| **Enlaces rápidos a calendario** | Botones de *Google Calendar* y *Outlook Web* abren la cita con fecha exacta, duración y ubicación en la casa amarilla del CAPL sin exponer motivo ni datos del paciente. | [ ] |
| **Envío instantáneo de 2FA** | La plantilla `codigo-ingreso` no pasa por la cola con espera programada: sale al instante y el código se visualiza en tamaño destacado. | [ ] |
| **Avisos de rebote (Webhooks)** | Provocar un envío a un buzón inexistente en pruebas para confirmar que Resend reporta el rebote y se visualiza en el detalle de la cita (`RF-COR-12`). | [ ] |
| **Seguimiento desactivado** | Los parámetros de seguimiento de apertura (*open tracking*) y seguimiento de clics (*click tracking*) están deshabilitados en Resend por privacidad (`RNF-PRI-08`). | [ ] |

---

## 4. Registro de incidencias encontradas durante la prueba

Si una plantilla se deforma, recorta botones o cae en la carpeta de correo no deseado, registrar el detalle aquí:

| Plantilla | Cliente de correo | Problema detectado | Solución aplicada | Re-probado (Sí/No) |
|---|---|---|---|:---:|
| [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [ ] |
| [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [ ] |
| [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [ ] |

---

## 5. Cierre y visto bueno de la tarea T-512

- **Responsable de la verificación técnica (Rol B):** `[POR COMPLETAR]`
- **Fecha de realización:** `[POR COMPLETAR]`
- **Visto bueno de textos por el CAPL:** `[ ] Aprobado por Coordinación CAPL`
- **Resultado final:** `[ ] Las 14 plantillas cumplen los requisitos de entrega y renderizado.`