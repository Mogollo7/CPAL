---
tags: [capl, servidor, servicios-externos]
---

# S04 · Servicios externos

Volver a [[S00-Servidor-Inicio]]. Protocolo para todo lo que el sistema habla con el mundo de afuera: **Resend**, **Gmail** y **Google Calendar**.

## Protocolo común

Aplica a cualquier servicio externo, presente o futuro.

| # | Regla | Detalle |
|---|-------|---------|
| 1 | **Nunca dentro de una transacción ni de la petición del usuario** | Toda llamada externa sale de la cola ([[S05-Colas-y-Tareas]]). La persona recibe su confirmación aunque el servicio esté caído |
| 2 | **Un adaptador por servicio** | Un archivo en `servidor/externos/` por servicio. El resto del código no conoce a Resend ni a Google: llama a `enviarCorreo()` o `publicarEnCalendario()` |
| 3 | **Tiempo límite** | 10 segundos por llamada; pasado eso, cuenta como fallo |
| 4 | **Reintentos con espera creciente** | 1 min, 5 min, 30 min, 2 h, 12 h; al quinto fallo, el trabajo queda `FALLIDO` y se avisa |
| 5 | **Idempotencia** | Cada trabajo lleva una llave única; repetirlo no duplica el correo ni el evento |
| 6 | **Distinguir fallos** | Temporal (red, 429, 5xx) → reintentar. Permanente (dirección inválida, 4xx de datos) → no reintentar, marcar y avisar |
| 7 | **Respetar límites** | Si el servicio responde "demasiadas peticiones", se espera lo que indique |
| 8 | **Corte automático** | Tras 5 fallos seguidos de un mismo servicio, se deja de intentar durante 10 minutos y los trabajos esperan |
| 9 | **Mínimo de datos** | A cada servicio se le envía solo lo imprescindible; nunca el motivo de consulta |
| 10 | **Secretos con alcance mínimo** | Una llave por entorno, con los permisos justos ([[S01-Seguridad]]) |
| 11 | **Todo queda registrado** | Servicio, operación, resultado y duración; nunca el contenido ([[S06-Observabilidad]]) |
| 12 | **Lo que entra se verifica** | Los avisos que el servicio envía de vuelta se aceptan solo con firma válida |
| 13 | **Apagable** | Cada integración opcional tiene un interruptor: si su variable está vacía, el sistema funciona sin ella |
| 14 | **En pruebas, nada real** | Correos desviados; calendario de pruebas distinto al real |

## Mapa de integraciones

| Servicio | Para qué | Dirección | Obligatorio | Si falla |
|----------|----------|-----------|-------------|----------|
| **Resend** | Enviar todos los correos | Sale; y recibe avisos de entrega | Sí | Se reintenta; luego sale por Gmail |
| **Gmail** | Buzón de respuestas del CAPL · respaldo de envío | Sale | Buzón sí; respaldo opcional | El correo queda en cola |
| **Google Calendar** | Agenda compartida del CAPL con las citas autorizadas | Sale | Opcional | La cita no se ve en el calendario; el panel sigue siendo la fuente |
| Monitor externo | Avisar si el sitio cae | Entra (consulta `/api/salud`) | Sí | — |

**La base de datos es siempre la fuente de verdad.** Correo y calendario son copias informativas: si difieren, manda la base de datos.

---

## Resend

| Aspecto | Norma |
|---------|-------|
| Uso | Único canal principal de envío; 14 plantillas de [[E06-Correos]] |
| Dominio | Verificado con SPF, DKIM y DMARC. DMARC empieza en modo de solo informe y sube a cuarentena tras dos semanas sin incidencias |
| Llave | Una por entorno, con permiso **solo de envío** y restringida al dominio del proyecto |
| Remitente | `CAPL <citas@dominio>`; respuestas a `CORREO_RESPUESTA` |
| Llave de idempotencia | El identificador del trabajo, enviado en cada petición |
| Etiquetas | Cada correo lleva plantilla y entorno, para filtrar en el panel de Resend. **Nunca** el código de la cita ni datos de la persona |
| Seguimiento | Apertura y clics **desactivados**: no se rastrea a quien pide ayuda psicológica |
| Límite del plan | Tope diario y mensual (plan gratuito); se maneja con **rotación automática de API keys** (ver abajo) |

### Rotación y respaldo automático de API Keys de Resend

Para evitar que el sistema se quede sin enviar correos si se agota la cuota gratuita de una cuenta (o una cuenta de Google vinculada a Resend):

1. **Configuración múltiple:** Se configuran en las variables de entorno una lista de llaves ordenadas por prioridad:  
   `RESEND_API_KEYS="re_principal_...,re_respaldo1_...,re_respaldo2_..."`
2. **Detección de cuota agotada:** Si Resend responde con error `429 Too Many Requests`, `daily_quota_exceeded` o `rate_limit_exceeded`:
   - El sistema captura el error al instante.
   - Marca la llave actual como **agotada** temporalmente.
   - Pasa automáticamente a la **siguiente API Key** de respaldo y reintenta el envío de inmediato.
   - Registra en los logs un aviso: `[CORREO] Cuota agotada en cuenta Resend actual. Rotando automáticamente a API key de respaldo`.
3. **Persistencia temporal:** Durante las siguientes 24 horas, los nuevos correos se envían directamente con la llave de respaldo activa sin perder tiempo rebotando en la primera. Al día siguiente (reinicio del ciclo diario de Resend), vuelve a intentar con la principal.

### Avisos de entrega (webhook)

Resend avisa al sistema qué pasó con cada correo en `POST /api/webhooks/resend`.

