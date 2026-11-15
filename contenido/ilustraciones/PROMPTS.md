# Prompts de ilustración · CAPL

Cada hueco `ILU-NN` del archivo de Figma (página **CAPL · Diseño y prototipo**) tiene aquí su prompt completo. El ID, el nombre de archivo y el prompt corto también aparecen dentro del hueco en Figma.

## Antes de generar: lee la teoría

El agente o la persona que genere las ilustraciones debe leer primero estas normas (rama `dev/sebas`):

| Norma | Enlace |
|-------|--------|
| N05 · Ilustración (estilo, anatomía, motivos, prohibidos) | https://github.com/Mogollo7/CPAL/blob/dev/sebas/cerebro/normas/N05-Ilustracion.md |
| N02 · Color (paleta oficial y proporción) | https://github.com/Mogollo7/CPAL/blob/dev/sebas/cerebro/normas/N02-Color.md |
| N12 · Confort y neurobienestar | https://github.com/Mogollo7/CPAL/blob/dev/sebas/cerebro/normas/N12-Diseno-Confort-y-Neurobienestar.md |
| N07 · Movimiento (si la ilustración se anima) | https://github.com/Mogollo7/CPAL/blob/dev/sebas/cerebro/normas/N07-Movimiento.md |
| Láminas de referencia | https://github.com/Mogollo7/CPAL/tree/dev/sebas/cerebro/normas/referencias-ilustracion |
| Muestras ya generadas | https://github.com/Mogollo7/CPAL/tree/dev/sebas/contenido/ilustraciones/muestras-generadas |

## Bloque de estilo (pégalo antes de cada prompt)

```
Ilustración vectorial plana editorial (flat editorial), baja fatiga visual, sensación de hogar y calma.
Bloques de color planos y desaturados + líneas finas de acento en tinta morada oscura (#1B2C65), trazos con extremos redondeados.
Paleta: lavandas suaves (#E6E8FA, #A9AEEB), aguamarina/salvia suave (#D9F6F9, #8FE0E8), amarillo miel (#FFF5CC, #FFE066, acento #FFCB05), fondo crema (#FFFBF5).
Proporción: 60 % aire/fondo crema, 30 % lavanda y aguamarina, 10 % miel y trazo.
Personas: hombros relajados, ropa cómoda de casa, ojos en arco sereno, mejillas circulares, sombra limpia bajo el mentón, piel en gama cálida y diversa.
Contención libre: sobre manchas orgánicas suaves, alfombra o sillón; sin marcos rígidos.
SIN: negro puro, degradados, 3D, texto dentro de la imagen, cerebros, nubes negras, pastillas, batas, personas llorando o encogidas, colores neón.
Fondo transparente o crema plano. Sin grano dentro del archivo (la textura de papel la pone el CSS).
```

## Entrega

- Formato SVG (WebP/PNG solo en prototipos), con `viewBox`, sin ancho ni alto fijos.
- Peso: viñeta < 30 KB, escena < 80 KB.
- Carpeta: `contenido/ilustraciones/` con el nombre exacto de la tabla.
- Proporción: escena 1,618 : 1 (o 16 : 9) · viñeta 1 : 1.

## Catálogo

