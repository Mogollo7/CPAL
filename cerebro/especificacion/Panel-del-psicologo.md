# Panel del psicólogo

Decisión de diseño para la navegación y la gestión de citas asignadas. La base son los requisitos PSI-01 a PSI-07, las reglas de transición de E03, las rutas de E04, los contratos de E05 y los correos de E06. El cambio de permisos que se describe aquí forma parte del diseño y requiere implementación en el servidor.

## Qué aparece en la barra lateral

| Grupo | Destino | Para qué entra el psicólogo |
| --- | --- | --- |
| Agenda | **Mis citas** · entrada al panel | Ver quién solicitó cada cita, organizar la jornada y resolver solicitudes propias. Incluye próximas, pendientes e historial, con vistas de lista y semana. |
| Agenda | **Solicitudes pendientes** | Abrir directamente las solicitudes asignadas que esperan una decisión. Muestra nombre, servicio y horario, y lleva a la misma ficha de confirmación o cancelación que Mis citas. |
| Agenda | **Mis pacientes** | Encontrar a una persona por nombre o apellido, consultar su próxima cita propia y contactar a quien dejó los datos para esa cita. También se llega al perfil desde la cita abierta. |
| Disponibilidad | **Horario habitual** | Configurar los días y franjas que se repiten cada semana. Permite aplicar el mismo intervalo a varios días. El acceso existente a `/panel/psicologo/horario` conserva su destino. |
| Disponibilidad | **Cambios por fecha** | Abrir un turno adicional, bloquear una tarde o registrar una ausencia de uno o varios días. Consultar y retirar una excepción desde la semana correspondiente. |
| Mi espacio | **Perfil y cuenta** | En **Perfil profesional** gestiona foto, presentación, servicios y visibilidad pública, y consulta su área asignada. En **Seguridad** cambia la contraseña y gestiona la sesión. Los enlaces previos a la cuenta pueden abrir directamente esta pestaña. |

La identidad de la sesión y la salida rápida quedan al pie de la barra. La bandeja de pendientes es un acceso directo a una consulta de la agenda propia. Comparte los datos, el contador y la ficha con Mis citas. El historial y el calendario semanal siguen dentro de Mis citas. Las cuentas del equipo, las reasignaciones, las exportaciones y la agenda completa corresponden a Administración.

## Cómo configurar la disponibilidad

| Necesidad | Recorrido | Efecto |
| --- | --- | --- |
| Atender solo un martes adicional | Cambios por fecha → Abrir una franja → elegir ese martes de 8 a 12 | Se ofrecen los cupos libres de esa mañana. El martes siguiente vuelve a regir la semana habitual. |
| Terminar todos los jueves y viernes a las cuatro | Horario habitual → Editar franjas → elegir jueves y viernes → fijar las 4 p. m. como fin | La regla se repite en ambos días. Solo se ofrecen sesiones que puedan terminar antes o a las cuatro. |
| Salir temprano solo jueves y viernes de una semana | Cambios por fecha → Bloquear una franja → jueves a viernes, de 4 a 5 p. m. | El intervalo se aplica por separado a cada tarde. La mañana del viernes sigue disponible según el horario habitual. |
| Retirar una excepción | Seleccionar el cambio guardado → retirar apertura o bloqueo | Se recalcula esa franja con las demás reglas y reservas vigentes. |

Una jornada puede tener varios tramos, por ejemplo mañana y tarde separados por almuerzo. Un cambio puntual indica fecha inicial, fecha final y horas locales de cada día. Debe poder elegirse también el día completo para una ausencia. El prototipo ilustra los recorridos con fechas de ejemplo.

Al calcular cupos, unir las franjas habituales y las aperturas puntuales del profesional, eliminar solapes y descontar bloqueos vigentes, festivos y citas activas. Conservar las reglas de duración y anticipación del servicio. Un bloqueo prevalece sobre una apertura que se superponga. Al reducir la disponibilidad, mostrar las citas asignadas que quedarían fuera del nuevo horario y enlazar a sus fichas. Solo una acción explícita sobre una cita puede cancelarla.

## Cómo encontrar una cita

- **Próximas** reúne las pendientes y autorizadas futuras. **Pendientes** concentra las solicitudes que todavía admiten una decisión y muestra el total propio. **Historial** permite recuperar citas pasadas o cerradas, incluidas las canceladas con fecha futura.
- Combinar búsqueda por nombre o código con servicio, estado y fecha de la cita. **Servicio** es la categoría del catálogo del CAPL. Un día concreto se expresa con la misma fecha en Desde y Hasta. Un rango incluye ambos días en hora de Bogotá. Si Hasta precede a Desde, indicar el error junto al campo.
- Aplicar los filtros a lista y semana, conservarlos al regresar de la ficha y ofrecer **Limpiar**. Diferenciar una agenda sin citas de una búsqueda sin coincidencias. En el segundo caso, ofrecer limpiar filtros.

## Qué muestra y qué permite la ficha

El encabezado identifica código y estado. La columna de datos reúne nombre de quien solicitó la cita, contacto registrado, servicio, día y hora. La columna de acciones depende del estado. La ficha distingue al paciente (`pacienteNombre`) de quien solicitó la cita (`solicitanteNombre`). En solicitudes para un menor, el acudiente tiene un campo propio (`acudienteNombre`). El correo y el teléfono registrados corresponden al solicitante. Solo mostrar el rótulo «solicitante y acudiente» cuando se haya establecido que son la misma persona. Los datos de ejemplo del prototipo son ilustrativos.