| Regla | Detalle |
|-------|---------|
| Verificación | Firma comprobada con `RESEND_WEBHOOK_SECRET`; sin firma válida se responde 401 y se registra |
| Tolerancia | Se rechazan avisos con más de 5 minutos de antigüedad; un aviso repetido se ignora |
| Eventos que se usan | Entregado · rebotado · marcado como no deseado |
| Rebote permanente | El trabajo se marca; si era de una cita, el panel muestra **"No pudimos entregar el correo a esta persona"** para que administración la contacte por teléfono |
| No deseado | No se le vuelven a enviar correos que no sean de una cita activa suya |
| Respuesta | Rápida y siempre 200 si la firma es válida; el procesamiento va a la cola |

---

## Gmail

Dos usos distintos; no hay lectura automática del buzón.

### 1. Buzón de respuestas (obligatorio, sin integración)

El correo propio del CAPL es el `Reply-To` de todos los mensajes y el destino de los avisos a administración. El sistema **no lee** ese buzón: lo atienden las monitoras. No requiere llaves ni permisos.

### 2. Respaldo de envío (opcional)

Si Resend falla de forma sostenida, los correos salen por Gmail para que nadie se quede sin su confirmación.

| Aspecto | Norma |
|---------|-------|
| Cuándo entra | Cuando el corte automático de Resend está activo, o un trabajo de correo agotó sus reintentos con fallo temporal |
| Cómo | SMTP de Gmail (`smtp.gmail.com`, puerto 587, STARTTLS) con una **contraseña de aplicación** de una cuenta dedicada |
| Cuenta | Una cuenta exclusiva para esto, con verificación en dos pasos; **no** la cuenta personal de nadie ni el buzón principal del CAPL |
| Límite | Gmail limita los envíos diarios; el respaldo se detiene al llegar a 200 por día y alerta |
| Qué se envía | Solo correos de cita (recibida, autorizada, cancelada, recordatorio) y de acceso. Los avisos internos esperan a Resend |
| Remitente | El de la cuenta de respaldo, con el mismo `Reply-To`. El texto no cambia |
| Interruptor | `GMAIL_USUARIO` vacío = sin respaldo |
| Registro | Cada envío por respaldo queda marcado; el tablero muestra cuántos salieron por esta vía |

Riesgos a verificar antes de activarlo (P-22): las cuentas institucionales pueden tener desactivadas las contraseñas de aplicación, y un remitente distinto del dominio verificado es más propenso a caer en no deseado. Si no es viable, el respaldo se omite y el sistema solo reintenta por Resend.

---

## Google Calendar

Tres niveles posibles; se adopta el **nivel 1**.

| Nivel | Qué es | Estado |
|-------|--------|--------|
| 0 | Archivo `.ics` y enlace "Añadir a Google Calendar" en el correo | Ya aprobado (RF-COR-11); no necesita conexión |
| **1** | **Un calendario compartido del CAPL donde el sistema escribe cada cita autorizada** | **Adoptado (PR-24)** |
| 2 | Sincronización en ambos sentidos con el calendario personal de cada psicólogo | No aprobado (PR-21): exige que cada persona conceda permisos y un proceso de verificación con Google |

### Nivel 1

| Aspecto | Norma |
|---------|-------|
| Sentido | **Solo del sistema hacia el calendario.** Lo que alguien cambie a mano en el calendario no afecta al sistema y se sobrescribe |
| Calendario | Uno, creado por el CAPL ("Citas CAPL"), compartido con una **cuenta de servicio** con permiso de modificar eventos. Monitoras y psicólogos se suscriben para verlo |
| Autenticación | Cuenta de servicio de Google; su llave vive en `GOOGLE_CREDENCIALES`. Alcance: solo eventos de calendario |
| Qué se escribe | Título: `Cita CAPL · {código}`. Hora de inicio y fin. Invitado: ninguno |
| **Qué no se escribe** | Nombre del paciente, documento, contacto, motivo ni servicio. Quien necesite el detalle abre el panel con el código |
| Color | Uno por psicólogo, para leer la agenda de un vistazo |
| Cuándo | Cita `AUTORIZADA` → crear evento. Cancelada, reprogramada o reasignada → borrar o mover el evento |
| Vínculo | El identificador del evento se guarda en la cita (`calendarioEventoId`) |
| Idempotencia | El identificador del evento se deriva del identificador de la cita: crear dos veces no duplica |
| Si falla | La cita queda igual de válida; el trabajo se reintenta. El panel **no** depende del calendario |
| Reconciliación | Una vez al día, la tarea compara las citas autorizadas de los próximos 30 días con el calendario y corrige diferencias |
| Interruptor | `GOOGLE_CALENDAR_ID` vacío = integración apagada |
| Pruebas | Un calendario aparte ("Citas CAPL · pruebas") |

Riesgo a verificar (P-22): algunas organizaciones no permiten compartir calendarios con cuentas externas, y una cuenta de servicio lo es. Si la universidad lo bloquea, el calendario se crea en una cuenta de Google del proyecto y se comparte **hacia** las personas del CAPL.

---

## Añadir un servicio nuevo

Antes de conectar cualquier otro servicio, responder por escrito en el PR:

- [ ] ¿Qué problema concreto resuelve que hoy no esté resuelto?
- [ ] ¿Qué datos personales recibe? ¿Están en la política de datos?
- [ ] ¿Qué pasa con una cita si el servicio está caído una semana?
- [ ] ¿Tiene interruptor y funciona el sistema sin él?
- [ ] ¿Quién renueva sus llaves y cuándo? (se añade a [[S08-Mantenimiento]])
- [ ] ¿Cumple las 14 reglas del protocolo común?
