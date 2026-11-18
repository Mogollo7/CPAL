---
tags: [capl, propuestas]
---

# 09 · Propuestas por autorizar

Volver a [[00-Inicio]]. Funcionalidades **nuevas** que no pediste pero que encajan. Ninguna entra al desarrollo hasta que marques la casilla.

**Cómo autorizar:** cambia `[ ]` por `[x]` para aprobar, o escribe ❌ al lado para descartar. Lo aprobado pasa a [[02-Requisitos-Funcionales]] con su ID.

**Esfuerzo:** 🟢 menos de 1 día · 🟡 2–3 días · 🔴 una semana o más.

## Recomendadas para el lanzamiento

Poco esfuerzo y resuelven un riesgo concreto de [[04-Restricciones-y-Riesgos]].

- [x] **PR-01 · Recordatorio 24 h antes de la cita** 🟢 — *aprobada 13-nov-2026 → RF-COR-10*
  Correo automático el día anterior con botón de cancelar. Ataca las inasistencias (RG-13), el mayor desperdicio de un servicio gratuito.

- ❌ **PR-02 · Botón "Salir rápido"** 🟢 — *descartada 13-nov-2026*
  Botón fijo que cierra el sitio y abre una página neutra. Práctica habitual en sitios de apoyo a víctimas de violencia: protege a quien consulta desde un dispositivo compartido.

- [x] **PR-03 · Cita al calendario** 🟢 — *aprobada 13-nov-2026 → RF-COR-11*
  El correo de autorización trae un archivo `.ics` y un enlace "Añadir a Google Calendar". Menos olvidos.

- [x] **PR-04 · Festivos de Colombia precargados** 🟢 — *aprobada 13-nov-2026 → RF-ADM-13*
  Los festivos se bloquean solos cada año en vez de cargarlos a mano.

- [x] **PR-05 · Vencimiento de solicitudes sin respuesta** 🟢 — *aprobada 13-nov-2026 → RF-CIT-12*
  Si nadie autoriza una cita en X horas, se libera el cupo y se avisa al paciente. Resuelve RG-04.

- [x] **PR-06 · Reprogramar desde el correo** 🟡 — *aprobada 13-nov-2026 → RF-CIT-13*
  Además de cancelar, el paciente elige otro horario desde su enlace, sin escribirle a nadie.

- [x] **PR-07 · Exportar citas a CSV / Excel** 🟢 — *aprobada 13-nov-2026 → RF-ADM-14*
  Para los informes de gestión del CAPL.

## Añadidas por solicitud del 13-nov-2026

Pedidas al definir las normas del servidor ([[S00-Servidor-Inicio]]). Quedan aprobadas con el alcance indicado; cada una tiene interruptor y el sistema funciona sin ella.

- [x] **PR-24 · Calendario compartido de Google (nivel 1)** 🟡 → RF-ADM-15
  Un calendario del CAPL donde el sistema escribe las citas autorizadas, sin datos del paciente. Solo del sistema hacia el calendario. Sujeto a P-22. *No es la sincronización en ambos sentidos de PR-21, que sigue sin aprobar.*

- [x] **PR-25 · Respaldo de envío por Gmail** 🟢
  Si Resend falla de forma sostenida, los correos de cita salen por una cuenta de Gmail dedicada. Sujeto a P-22.

- ❌ **PR-26 · Observación con Loki y Grafana** 🟡 — *descartada (13-nov-2026): se quita para cumplir con entrega MVP 20-nov y final 28-nov. Logs normales de Node/Docker son suficientes.*
  Registros centralizados, cinco tableros y alertas. Requiere cerca de 1 GB de memoria (P-23).

- [x] **PR-27 · Medición de uso propia y anónima** 🟡 → RNF-PRI-08 (modificado)
  Tiempo en pantalla, zonas más tocadas, embudo del formulario. Sin cookies, sin terceros, sin grabar sesiones. Requiere declararlo en la política de datos (P-24).

