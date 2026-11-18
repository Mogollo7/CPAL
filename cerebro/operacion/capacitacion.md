---
tags: [capl, operacion, capacitacion, manual, equipo]
---

# Plan y guion de capacitación: Monitoras y Psicólogos (T-606)

Volver a [[00-Inicio]] · Tarea de referencia: [[E08-Backlog]] (`T-606`, previa a `T-608`).  
Fundamentado estrictamente en: [[01-Contexto]], [[02-Requisitos-Funcionales]] (`RF-ADM-*`, `RF-PSI-*`, `RF-AUT-*`, `RF-CIT-*`), [[E04-Pantallas-y-Rutas]], [[E09-Flujos-de-Usuario]], [[03-Requisitos-No-Funcionales]] (`RNF-MAN-05`, `RNF-MAN-06`, `RNF-PRI-01`) y [[S08-Mantenimiento]].

> **Nota de alcance institucional:** Esta capacitación cubre exclusivamente las herramientas operativas construidas en la plataforma web del CAPL. El sistema gestiona citas, agendas y eventos informativos; **no almacena historia clínica ni notas de sesión** (`RNF-PRI-01`, decisión `D-05`), las cuales continúan bajo los protocolos físicos e institucionales de la universidad.

---

## 1. Ficha técnica de la sesión

- **Objetivo:** Entrenar a las monitoras del centro (rol Administrador) y a los psicólogos en formación (rol Psicólogo) para que operen de forma autónoma el nuevo sistema de citas sin depender del equipo técnico (`RNF-MAN-06`).
- **Modalidad:** Presencial o virtual (con demostración interactiva en proyector o pantalla compartida).
- **Entorno para la capacitación:** Servidor de pruebas (`{PRUEBAS}`).
- **Duración estimada:** 90 minutos (dividida en bloques especializados).
- **Material de apoyo:** 
  - Computador o teléfono con conexión a internet para cada asistente.
  - Correos institucionales (`@unilasallista.edu.co`) activos de los participantes.
  - Manual de administración rápida ([[S08-Mantenimiento]]).

---

## 2. Estructura y cronograma de la sesión

| Tiempo | Módulo | Destinatarios | Contenido central |
|---|---|---|---|
| **00 – 15 min** | **Módulo 1: Visión general del sistema** | Todos | Qué es el sistema, qué cambió frente a WhatsApp, cómo pide cita una persona y guía de emergencias. |
| **15 – 55 min** | **Módulo 2: Panel de Administración** | Monitoras | Bandeja de citas, autorizar/rechazar, gestión de psicólogos, bloqueos de fechas, exportación a Excel y ajustes. |
| **55 – 80 min** | **Módulo 3: Panel del Psicólogo** | Psicólogos | Activación de cuenta, foto y perfil, definir horario semanal de atención, ausencias puntuales y ver citas asignadas. |
| **80 – 90 min** | **Módulo 4: "Qué hacer si..." y dudas** | Todos | Enlaces vencidos, citas sin cupo, inasistencias y canales de soporte. |

---

## 3. Guion del facilitador paso a paso

---

### Módulo 1: Introducción y visión compartida (15 min) — *Todos*

#### 1.1 Contexto y qué hace la plataforma
- Explicar el cambio frente al esquema anterior: antes todo el agendamiento dependía de WhatsApp manual. Ahora el agendamiento se realiza en un formulario estructurado en línea con validación de disponibilidad y confirmaciones por correo (Resend).
- WhatsApp permanece únicamente como canal directo de contacto y dudas desde la página.
- **Principio de privacidad clave:** El sistema no pide diagnósticos ni guarda historias clínicas. Solo recoge los datos de contacto indispensables para agendar la cita en la casa amarilla (`RNF-PRI-01`).

