---
tags: [capl, normas, accesibilidad, revision]
---

# N09 · Accesibilidad y lista de revisión

Volver a [[N00-Normas-Inicio]]. Desarrolla RNF-ACC de [[03-Requisitos-No-Funcionales]]. Meta: **WCAG 2.2 nivel AA**.

## Mínimos

### Ver

| Norma | Valor |
|-------|-------|
| Contraste de texto | 4,5 : 1 (3 : 1 en texto de 24 px o más, o 19 px en negrilla) |
| Contraste de controles e iconos | 3 : 1 |
| Zoom | Usable al 200 % sin desplazamiento horizontal |
| Reflujo | Usable a 320 px de ancho |
| Color | Nunca es la única señal: siempre con icono o texto |
| Texto en imágenes | Prohibido (salvo logo) |
| Espaciado de texto | El diseño resiste que el usuario aumente interlineado y separación de letras |

### Usar

| Norma | Valor |
|-------|-------|
| Teclado | Todo se puede hacer sin ratón; el orden de tabulación sigue el orden visual |
| Foco | Siempre visible (anillo de 3 px); nunca queda tapado por el encabezado o el botón flotante |
| Objetivo táctil | 48 × 48 px (mínimo absoluto WCAG: 24 × 24) |
| Tiempo | Ninguna acción tiene límite de tiempo; la sesión del panel avisa antes de cerrarse |
| Saltar | Enlace "Saltar al contenido" al inicio |
| Arrastrar | Ninguna función depende de arrastrar o de gestos complejos |
| Movimiento | Se respeta "reducir movimiento" ([[N07-Movimiento]]) |

### Entender

| Norma | Valor |
|-------|-------|
| Idioma | Declarado como español |
| Etiquetas | Todo campo tiene etiqueta visible y asociada |
| Errores | Se dicen en texto, junto al campo, con cómo resolverlos; el foco va al primer error |
| Consistencia | La misma cosa se llama y se ve igual en todo el sitio ([[N08-Lenguaje-y-Tono]]) |
| Ayuda | Los contactos del CAPL están en el mismo lugar en todas las páginas |
| Datos repetidos | No se pide dos veces el mismo dato en un mismo flujo |
| Autocompletar | Nombre, correo y teléfono permiten autocompletado del navegador |

### Compatibilidad

| Norma | Valor |
|-------|-------|
| Estructura | Un solo `h1` por página; títulos en orden, sin saltos |
| Regiones | Encabezado, navegación, contenido principal y pie identificados |
| Imágenes | Texto alternativo si informan; ocultas si decoran |
| Estados | Los mensajes que aparecen (error, éxito, carga) se anuncian a lectores de pantalla |
| Controles propios | Selector de día y hora operable con teclado y lector de pantalla |

## Lista de revisión de un mockup

El rol A la pasa **antes** de marcar un marco como "Listo para desarrollo".

**Bienestar** — [[N01-Principios-de-Bienestar]]
- [ ] Supera la prueba de las 2 a. m. (se entiende en 5 segundos, no presiona)
- [ ] Hay una sola acción principal
- [ ] La ayuda inmediata está visible
- [ ] Se puede volver atrás

**Color** — [[N02-Color]]
- [ ] Solo tokens de la paleta; sin negro ni rojo puros
- [ ] Como máximo un bloque grande saturado
- [ ] Todo texto cumple contraste
- [ ] Ningún estado depende solo del color

**Tipografía** — [[N03-Tipografia-y-Escala-Aurea]]
- [ ] Solo tamaños de la escala; texto de lectura ≥ 1 rem
- [ ] Líneas de 45–75 caracteres
- [ ] Probado con los textos largos de prueba
- [ ] Probado a 320 px sin desbordes

**Forma y espacio** — [[N04-Forma-Espacio-y-Composicion]]
- [ ] Ninguna esquina en punta; radios anidados concéntricos
- [ ] Solo espacios de la escala
- [ ] Objetivos táctiles ≥ 48 px, separados ≥ 10 px
- [ ] Versión de 360 px y de 1280 px

**Ilustración** — [[N05-Ilustracion]]
- [ ] Pasa su propia comprobación
- [ ] Una sola protagonista por pantalla

**Componentes** — [[N06-Componentes-y-Estados]]
- [ ] Todos los estados diseñados (foco, error, deshabilitado, cargando)
- [ ] Pantalla vacía, cargando y con error diseñadas
- [ ] Usa componentes existentes; lo nuevo se añadió a la biblioteca

**Texto** — [[N08-Lenguaje-y-Tono]]
- [ ] Textos reales, no de relleno
- [ ] Botones con verbo + objeto
- [ ] Glosario respetado

## Lista de revisión de una pantalla construida

La pasa quien revisa el PR.

- [ ] Coincide con el mockup en 360 y 1280 px
- [ ] Recorrido completo solo con teclado; foco siempre visible
- [ ] Zoom al 200 % y ancho de 320 px sin desplazamiento horizontal
- [ ] Lighthouse: accesibilidad ≥ 90
- [ ] Probada con lector de pantalla (NVDA o VoiceOver) en el flujo principal
- [ ] Con "reducir movimiento" activado no hay animaciones
- [ ] Sin valores de color, tamaño o espacio escritos a mano ([[N11-Normas-Tecnicas]])
- [ ] Mensajes de error reales, no genéricos

## Prueba con personas (fase 5)

Tres personas ajenas al equipo, desde su propio celular, piden una cita sin ayuda. Se observa: dónde dudan, qué no entienden, cuánto tardan (meta: menos de 3 minutos) y, al final, una sola pregunta: **"¿Cómo te hizo sentir?"**