| Situación | Acción y resultado |
| --- | --- |
| Solicitud propia pendiente, vigente y futura | **Confirmar y enviar correo** pasa la cita a AUTORIZADA. Antes del botón hay un campo opcional para una indicación práctica. Si queda vacío, el correo conserva su formato habitual. |
| Cita propia pendiente o autorizada, todavía futura | **Cancelar cita** abre una revisión con el servicio y el horario. Se pide un motivo que leerá la persona. **Mantener cita** vuelve sin cambios. **Confirmar cancelación** registra CANCELADA, libera el cupo y genera el aviso. |
| Solicitud vencida, cita pasada o estado final | Consultar datos y resultado. Mostrar el estado actualizado si cambió mientras la ficha estaba abierta. |
| Cita asignada a otro profesional | Aplicar la misma restricción de titularidad en listado, detalle y acciones, incluso si se accede mediante un enlace directo. |

El mensaje de confirmación se incluye en el correo existente `cita-autorizada`, junto a fecha, hora, enlace de gestión y adjunto de calendario. Ejemplo de texto del psicólogo: «Al llegar a la casa amarilla, pregunta por recepción». El mensaje es para indicaciones de la visita. La ficha no requiere notas clínicas ni una bandeja de mensajería. Al cancelar, se reutiliza `cita-cancelada` con el motivo comunicado por el CAPL.

## Mis pacientes y contacto por WhatsApp

**Desde la agenda.** Si el psicólogo ya tiene una cita abierta, «Ver perfil del paciente» abre a la persona correspondiente. El contacto se toma de esa cita concreta. Volver recupera la agenda o la ficha de origen con su posición y filtros.

**Desde el nombre.** Mis pacientes muestra una fila por persona con citas asignadas al profesional. Prioriza quienes tienen próxima cita, en orden cronológico. Después aparecen quienes solo tienen citas pasadas, por atención más reciente. Buscar por nombre o apellido debe admitir diferencias de mayúsculas y tildes. Dos personas con el mismo nombre se distinguen por los datos mínimos de su cita. No fusionar por coincidencia de nombre, correo ni teléfono. Resolver la identidad en el servidor con un identificador estable o con el documento corroborado, sin exponerlo en la URL. Excluir citas anonimizadas y las de otros profesionales.

**En el perfil.** Mostrar primero próxima cita con estado y acceso a su ficha. Cuando no haya una próxima, mostrar «Sin próxima cita» y el último encuentro propio disponible. Para contacto desde el directorio, indicar a qué cita corresponde el teléfono. Si hay varias citas con contactos distintos, elegir la cita antes de abrir WhatsApp. Para un menor o una cita de otra persona, mostrar el nombre y la relación conocida del titular del número.

| Acción | Respuesta esperada |
| --- | --- |
| Abrir WhatsApp | Abrir el chat del número validado en formato internacional con un saludo logístico editable. Ejemplo: «Hola, Juan. Te escribe el equipo del CAPL. ¿Podemos conversar por este medio?». El profesional revisa el destinatario y decide si envía. El borrador omite motivo, diagnóstico, documento y enlaces privados. |
| Copiar número | Copiar solo el teléfono completo con indicativo. Mantener el foco en el botón y anunciar «Número copiado» tras el éxito. |
| Copiar mensaje | Copiar el mismo borrador visible en el perfil y anunciar «Mensaje copiado» sin salir de la ficha. No registrar la copia ni la apertura de WhatsApp como mensaje enviado o cita confirmada. |
| Número ausente o ambiguo | Mostrar el correo registrado si existe. Ofrecer copia del número tal como fue registrado si resulta útil, pero habilitar el enlace al chat solo cuando el número sea válido y se conozca el indicativo. |
| Portapapeles o WhatsApp no disponibles | Mostrar el texto o el número seleccionable para copiar manualmente y conservar la ficha. Si la copia falla, ofrecer esa alternativa en lugar de anunciar éxito. |

**Cómo validar la experiencia con psicólogos.** Pedir que encuentren a una persona desde su nombre y desde su cita, identifiquen quién recibirá el mensaje en un caso de menor, copien un único dato y vuelvan al punto anterior. Observar clics de más, errores de destinatario y dudas sobre si el mensaje se envió. Repetir con teclado y con una cita sin teléfono. La prueba de Figma usa datos ilustrativos y simula WhatsApp y el aviso de copia.

## Qué falta para llevar el diseño a producción

1. Ampliar las reglas y los contratos de autorización y cancelación, que E03 y E05 asignan actualmente a Administración. Comprobar en el servidor el profesional asignado, el estado, el vencimiento aplicable y que la cita sea futura. La ventana de cancelación del solicitante es una regla distinta.
2. Registrar actor, fecha y transición. Encolar los correos en la misma transacción del cambio y evitar duplicados ante doble clic, reintento o gestión simultánea con Administración. Si otra persona ya resolvió la solicitud, actualizar la ficha con el resultado vigente.
3. Actualizar filtros, totales, historial y disponibilidad después del cambio. Distinguir la confirmación de la cita del resultado de entrega del correo. Un fallo de entrega debe seguir la política de reintentos del proyecto.
4. Verificar con dos usuarios psicólogos el aislamiento de agendas, la confirmación con y sin mensaje, la cancelación con motivo, el filtro de un solo día, los extremos de un rango y el regreso a la lista filtrada.
5. El modelo actual cubre disponibilidad recurrente y bloqueos. Añadir a E02, E03 y E05 la apertura positiva por fecha con alcance propio e integrarla tanto en la consulta pública de cupos como en la validación al reservar. Probar un martes excepcional, dos bloqueos vespertinos consecutivos, una reserva existente y el regreso automático al horario habitual.
6. Definir la consulta de pacientes propios y resolver el contacto por cita. Aplicar las mismas condiciones de asignación y anonimización al listado, la búsqueda y el detalle. Implementar y probar el portapapeles y la apertura de WhatsApp con datos de prueba, incluyendo homónimos, acudientes y teléfonos incompletos.