#### 1.2 El recorrido de la persona que pide una cita (`/pedir-cita`)
Hacer una demostración rápida en pantalla de los 5 pasos que realiza el paciente:
1. **Paso 1 (Servicio):** Elige el servicio (ej. *Atención psicológica individual*, *Evaluación neuropsicológica*).
2. **Paso 2 (¿Para quién?):** Para mí, para otra persona o para un menor de edad (solicita acudiente).
3. **Paso 3 (Psicólogo y horario):** Escoge a un psicólogo en específico o la opción *"Cualquiera disponible"*, y selecciona fecha y hora en tiempo real.
4. **Paso 4 (Datos):** Nombre, documento, teléfono, correo institucional o personal, edad y motivo breve opcional.
5. **Paso 5 (Confirmación):** Acepta política de tratamiento de datos y envía. La cita queda en estado `PENDIENTE` y el paciente recibe el correo de recepción.
- **La guía de emergencias (`/ayuda-inmediata`):** Mostrar el botón permanente "Necesito ayuda ahora" y recalcar que el CAPL **no es un servicio de urgencias médicas** (`RF-PUB-08`). En crisis, la plataforma remite de inmediato a las líneas 123, 106 y a los códigos de emergencia correspondientes.

---

### Módulo 2: Operación para Monitoras / Administración (40 min) — *Monitoras*

#### 2.1 Ingreso seguro y verificación en dos pasos (`/ingresar`)
- Las monitoras ingresan con su correo institucional y su contraseña.
- **Segundo paso de seguridad (2FA · `RF-AUT-08`):** Al ingresar desde un computador o navegador nuevo, la pantalla solicita un código numérico de 6 dígitos enviado al correo institucional.
- Se puede marcar la casilla *"Recordar este dispositivo por 30 días"* en equipos de confianza de la oficina del CAPL.

#### 2.2 La bandeja de citas (`/panel/admin/citas`) — *El trabajo diario*
- Abre por defecto en la pestaña **"Pendientes"**.
- Demostración de filtros: por psicólogo, por rango de fechas, por servicio y por estado (`Pendientes`, `Autorizadas`, `Rechazadas`, `Canceladas`, `Vencidas`).
- Búsqueda rápida por código alfanumérico de la cita o por nombre de la persona.
- **Exportar a CSV (`RF-ADM-14`):** Mostrar el botón "Exportar a CSV", el cual descarga un archivo que abre directamente en Excel respetando acentos y tildes para generar estadísticas mensuales del centro.

#### 2.3 Detalle de una cita y toma de decisiones (`/panel/admin/citas/[id]`)
- Explicar la información en pantalla: datos del paciente, psicólogo asignado, servicio, fecha y hora, y plazo de vencimiento automático (48 horas).
- **Acción 1: Autorizar (`RF-ADM-04`):**
  - Al pulsar "Autorizar", el estado cambia a `AUTORIZADA`.
  - El sistema envía automáticamente el correo con el archivo de calendario `.ics` al paciente (`RF-COR-03`) y notifica al psicólogo correspondiente (`RF-COR-06`).
- **Acción 2: Rechazar (`RF-ADM-04`):**
  - Requiere escribir obligatoriamente un **motivo del rechazo** (ej. *"Horario no disponible por práctica docente"* o *"No cumple con el rango de atención del servicio"*).
  - El motivo se incluye con tono cálido en el correo al solicitante y el cupo se libera de inmediato en el formulario público.
- **Acción 3: Cancelar o reasignar (`RF-ADM-05`):**
  - Si el psicólogo tiene una eventualidad, la monitora puede mover la cita a otro psicólogo disponible o cancelarla notificando al usuario.
- **Acción 4: Marcar asistencia (`RF-ADM-10`):**
  - Una vez cumplida la fecha, se puede marcar la cita como *"Atendida"* o *"No asistió"*.
- **Avisos de rebote (`RF-COR-12`):**
  - Si el correo registrado por el usuario no existe o rebotó, aparecerá una alerta visible en el detalle de la cita para que la monitora pueda contactar a la persona por teléfono o WhatsApp.

