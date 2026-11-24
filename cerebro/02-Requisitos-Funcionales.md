---
tags: [capl, requisitos, rf]
---

# 02 · Requisitos funcionales

Volver a [[00-Inicio]]. Responsables (A/B/C) definidos en [[06-Division-del-Trabajo]]. Fases en [[08-Ruta-de-Desarrollo]].

**Prioridad:** `M` = imprescindible para lanzar · `D` = deseable · `O` = opcional / después.

## Sitio público (PUB)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-PUB-01 | Página de inicio: qué es el CAPL, a quién atiende, gratuidad, botón "Pedir cita" | M | A | 1 |
| RF-PUB-02 | Página "Cómo funciona": pasos del proceso (pedir → autorización → asistir), qué llevar, cancelaciones | M | A | 1 |
| RF-PUB-03 | Catálogo de servicios con descripción, a quién va dirigido y botón "Pedir cita" que preselecciona el servicio | M | A | 1 |
| RF-PUB-04 | Preguntas frecuentes como bloque con acordeón dentro de Inicio y Servicios (sin página propia, decidido 17-nov-2026) | M | A | 1 |
| RF-PUB-05 | Contacto: dirección con mapa, correo, WhatsApp (enlace `wa.me`), horarios | M | A | 1 |
| RF-PUB-06 | Redes sociales del CAPL visibles en pie de página y contacto | M | A | 1 |
| RF-PUB-07 | Directorio de psicólogos: foto, nombre, área, presentación (solo perfiles activos y publicados) | D | A | 2 |
| RF-PUB-08 | Aviso permanente "No somos urgencias" con acceso a la guía de emergencias en todas las páginas | M | A | 1 |
| RF-PUB-09 | Política de tratamiento de datos y términos, enlazados desde todo formulario | M | A | 1 |
| ~~RF-PUB-10~~ | *(Descartado)* Sitio instalable en el celular (PWA) | ❌ | A | — |

## Guía de emergencias (EMG)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-EMG-01 | Página que explica los **tipos de emergencia por código de color** (Dorado, Fucsia, Blanco/Púrpura, Rosa): qué situación es, señales para reconocerla, qué hacer y qué NO hacer | M | A | 1 |
| RF-EMG-02 | Directorio de **líneas de ayuda inmediata** (123, 106, 444 44 48, 155, 141) con botón directo de llamada `tel:` | M | A | 1 |
| RF-EMG-03 | **Orientador "¿Qué me está pasando?"**: 3–4 preguntas sencillas que guían a la persona a la tarjeta y línea adecuada en segundos (no diagnostica; siempre muestra el 123 arriba) | M | A | 1 |
| RF-EMG-04 | **Botón fijo "Necesito ayuda ahora"** visible en todo el sitio y en el formulario de cita | M | A | 1 |
| RF-EMG-05 | El contenido completo (códigos, líneas y textos) vive en **`contenido/emergencias.json`** con fecha de última revisión visible, editable sin tocar código | M | A | 1 |
| RF-EMG-06 | **Recursos de primeros auxilios emocionales**: ejercicio guiado de conexión a tierra (*grounding 5-4-3-2-1*) para crisis de ansiedad/pánico y guía para acompañantes | M | A | 1 |

> ⚠️ Los textos y números oficiales se cargan desde el borrador inicial de [[12-Codigos-de-Emergencia-Borrador]] y se validan con el CAPL antes del lanzamiento.

## Solicitud de cita (CIT)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-CIT-01 | Formulario por pasos: servicio → para quién → psicólogo y horario → datos de contacto → confirmar. **El paciente puede escoger a su psicólogo** (P-10) | M | A+B | 3 |
| RF-CIT-02 | "¿Para quién es la cita?": para mí / para otra persona / para un menor de edad (pide datos del acudiente) | M | A+B | 3 |
| RF-CIT-03 | Mostrar solo horarios **realmente disponibles**: horario del psicólogo − citas pendientes/autorizadas − bloqueos − festivos | M | B | 3 |
| RF-CIT-04 | Opción "cualquier psicólogo disponible" además de elegir uno | D | B | 3 |
| RF-CIT-05 | Impedir doble reserva del mismo horario aunque dos personas envíen a la vez | M | B | 3 |
| RF-CIT-06 | Datos mínimos: nombre, documento, correo, teléfono, edad; motivo **opcional** y breve | M | B | 3 |
| RF-CIT-07 | Casilla obligatoria de autorización de tratamiento de datos (se guarda fecha y versión del texto) | M | B | 3 |
| RF-CIT-08 | Al enviar: la cita queda **Pendiente**, el horario se reserva y se muestra pantalla de confirmación | M | B | 3 |
| RF-CIT-09 | Anticipación mínima y máxima para agendar (configurable, p. ej. ≥24 h y ≤30 días) | M | B | 3 |
| RF-CIT-10 | Límite de citas activas por correo/documento para evitar acaparamiento | D | B | 3 |
| RF-CIT-11 | Enlace personal en el correo para **cancelar** la cita sin tener cuenta | M | B | 3 |
| RF-CIT-12 | Una solicitud pendiente que nadie autoriza en X horas (configurable) pasa a **Vencida**, libera el cupo y avisa al paciente *(PR-05)* | M | B | 3 |
| RF-CIT-13 | Desde el mismo enlace del correo el paciente puede **reprogramar**: elige otro horario disponible y el anterior se libera *(PR-06)* | M | A+B | 3 |

