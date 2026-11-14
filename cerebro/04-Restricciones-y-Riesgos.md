---
tags: [capl, restricciones, riesgos]
---

# 04 · Restricciones y riesgos

Volver a [[00-Inicio]].

## Restricciones legales y éticas

| ID | Restricción | Consecuencia en el diseño |
|----|-------------|---------------------------|
| RES-LEG-01 | **Ley 1581 de 2012** (protección de datos, Colombia): los datos de salud son *sensibles* | Consentimiento explícito, política publicada, mínimos datos — RNF-PRI en [[03-Requisitos-No-Funcionales]] |
| RES-LEG-02 | La **historia clínica** tiene régimen propio y exigente (custodia, reserva, conservación) | El sistema **no** la almacena. Solo agenda. El motivo de consulta es opcional y breve |
| RES-LEG-03 | Secreto profesional del psicólogo (Ley 1090 de 2006) | Los correos no llevan motivo de consulta; cada psicólogo ve solo sus citas |
| RES-LEG-04 | Menores de edad requieren autorización de su representante | Flujo "para un menor" con datos del acudiente |
| RES-LEG-05 | El sitio **no presta atención de crisis** ni sustituye a urgencias | Aviso permanente y guía de emergencias; el orientador no diagnostica |
| RES-LEG-06 | El contenido clínico (códigos de emergencia, líneas, textos de servicios) debe aprobarlo personal del CAPL | Nada de ese contenido se publica sin visto bueno |
| RES-LEG-07 | Uso del nombre y logo de Unilasallista | Requiere autorización institucional antes de salir a producción |

> El proyecto **tiene aval del CAPL y de la universidad** (P-01). El equipo no es asesor jurídico: el texto de la política de datos lo valida la universidad.

## Restricciones técnicas

| ID | Restricción |
|----|-------------|
| RES-TEC-01 | Se despliega en el **servidor propio**; no se asume ningún servicio de pago aparte de Resend |
| RES-TEC-02 | Plan gratuito de Resend: tope diario y mensual de envíos → los correos son solo transaccionales, sin envíos masivos |
| RES-TEC-03 | Resend exige verificar un dominio (acceso al DNS) para enviar a cualquier destinatario |
| RES-TEC-04 | Los correos institucionales pueden filtrar remitentes externos → probar entrega a `@unilasallista.edu.co` desde la fase 0 |
| RES-TEC-05 | El dominio de pruebas no es el definitivo: ninguna URL escrita a mano en el código, todo por variable de entorno |
| RES-TEC-06 | Sin WhatsApp automatizado (decisión D-01); solo enlace de contacto |

## Restricciones de equipo y alcance

| ID | Restricción |
|----|-------------|
| RES-EQU-01 | 3 personas, sin dedicación exclusiva → el alcance de lanzamiento son solo los requisitos `M` |
| RES-EQU-02 | Una sola persona diseña todas las interfaces → el diseño va **una fase por delante** del código para no bloquear |
| RES-EQU-03 | El CAPL cambia de monitoras cada semestre → el sistema debe poder entregarse con manual y sin depender del equipo |
| RES-EQU-04 | Ninguna funcionalidad nueva entra sin autorización en [[09-Propuestas-por-Autorizar]] |

## Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|-------|---------|------------|
| RG-01 | Persona en crisis usa el formulario de cita en vez de pedir ayuda inmediata | Media | **Muy alto** | Botón de ayuda fijo, aviso en el formulario y en el correo de confirmación (RF-EMG-04, RF-PUB-08) |
| RG-02 | Los correos caen en spam o los bloquea el correo institucional | Alta | Alto | SPF/DKIM/DMARC, prueba temprana, pantalla de confirmación que no depende del correo |
| RG-03 | Doble reserva del mismo horario | Media | Alto | Restricción única en BD (RNF-DAT-01) |
| RG-04 | Citas pendientes que nadie autoriza y bloquean cupos | Alta | Medio | Aviso a administración, vencimiento automático de pendientes, opción de auto-autorizar |
| RG-05 | Filtración de datos personales | Baja | **Muy alto** | Datos mínimos, permisos en servidor, HTTPS, copias cifradas, sin historia clínica |
| RG-06 | Spam o reservas falsas que agotan los cupos | Media | Medio | Anti-spam, límite por correo/documento, anticipación mínima |
| RG-07 | Información de emergencia desactualizada o incorrecta | Media | **Muy alto** | Contenido aprobado por el CAPL, un solo archivo, fecha de "última revisión" visible |
| RG-08 | Los psicólogos no mantienen su horario al día | Alta | Medio | Horario semanal simple, recordatorio al inicio de semestre, admin puede bloquear |
| RG-09 | Conflictos al unir el trabajo de los tres | Media | Medio | Dueños por carpeta y contrato de datos — [[06-Division-del-Trabajo]], [[07-Protocolo-de-Equipo]] |
| RG-10 | El alcance crece sin control | Alta | Alto | Prioridades M/D/O y puerta de autorización |
| RG-11 | Se pierde el servidor o la base de datos | Baja | Alto | Copia diaria fuera del servidor y restauración probada |
| RG-12 | Alguien distinto al psicólogo usa el enlace de invitación | Baja | Medio | No viaja ninguna contraseña; el enlace caduca en 24–48 h y se deshabilita al crear la clave (RF-AUT-03) |
| RG-14 | Nadie mantiene el servidor tras la entrega | Alta | Alto | Recuperación automática y cero tareas manuales (RNF-REN-07 a 09) |
| RG-13 | No-shows (pacientes que no asisten) | Alta | Medio | Recordatorio y cancelación por enlace — propuesta PR-01 |