| ID | Archivo | Tipo | Dónde va | Prompt |
|----|---------|------|----------|--------|
| ILU-01 | `ilu-escena-portada-sillon.svg` | Escena | Hero diapositiva 1 (Inicio) | Persona joven sentada en un sillón redondo con una taza tibia entre las manos; un gato duerme enroscado en un cojín; ventana con luz miel de atardecer; planta de hojas redondas. |
| ILU-02 | `ilu-escena-camino-cita.svg` | Escena | Hero diapositiva 2 | Dos personas caminan sin prisa por un sendero de hojas redondas hacia una casa amarilla con ventana iluminada. |
| ILU-03 | `ilu-escena-taller-grupo.svg` | Escena | Hero diapositiva 3 · cabecera de Eventos | Grupo pequeño y diverso sentado en círculo sobre una alfombra tejida, con tazas tibias y una planta al centro. |
| ILU-04 | `ilu-vineta-paso-pedir.svg` | Viñeta | Paso 1 (Inicio, Cómo funciona) | Manos sosteniendo un teléfono con calma, junto a una hoja redonda. |
| ILU-05 | `ilu-vineta-paso-confirmar.svg` | Viñeta | Paso 2 | Sobre de carta abierto con una hojita y un visto suave en aguamarina. |
| ILU-06 | `ilu-vineta-paso-asistir.svg` | Viñeta | Paso 3 | Puerta de la casa amarilla abierta, luz cálida adentro y un tapete redondo. |
| ILU-07 | `ilu-vineta-individual.svg` | Viñeta | Servicio · Psicología individual | Dos tazas tibias sobre una mesa baja, dos cojines enfrentados. |
| ILU-08 | `ilu-vineta-pareja.svg` | Viñeta | Servicio · Pareja | Dos personas sentadas en un sofá redondo, conversando tranquilas. |
| ILU-09 | `ilu-vineta-infantil.svg` | Viñeta | Servicio · Infancia y familia | Niña sentada en una alfombra junto a un perro tranquilo con ojos en arco. |
| ILU-10 | `ilu-vineta-vocacional.svg` | Viñeta | Servicio · Orientación vocacional | Persona con una libreta junto a una planta que crece en su maceta. |
| ILU-11a | `ilu-escena-taller-sueno.svg` | Escena | Evento · Dormir mejor | Lámpara de luz cálida, almohada mullida y una taza junto a la cama. |
| ILU-11b | `ilu-escena-charla-examenes.svg` | Escena | Evento · Ansiedad en exámenes | Persona con libreta y planta, respirando tranquila junto a una ventana. |
| ILU-11c | `ilu-escena-grupo-apoyo.svg` | Escena | Evento · Grupo de duelo | Dos manos sostienen una taza; un ave pequeña posada cerca. |
| ILU-11d | `ilu-escena-tiempo.svg` | Escena | Evento · Organizar mi tiempo | Agenda abierta, taza y reloj de pared redondo. |
| ILU-11e | `ilu-escena-cuidar.svg` | Escena | Evento · Cuidar a quien cuida | Dos personas comparten una manta en un sofá. |
| ILU-11f | `ilu-escena-respiracion.svg` | Escena | Evento · Círculo de respiración | Persona sentada en un cojín, hojas que se mecen alrededor. |
| ILU-12 | `ilu-vineta-gatos-apoyo.svg` | Viñeta | Servicio · Mascotas de apoyo | Ya existe muestra en `muestras-generadas/`; vectorizar respetando N05. |
| ILU-13 | `ilu-escena-emergencia-manos.svg` | Escena | Aviso de Inicio · Ayuda inmediata | Una mano tendida que sostiene otra, con luz miel. Mostrar apoyo cálido, nunca el daño. |
| ILU-14 | `ilu-escena-confirmacion-casa.svg` | Escena | Confirmación de cita e inscripción | Casa amarilla con ventana iluminada y un ave pequeña en el tejado. |
| ILU-15 | `ilu-vineta-vacio-eventos.svg` | Viñeta | Estado vacío de Eventos | Gato dormido junto a un calendario de pared y una taza. |
| ILU-16 | `ilu-escena-contacto-casa.svg` | Escena | Contacto | Fachada de la casa amarilla con árbol, banca y luz de tarde. |
| ILU-17 | `ilu-vineta-sin-conexion.svg` | Viñeta | Sin conexión | Persona leyendo con una lámpara cálida junto a una ventana con una nube suave (sin tormenta). |
| ILU-18 | `ilu-vineta-404.svg` | Viñeta | Página no encontrada | Gato que se asoma con curiosidad desde una caja, junto a un camino de hojas. |
| ILU-19 | `ilu-vineta-bienvenida-equipo.svg` | Viñeta | Crear contraseña | Llave sobre un cojín con una hoja redonda y una taza al lado. |
| ILU-20 | `ilu-escena-equipo.svg` | Escena | Cómo funciona · Equipo | Docente y estudiante conversando sentados, con libretas y una planta. |
| ILU-21 | `ilu-vineta-cookies.svg` | Viñeta | Aviso de cookies (popup) | Taza tibia con una galleta redonda sobre un plato. |
| ILU-22 | `ilu-escena-dos-tazas.svg` | Escena | Cabecera de Cómo funciona | Dos tazas tibias en una mesa baja junto a una ventana con luz miel. |
| ILU-23 | `ilu-vineta-neuropsicologia.svg` | Viñeta | Servicio · Neuropsicología | Libro abierto, hojas redondas y una lámpara cálida. Sin cerebros. |
| ILU-24 | `ilu-vineta-respiracion.svg` | Viñeta | Ayuda inmediata · Respira conmigo | Círculo de hojas salvia que se abre y se cierra; persona sentada en un cojín. Pensada para animarse con anime.js (escala 4 s / 6 s). |
| ILU-25 | `ilu-vineta-error-calmo.svg` | Viñeta | Algo falló | Planta en maceta con una hoja caída y una regadera cerca, tono sereno. |

## Animación (opcional)

Solo **una** ilustración animada por pantalla, en bucle de 6 s o más, con anime.js, y se detiene con `prefers-reduced-motion`. Candidatas: ILU-01 (vapor de la taza / cola del gato), ILU-14 (ave), ILU-22 (vapor), ILU-24 (respiración). Para animar, separa en grupos SVG con `id` las partes que se mueven (`#vapor`, `#cola`, `#hojas`).