## Correos automáticos (COR) — Resend

| ID | Cuándo | Para | Pri | Fase |
|----|--------|------|-----|------|
| RF-COR-01 | Solicitud recibida: "Tu cita está en proceso de autorización" | Paciente | M | 3 |
| RF-COR-02 | Nueva solicitud por revisar | Administración | M | 3 |
| RF-COR-03 | "Tu cita ha sido autorizada" con fecha, hora, lugar, psicólogo, qué llevar | Paciente | M | 3 |
| RF-COR-04 | Cita no autorizada, con motivo y enlace para pedir otra | Paciente | M | 3 |
| RF-COR-05 | Cita cancelada (por cualquiera de las partes) | Paciente y psicólogo | M | 3 |
| RF-COR-06 | Nueva cita autorizada en tu agenda | Psicólogo | M | 3 |
| RF-COR-07 | Invitación: "Has sido invitado como psicólogo del CAPL" con su usuario y el enlace para crear la contraseña | Psicólogo | M | 2 |
| RF-COR-08 | Restablecer contraseña | Psicólogo / admin | M | 2 |
| ~~RF-COR-09~~ | *(Descartado)* Inscripción a evento confirmada | ❌ | — | — |
| RF-COR-10 | **Recordatorio 24 h antes** de la cita, con botones de cancelar y reprogramar *(PR-01)* | Paciente | M | 3 |
| RF-COR-11 | El correo de autorización trae archivo `.ics` (compatible con Outlook / Apple) y enlaces rápidos para Google Calendar y Outlook Web *(PR-03)* | Paciente | M | 3 |
| RF-COR-12 | Si un correo de cita **no se pudo entregar**, el panel lo muestra en el detalle de la cita *(PR-29)* | Administración | M | 3 |

Todos los correos: plantilla común con identidad del CAPL, y pie con líneas de emergencia. Responsable: B (envío) + A (diseño de plantilla).

## Autenticación y cuentas (AUT)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-AUT-01 | Inicio de sesión con correo institucional y contraseña (solo admin y psicólogos) | M | B | 2 |
| RF-AUT-02 | Al crear un psicólogo se genera su cuenta: usuario = correo institucional, **sin contraseña**; recibe un enlace para crearla | M | B | 2 |
| RF-AUT-03 | El enlace vale **24–48 h** (configurable), se puede abrir varias veces mientras esté vigente y **se deshabilita al crear la contraseña**. Vencido, el psicólogo solicita otro o el admin lo reenvía. Sin contraseña creada la cuenta no puede ingresar | M | B | 2 |
| RF-AUT-04 | Recuperar contraseña por correo | M | B | 2 |
| RF-AUT-05 | Roles: `ADMIN` y `PSICOLOGO`; cada ruta del panel verifica el rol en el servidor | M | B | 2 |
| RF-AUT-06 | Solo se aceptan correos del dominio institucional (lista de dominios configurable) | M | B | 2 |
| RF-AUT-07 | Cerrar sesión y expiración de sesión por inactividad | M | B | 2 |
| RF-AUT-08 | **Segundo paso de ingreso para administradores:** código de 6 dígitos al correo en dispositivos nuevos, "recordar dispositivo" 30 días, aviso de ingreso, confirmación de contraseña en acciones sensibles *(PR-28)* | M | B | 2 |

> Decidido en P-06 (13-nov-2026): no hay contraseña "default". El enlace **no es de un solo clic** a propósito: si el psicólogo lo abre y pierde la sesión antes de terminar, puede volver a abrirlo. Lo que lo invalida es crear la contraseña o que pase el plazo.