#### 2.4 Gestión de Psicólogos (`/panel/admin/psicologos`)
- **Crear psicólogo (`RF-ADM-01`):** Botón "Nuevo psicólogo". Se ingresa nombre completo, correo institucional `@unilasallista.edu.co` y área (*Psicología* o *Neuropsicología*).
- **Estado inicial "Invitado":** Al crearlo, el psicólogo recibe un correo de bienvenida con un enlace temporal para crear su contraseña. No se inventan contraseñas provisionales.
- **Reenviar invitación (`RF-ADM-02`):** Si pasaron más de 48 horas y el psicólogo no creó su clave, la monitora puede entrar al detalle del psicólogo y pulsar "Reenviar invitación".
- **Desactivar psicólogo (`RF-ADM-02`):** Al finalizar el semestre de prácticas, se desactiva al psicólogo. Si tiene citas futuras programadas, el sistema avisa e impide la desactivación hasta que las citas sean reasignadas o gestionadas.

#### 2.5 Bloqueo de fechas y festivos (`/panel/admin/bloqueos`)
- Explicar que los **festivos de Colombia se calculan y bloquean automáticamente cada año** (`RF-ADM-13`), sin necesidad de cargarlos a mano.
- **Bloqueo manual (`RF-ADM-09`):** Si hay semana institucional, semana santa, vacaciones o jornadas académicas sin atención en la casa amarilla, la monitora crea un bloqueo seleccionando las fechas para cerrar la disponibilidad de todo el centro.

#### 2.6 Cartelera de eventos informativos (`/panel/admin/eventos`)
- Crear eventos públicos (charlas, talleres, inducciones): título, fecha, hora, lugar o enlace virtual, descripción breve e imagen (`RF-EVE-01`).
- Los eventos pasados se ocultan solos de la cartelera pública (`RF-EVE-06`).

#### 2.7 Configuración del centro (`/panel/admin/configuracion`)
- **Interruptor de auto-autorización (`RF-ADM-06`):** Permite activar o desactivar la confirmación automática directa. Si está encendido, la cita nace autorizada al enviarse; si está apagado (por defecto), requiere autorización manual de la monitora.
- Ajuste de horas de anticipación mínima para agendar (ej. mínimo 24 horas antes) y plazo de vencimiento de solicitudes pendientes.

---

### Módulo 3: Operación para Psicólogos en formación (25 min) — *Psicólogos*

#### 3.1 Invitación y creación de contraseña
- Cada psicólogo recibe en su buzón institucional el correo con el asunto *"Te damos la bienvenida al equipo del CAPL"* (`RF-COR-07`).
- Al abrir el botón "Crear mi contraseña", llega a `/crear-clave/[token]`.
- Define su contraseña segura y entra directamente a su panel.
- El enlace tiene vigencia de 24 a 48 horas; si vence, desde la pantalla `/ingresar` o `/recuperar-clave` puede solicitar uno nuevo escribiendo su correo.

#### 3.2 Completar perfil profesional (`/panel/psicologo/perfil`)
- Subir foto de perfil (el sistema la ajusta a 400 × 400 px con recorte circular).
- Redactar texto breve de presentación (enfoque, semestre o intereses formativos).
- Marcar los servicios que atiende (ej. atención individual adultos, orientación vocacional).
- Casilla de visibilidad en el directorio público de la página (`RF-PSI-07`).

#### 3.3 Configurar el horario semanal de atención (`/panel/psicologo/horario`) — *Imprescindible*
- **Regla de oro:** Un psicólogo **no ofrecerá cupos en la página web** hasta que defina sus bloques de atención en esta pantalla.
- Cómo agregar bloques: Seleccionar día de la semana (ej. lunes) e indicar hora de inicio y fin (ej. de 08:00 a 12:00).
- El sistema divide automáticamente estos bloques en los cupos de consulta según la duración del servicio.
- **Bloqueos puntuales o ausencias (`RF-PSI-03`):** Si el psicólogo tiene un examen, clase o compromiso puntual un día específico, puede registrar un bloqueo personal para esa fecha sin tener que alterar su horario semanal general.

