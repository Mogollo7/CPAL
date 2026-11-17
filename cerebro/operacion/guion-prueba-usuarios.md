---
tags: [capl, operacion, pruebas, usabilidad, accesibilidad]
---

# Guion de prueba con personas usuarias (T-510)

Volver a [[00-Inicio]] · Tarea de referencia: [[E08-Backlog]] (`T-510`).  
Requisitos relacionados: [[03-Requisitos-No-Funcionales]] (`RNF-ACC-02`, `RNF-ACC-04`, `RNF-ACC-05`, `RNF-ACC-06`, `RNF-ACC-07`), [[E09-Flujos-de-Usuario]] (§2) y [[N09-Accesibilidad-y-Revision]] ("Prueba con personas").

---

## 1. Objetivo y condiciones de la prueba

El objetivo es comprobar que **3 personas ajenas al equipo de desarrollo y al centro** puedan entender el sitio público, pedir una cita psicológica en su teléfono móvil sin ayuda y en menos de 3 minutos, y saber qué hacer si necesitan ayuda inmediata.

### Condiciones del entorno
- **Dispositivo:** Teléfono móvil propio de cada participante (no en computador ni en emuladores; pantalla real de 360 px en adelante).
- **Conexión:** Red móvil o Wi-Fi normal.
- **Entorno:** Servidor de pruebas (`{PRUEBAS}`).
- **Datos utilizados:** Datos ficticios para el agendamiento (nombres de ejemplo, documento de prueba y un correo accesible durante la sesión para comprobar la llegada de la notificación).
- **Rol del equipo observador:** Observar en silencio. No explicar la pantalla, no sugerir dónde tocar ni resolver dudas operativas sobre la interfaz mientras la persona interactúa. Si la persona pregunta qué hacer, responder de forma neutra: *"Haz lo que considerarías natural si estuvieras sola en tu casa"*.

---

## 2. Preparación previa a cada sesión

Antes de recibir a cada persona participante, verificar:
1. El servidor de pruebas está arriba y responde con normalidad.
2. Existen psicólogos de prueba activos con horarios disponibles para la semana en curso.
3. El correo de prueba está listo para recibir las notificaciones sin demoras.
4. Cronómetro disponible para medir tiempos por tarea.
5. Plantilla de hallazgos impresa o lista en otra pantalla para tomar notas textuales.

---

## 3. Bienvenida y encuadre inicial (3 minutos)

El facilitador lee o dice con sus palabras este texto breve:

> *"Hola, muchas gracias por acompañarnos hoy. Estamos construyendo el nuevo sitio web del Centro de Atención Psicológica Lasallista (CAPL).*
> 
> *Queremos pedirte que hagas un par de tareas comunes desde tu celular, tal como lo harías si necesitaras atención psicológica o información del centro.*
> 
> *Es muy importante que sepas algo: **te estamos evaluando a la página web, no a ti**. No hay respuestas correctas ni incorrectas. Si en algún momento te confundes, no encuentras algo o te parece difícil, es un error del diseño de la página y nos ayuda muchísimo detectarlo.*
> 
> *Siéntete libre de comentar en voz alta lo que vas pensando o sintiendo mientras navegas. ¿Tienes alguna pregunta antes de comenzar?"*

---

## 4. Tareas a ejecutar

### Tarea 1: Exploración inicial y comprensión del centro (2 minutos)
- **Instrucción para la persona:** *"Entra a la página inicial que te compartimos en tu celular. Tómate un minuto para mirar la portada y cuéntame con tus palabras qué ofrece este lugar, si las citas tienen costo y cómo se atiende."*
- **Ruta:** `/`
- **Qué observar:**
  - ¿Lee o nota la gratuidad del servicio y la frase de la "casa amarilla"?
  - ¿Identifica claramente que no es un servicio de urgencias médicas?
  - ¿Ve con facilidad el botón principal para pedir cita?

### Tarea 2: Agendamiento de una cita psicológica (Meta: menos de 3 minutos · RNF-ACC-04)
- **Instrucción para la persona:** *"Imagina que quieres pedir una cita individual para ti para esta semana. Por favor realiza el proceso completo hasta terminar la solicitud con tus datos de prueba."*
- **Ruta:** `/pedir-cita` (5 pasos continuos)
- **Qué observar en cada paso:**
  - **Paso 1 (Servicio):** ¿Entiende las tarjetas de servicio o duda sobre cuál elegir?
  - **Paso 2 (¿Para quién?):** ¿Selecciona con rapidez la opción "Para mí"?
  - **Paso 3 (Psicólogo y horario):** ¿Le resulta claro el selector de días y las horas disponibles? ¿Entiende la opción de elegir a un psicólogo en particular o la de "Cualquiera disponible"?
  - **Paso 4 (Datos personales):** ¿Nota qué campos son obligatorios y cuál es opcional (motivo de consulta)? ¿Aparece algún mensaje de error al escribir teléfono o correo?
  - **Paso 5 (Revisar y confirmar):** ¿Lee el resumen antes de enviar? ¿Encuentra con naturalidad la casilla obligatoria de tratamiento de datos personales?
  - **Confirmación (`/pedir-cita/confirmacion`):** ¿Comprende que su solicitud quedó pendiente de autorización y que debe esperar un correo de respuesta? ¿Lee el código de su cita?