## Panel de administración (ADM)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-ADM-01 | Crear psicólogo: nombre, correo institucional, área (psicología / neuropsicología) → dispara RF-COR-07 | M | C | 2 |
| RF-ADM-02 | Listar, editar, **desactivar** psicólogos (no borrar: conserva el historial de citas) y reenviar invitación | M | C | 2 |
| RF-ADM-03 | Bandeja de citas con filtros por estado, fecha, psicólogo y servicio | M | C | 3 |
| RF-ADM-04 | **Autorizar** o **rechazar** (con motivo) una cita pendiente | M | C | 3 |
| RF-ADM-05 | Cancelar o reasignar una cita a otro psicólogo/horario | D | C | 3 |
| RF-ADM-06 | Interruptor **"Autorizar automáticamente"** todas las citas | M | C | 3 |
| RF-ADM-07 | Vista de calendario semanal de todas las citas | D | C | 3 |
| RF-ADM-08 | Gestionar servicios (nombre, descripción, duración, área, activo) | D | C | 3 |
| RF-ADM-09 | Bloquear fechas para todo el centro (festivos, vacaciones, eventos) | M | C | 3 |
| RF-ADM-10 | Marcar cita como **atendida** o **no asistió** | D | C | 3 |
| RF-ADM-11 | Crear otros administradores | D | C | 2 |
| RF-ADM-12 | Registro de quién autorizó/rechazó/canceló cada cita y cuándo | M | B | 3 |
| RF-ADM-13 | Los **festivos de Colombia** se bloquean solos cada año, sin cargarlos a mano *(PR-04)* | M | B | 3 |
| RF-ADM-14 | **Exportar citas a CSV** (abre en Excel) con los filtros de la bandeja *(PR-07)* | M | C | 3 |
| RF-ADM-15 | Las citas autorizadas aparecen en un **calendario compartido de Google** del CAPL, sin datos del paciente *(PR-24, opcional)* | D | B | 3 |

## Panel del psicólogo (PSI)

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-PSI-01 | Editar perfil: foto, presentación, área, a qué pacientes/servicios apoya | M | C | 2 |
| RF-PSI-02 | Definir **horario semanal** de atención (bloques por día) del que salen los cupos | M | C | 2 |
| RF-PSI-03 | Bloquear días u horas puntuales (ausencias) | D | C | 2 |
| RF-PSI-04 | Ver sus citas (pendientes y autorizadas) en lista y por semana | M | C | 3 |
| RF-PSI-05 | Ver los datos de contacto del paciente solo de **sus** citas | M | B | 3 |
| RF-PSI-06 | Cambiar su contraseña | M | C | 2 |
| RF-PSI-07 | Decidir si su perfil aparece en el directorio público | D | C | 2 |

## Eventos (EVE) — Modalidad Vitrina / Presentación

Se conserva en modalidad **vitrina o cartelera informativa** (sin registro ni inscripciones internas) para enfocar los esfuerzos en las citas y emergencias.

| ID | Requisito | Pri | Resp | Fase |
|----|-----------|-----|------|------|
| RF-EVE-01 | Admin crea, edita, publica y despublica eventos: título, descripción, fecha/hora, lugar o enlace virtual, e imagen | M | C | 4 |
| RF-EVE-02 | **Presentación pública de eventos:** sección con tarjetas de eventos próximos y vista de detalle | M | A | 4 |
| ~~RF-EVE-03~~ | *(Descartado)* Formulario de inscripción interno | ❌ | — | — |
| ~~RF-EVE-04~~ | *(Descartado)* Control de cupos de evento | ❌ | — | — |
| ~~RF-EVE-05~~ | *(Descartado)* Lista de inscritos y exportación CSV | ❌ | — | — |
| RF-EVE-06 | Los eventos cuya fecha ya pasó se ocultan automáticamente de la vista pública | M | B | 4 |

## Resumen

| Módulo | M | D | Total |
|--------|---|---|-------|
| PUB | 8 | 2 | 10 |
| EMG | 4 | 1 | 5 |
| CIT | 11 | 2 | 13 |
| COR | 12 | 0 | 12 |
| AUT | 8 | 0 | 8 |
| ADM | 9 | 6 | 15 |
| PSI | 5 | 2 | 7 |
| EVE | 4 | 2 | 6 |
| **Total** | **61** | **15** | **76** |

Ideas adicionales aún no aprobadas: [[09-Propuestas-por-Autorizar]].
