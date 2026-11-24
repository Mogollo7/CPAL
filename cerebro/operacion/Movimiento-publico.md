# Auditoría de movimiento del sitio público CAPL

Revisión del 24 de noviembre de 2026. El objetivo es que una persona pueda leer a su ritmo, reconocer qué cambió al navegar y actuar de inmediato si necesita ayuda. La comodidad percibida requiere evaluación con personas usuarias.

## Hallazgos y decisiones

| Prioridad | Evidencia en el código anterior | Cambio y criterio de aceptación |
| --- | --- | --- |
| Alta | En Contacto, la regla para movimiento reducido mantenía la marquesina en un bucle de 140 s. La única pausa dependía de pasar el puntero. | La franja empieza quieta. La casilla «Animar los retratos» permite iniciar, pausar y reanudar con teclado o toque. Al activar movimiento reducido se detiene. |
| Alta | El componente compartido de formularios y orientación generaba una entrada desde opacidad cero, incluso con movimiento reducido. | El HTML inicial contiene los pasos legibles. CSS suaviza el cambio de paso durante 260 ms. En el orientador y el ejercicio de anclaje solo cambia la opacidad. Con movimiento reducido el cambio es inmediato. |
| Media | Las ilustraciones editoriales y la secuencia de Servicios aparecían de golpe. Una animación ligada continuamente al scroll volvería a mover el mismo texto al releer. | Anime.js 4.5 usa la Web Animations API. La primera entrada desde fuera de pantalla se reproduce una vez por montaje. Las ilustraciones se desplazan 6 px en 420 ms y los pasos de Servicios, 3 px en 260 ms. Lo que ya está a la vista al abrir la página aparece directamente. |
| Media | El contenido cambiaba de golpe al navegar entre páginas informativas. El menú, el pie y el acceso a ayuda son puntos de referencia compartidos. | Al cambiar de ruta editorial, solo el contenido principal pasa de 92 % a 100 % de opacidad en 160 ms. Los enlaces mantienen la navegación de Next, el historial y el desplazamiento nativo. La primera carga, los filtros de la misma ruta y los destinos sensibles quedan fuera. |
| Media | Las tarjetas se desplazaban al pasar el puntero, el botón se encogía al pulsarlo y las siluetas de carga pulsaban indefinidamente. | Los desplazamientos decorativos responden a la preferencia del sistema. La silueta hace un ciclo de tres segundos y queda estática mientras termina la carga. |

## Cobertura por recorrido

| Recorrido | Comportamiento |
| --- | --- |
| Inicio | El carrusel conserva los controles manuales. Motion funde las ilustraciones al cambiar de diapositiva. Los dos pasos ilustrados y la imagen de la casa acompañan la lectura al entrar en pantalla. |
| Servicios | Las fichas ilustradas y los cuatro pasos de «¿Cómo pido mi cita?» tienen una entrada breve. El enlace para agendar permanece activo. |
| Cómo funciona | Las ilustraciones de habilitación, comunidad y formación tienen entrada. La cabecera y la foto con información descriptiva conservan su presentación directa. |
| Equipo | La ilustración de presentación tiene entrada. Los nombres, los perfiles y sus controles siguen disponibles para lectura y navegación. |
| Contacto | Los retratos tienen un control propio. Solo la ilustración secundaria de canales tiene entrada por scroll. Los enlaces de contacto y el mapa permanecen estables. |
| Eventos y detalle de evento | Las imágenes disponibles en las tarjetas de agenda tienen entrada. Fecha, lugar, filtros e inscripción están disponibles desde que se renderizan. El cambio de filtro conserva la página. |
| Ayuda inmediata y primeros auxilios | El acceso desde otras páginas es directo. Los teléfonos y las instrucciones quedan fuera de las apariciones por scroll. El orientador y el anclaje avanzan por decisión de la persona. |
| Pedir cita y consulta por enlace | Los campos y errores quedan disponibles al montar el paso. Las entradas del formulario tienen un desplazamiento máximo de 4 px. La consulta, los códigos y las acciones sobre una cita quedan fuera de la transición de ruta. |
| Privacidad, términos, errores y página no encontrada | Se priorizan texto estable, navegación por índice y acciones de recuperación. No se añade movimiento a esos contenidos. |

## Implementación y verificación

- `ImagenEditorial` y `PasoEditorial` conservan la semántica de imagen y lista. Un observador detecta el cruce del borde visible y se desconecta después. No hay manejadores de scroll por fotograma. La limpieza del efecto revierte la animación al desmontar o cambiar la preferencia.
- `TransicionRuta` limita el fundido a rutas informativas y `TransicionSuave` usa CSS para los pasos. El carrusel de portada conserva Motion. La combinación evita animar simultáneamente la primera vista y cada elemento de esa vista.
- En Edge local pasaron cinco pruebas Playwright. Cubren navegación editorial y entrada a ayuda, primera aparición y relectura, control de retratos por teclado, cambio de preferencia en vivo, móvil de 390 px y lectura de Servicios con JavaScript desactivado. El archivo ejecutable es `e2e/movimiento-publico.spec.ts`.
- Queda pendiente medir la fluidez en teléfonos físicos de gama media y observar si el movimiento resulta cómodo con personas que prefieren una interfaz tranquila. La revisión por código y las pruebas funcionales no miden ese resultado.

La regla de diseño es permitir que se desactive el movimiento provocado por la interacción y que se pueda detener un movimiento persistente. [W3C, animación por interacción](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · [Anime.js, uso de Web Animations API](https://animejs.com/documentation/web-animation-api/)