- **Medición:** Iniciar cronómetro al tocar el primer botón de agendamiento y detenerlo al ver la pantalla de confirmación.

### Tarea 3: Verificación del correo y acceso a la gestión de la cita (2 minutos)
- **Instrucción para la persona:** *"Revisa el correo electrónico que registraste. Abre el mensaje que llegó del CAPL y entra al enlace que te permita revisar el estado de tu solicitud."*
- **Ruta:** Bandeja de correo → `/cita/[token]`
- **Qué observar:**
  - ¿Identifica con claridad el remitente y el asunto del correo (`solicitud-recibida`)?
  - ¿El botón del correo abre sin problemas la pantalla "Mi cita" en el navegador del celular?
  - ¿Comprende qué acciones puede tomar desde esa pantalla (esperar, cancelar o reprogramar horario)?

### Tarea 4: Localización de ayuda inmediata ante una crisis (1 minuto · RNF-ACC-06)
- **Instrucción para la persona:** *"Supón que estás pasando por un momento muy difícil o una crisis emocional en este instante y necesitas ayuda urgente. Muéstrame qué harías desde la página donde estás."*
- **Ruta:** Botón flotante → `/ayuda-inmediata`
- **Qué observar:**
  - ¿Encuentra el botón fijo "Necesito ayuda ahora" presente en la pantalla?
  - Al abrir la guía, ¿identifica de inmediato las líneas de emergencia (ej. 123) y las tarjetas de códigos de color?
  - ¿Comprende que esta sección no pide formularios y es para comunicarse de inmediato?

---

## 5. Pregunta obligatoria de cierre

Al terminar las tareas, no se hacen encuestas largas ni preguntas técnicas. Se realiza una única pregunta principal según [[N09-Accesibilidad-y-Revision]]:

> **"¿Cómo te hizo sentir el uso de la página?"**

Anotar de forma literal las palabras de la persona (tranquilidad, confusión, agobio, claridad, desconfianza, etc.) y permitir que elabore libremente durante 2 a 3 minutos.

---

## 6. Registro de participantes

| Participante | Perfil / Ocupación | Modelo de celular | Navegador | Tiempo Tarea 2 (Min:Seg) | Resultado global |
|--------------|--------------------|-------------------|-----------|--------------------------|------------------|
| Persona 1 | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [Éxito / Dificultad / Bloqueo] |
| Persona 2 | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [Éxito / Dificultad / Bloqueo] |
| Persona 3 | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [Éxito / Dificultad / Bloqueo] |

---

## 7. Plantilla para registro y clasificación de hallazgos

Registrar cada tropiezo, duda o comentario en la siguiente tabla durante o inmediatamente después de la sesión:

| ID | Persona | Pantalla o Paso | Qué ocurrió (hecho observado) | Frase textual de la persona | Severidad (1) | Causa probable en interfaz | Acción correctiva propuesta | Estado (2) |
|----|---------|-----------------|-------------------------------|-----------------------------|---------------|----------------------------|-----------------------------|------------|
| H-01 | P1 | Paso 3 (Horarios) | Intentó tocar un día anterior o no disponible | [POR COMPLETAR] | Menor | Falta contraste o texto auxiliar en días sin cupo | Mejorar estado deshabilitado en selector | Abierto |
| H-02 | [P1/P2/P3] | [POR COMPLETAR] | [POR COMPLETAR] | "[POR COMPLETAR]" | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| H-03 | [P1/P2/P3] | [POR COMPLETAR] | [POR COMPLETAR] | "[POR COMPLETAR]" | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| H-04 | [P1/P2/P3] | [POR COMPLETAR] | [POR COMPLETAR] | "[POR COMPLETAR]" | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| H-05 | [P1/P2/P3] | [POR COMPLETAR] | [POR COMPLETAR] | "[POR COMPLETAR]" | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |

*(1) Severidades: **Crítica** (impide completar la cita), **Mayor** (causa demora alta o confusión seria), **Menor** (duda pasajera pero logra completar), **Sugerencia** (mejora estética o de texto).*  
*(2) Estados: **Abierto**, **Corregido**, **Anotado** (aplazado con justificación).*

---

## 8. Criterio de aceptación para cerrar la tarea T-510

La tarea `T-510` se da por terminada cuando:
- [ ] Las 3 pruebas con personas reales ajenas al equipo fueron ejecutadas y cronometradas en dispositivos móviles reales.
- [ ] El tiempo promedio del formulario en la Tarea 2 fue menor a 3 minutos (`RNF-ACC-04`).
- [ ] Se registró la respuesta a la pregunta "¿Cómo te hizo sentir?" para cada persona.
- [ ] Todos los hallazgos de severidad **Crítica** y **Mayor** quedaron corregidos en código o debidamente documentados y acordados con el equipo antes del lanzamiento.