- [x] **PR-28 · Segundo paso de ingreso para administradores** 🟢 → RF-AUT-08
  Código al correo en dispositivos nuevos, aviso de ingreso y confirmación de contraseña en acciones sensibles.

- [x] **PR-29 · Aviso de correos no entregados** 🟢 → RF-COR-12
  Resend informa los rebotes; el panel muestra "no pudimos entregar el correo" para contactar a la persona por teléfono.

## Valiosas, después del lanzamiento

- [ ] **PR-08 · Panel de indicadores** 🟡
  Citas por mes, por servicio, por psicólogo; porcentaje de inasistencia; tiempo medio de autorización. Sirve para los reportes de la facultad.

- [ ] **PR-09 · Lista de espera** 🟡
  Si no hay cupos, la persona deja su correo y se le avisa cuando se libera uno.

- [ ] **PR-10 · Rol "Docente supervisor"** 🟡
  Ve las agendas de los estudiantes que supervisa, solo lectura. Refleja cómo funciona de verdad el centro.

- [ ] **PR-11 · Encuesta de satisfacción** 🟡
  Correo tras la cita marcada como atendida, 3 preguntas, anónima.

- [ ] **PR-12 · Recursos de psicoeducación** 🟡
  Sección de artículos cortos, guías y material descargable del CAPL. Da contenido para redes y posicionamiento.

- [ ] **PR-13 · Solicitud de charlas para empresas y colegios** 🟢
  Formulario propio para ese servicio, que no encaja en el flujo de cita individual.

- [ ] **PR-14 · Verificación del correo antes de reservar** 🟡
  Un código al correo antes de bloquear el cupo. Menos reservas falsas (RG-06), a costa de un paso más.

- [ ] **PR-15 · Gestión de semestre** 🟡
  Al cerrar semestre: desactivar en bloque a los psicólogos salientes e invitar a los nuevos desde una lista.

- ❌ **PR-16 · Instalable en el celular (PWA)** 🟢 — *descartada (13-nov-2026): se quita para cumplir con entrega MVP 20-nov y final 28-nov. La web móvil responsiva normal cubre la necesidad.*
  El sitio se añade a la pantalla de inicio y la guía de emergencias funciona sin conexión.

- [ ] **PR-17 · Modalidad virtual** 🟡 — *en espera: la atención hoy es presencial*
  Citas presenciales o virtuales, con el enlace de la videollamada en el correo.

- [ ] **PR-18 · Compartir evento y añadirlo al calendario** 🟢

## Opcionales

- [ ] **PR-19 · Modo oscuro** 🟢
- ❌ **PR-20 · Ajustes de accesibilidad visibles** (tamaño de letra, alto contraste) 🟢 — *descartada como control dinámico. En su lugar: escala fija de tamaños basada en la proporción áurea para evitar desbordes → RNF-ACC-07*
- [ ] **PR-21 · Sincronización con Google Calendar del psicólogo** 🔴
- [ ] **PR-22 · Notas internas de administración en la cita** (logísticas, nunca clínicas) 🟢
- ❌ **PR-23 · Recordatorio por SMS o WhatsApp** 🔴 — *descartada 13-nov-2026*; reabre la complejidad que motivó la decisión D-01

## No recomendadas

Se dejan anotadas para que no reaparezcan sin discutirse. **Confirmado el 13-nov-2026: ninguna de estas se hace.**

| Idea | Por qué no |
|------|-----------|
| Cuentas de paciente con historial | Obliga a custodiar más datos sensibles; el enlace por correo cubre la necesidad |
| Notas clínicas o historia clínica en el sistema | Cambia por completo las obligaciones legales (RES-LEG-02) |
| Chat en vivo o chatbot de apoyo emocional | Riesgo alto con personas en crisis si nadie responde; requiere personal y protocolo |
| Autodiagnóstico con pruebas psicológicas | Fuera del alcance ético de un sitio de agendamiento |
| Videollamada integrada propia | Ya existen herramientas; PR-17 basta |
| Aplicación móvil nativa | El sitio adaptable (y PR-16) cubren el caso |
| Pagos en línea | Los servicios son gratuitos |