#### 3.4 Revisión de citas asignadas (`/panel/psicologo/citas`)
- Pestañas disponibles: *Próximas*, *Pendientes* y *Pasadas*, además de vista de calendario semanal.
- **Privacidad y acceso a datos (`RF-PSI-05`, `RNF-SEG-04`):** El psicólogo solo puede ver la información de los pacientes asignados a sus propias citas (nombre, correo y teléfono de contacto para llamarlo el día de la sesión en la casa amarilla). No puede ver pacientes ni agendas de otros compañeros.
- **Citas canceladas:** Si un paciente cancela su cita desde su correo personal, el cupo se libera de inmediato y el psicólogo recibe la notificación por correo (`RF-COR-05`).

#### 3.5 Gestión de cuenta personal (`/panel/psicologo/cuenta`)
- Opción para cambiar su contraseña cuando lo requiera y botón visible para cerrar sesión de forma segura al desocupar los equipos compartidos del centro.

---

### Módulo 4: "Qué hacer si..." y resolución de dudas comunes (10 min) — *Todos*

Repasar las siguientes situaciones cotidianas documentadas en [[S08-Mantenimiento]]:

1. **¿Qué pasa si una persona no asiste a su cita?**
   - La monitora o el psicólogo entra al detalle de la cita y la marca como *"No asistió"*. Esto permite mantener el historial para evitar acaparamientos reiterados de turnos.
2. **¿Qué pasa si un psicólogo se enferma o no puede asistir el día de sus citas?**
   - La monitora entra a la bandeja, busca las citas de ese día y utiliza la opción "Reasignar" para transferir la cita a otro psicólogo disponible, o "Cancelar" avisando al paciente con motivo claro.
3. **¿Qué pasa si una solicitud de cita se queda sin autorizar por más de 48 horas?**
   - El sistema automáticamente la pasa a estado `VENCIDA` (`RF-CIT-12`), libera el cupo y envía el correo `cita-vencida` disculpándose amablemente con el solicitante e invitándolo a seleccionar un nuevo horario.
4. **¿Qué pasa si el paciente necesita cancelar o cambiar la hora?**
   - No necesita llamar obligatoriamente por teléfono: en todos los correos que recibió tiene el botón directo "Ver mi cita", desde donde puede cancelar o reprogramar por sí mismo hasta 12 horas antes de la consulta (`RF-CIT-11`, `RF-CIT-13`).
5. **¿Qué pasa si una monitora o psicólogo olvida su contraseña?**
   - En la pantalla `/ingresar`, toca *"¿Olvidaste tu contraseña?"* e introduce su correo institucional. El sistema le enviará un enlace de restablecimiento seguro (`RF-AUT-04`).

---

## 4. Ejercicio práctico guiado (Demostración de ciclo completo)

Para certificar que los asistentes comprendieron el flujo, realizar este ejercicio en vivo durante los últimos 15 minutos de la sesión:

1. **Paso A:** La monitora crea un psicólogo nuevo con el correo de uno de los asistentes.
2. **Paso B:** El asistente abre su correo, toca el enlace de invitación, crea su contraseña, entra a su panel y configura un horario de prueba para el día siguiente.
3. **Paso C:** Desde un teléfono móvil, otro asistente ingresa a `/pedir-cita` y solicita una cita con dicho psicólogo.
4. **Paso D:** La monitora verifica que la cita llegó a la bandeja de "Pendientes", revisa los datos y pulsa "Autorizar".
5. **Paso E:** Se comprueba que el paciente y el psicólogo recibieron sus respectivos correos con el archivo `.ics` y los detalles de ubicación en la casa amarilla.

---

## 5. Criterios de evaluación y lista de asistencia

La sesión de capacitación (`T-606`) se considera exitosa y completada cuando:
- [ ] Las monitoras operaron la bandeja, autorizaron una cita de prueba y descargaron el reporte CSV.
- [ ] Los psicólogos activaron su cuenta, subieron su perfil y cargaron sus horarios de atención.
- [ ] Se resolvieron las dudas sobre el protocolo de emergencias y la ausencia de historia clínica en la web.
- [ ] Se firmó la lista de asistencia que se adjunta como anexo al acta de entrega final ([[E08-Backlog]] `T-608`).