---
tags: [capl, normas, tokens, figma]
---

# N10 · Tokens y Figma

Volver a [[N00-Normas-Inicio]]. Los **tokens** son los nombres compartidos de cada color, tamaño y espacio. Son el puente entre Figma (rol A) y el código (roles B y C): si el nombre es el mismo en los dos lados, el diseño pasa a código sin reinterpretarse.

> 🎨 **Archivo oficial de diseño en Figma:**  
> [https://www.figma.com/design/uTlCaNxTW25BblEcKFOOUF/psicologia?node-id=0-1](https://www.figma.com/design/uTlCaNxTW25BblEcKFOOUF/psicologia?node-id=0-1)

## Regla de oro

> **En una pantalla no existe ningún valor suelto.** Todo color, tamaño, espacio, radio y duración es un token. Si hace falta un valor nuevo, primero se crea el token (aquí y en Figma) y después se usa.

## Dos niveles

| Nivel | Qué es | Ejemplo | Quién lo usa |
|-------|--------|---------|--------------|
| **Base** | El valor en sí | `morado-600` = `#4850C0` | Solo los tokens de rol |
| **Rol** | Para qué sirve | `accion-fondo` = `morado-600` | Los componentes y pantallas |

Los componentes usan **tokens de rol**. Así, si mañana el botón principal pasa a otro morado, se cambia en un solo lugar.

## Tokens base

Definidos en: color → [[N02-Color]] · tipografía → [[N03-Tipografia-y-Escala-Aurea]] · radios y espacio → [[N04-Forma-Espacio-y-Composicion]] · movimiento → [[N07-Movimiento]].

| Grupo | Nombres |
|-------|---------|
| Color | `morado-50…900` · `amarillo-100…700` · `agua-100…700` · `coral-100`, `coral-700` · `tinta`, `tinta-suave`, `borde`, `crema`, `blanco` |
| Tamaño estándar de texto | `32px` (`h1`), `20px` (`h2`), `16px` (`p` / base), `13px` (`caption` / nota) |
| Retícula de diseño (grid) | `grid-12` (escritorio), `grid-8` (tableta), `grid-4` (móvil) |
| Peso | `peso-normal` (400), `peso-medio` (600), `peso-fuerte` (800) |
| Interlineado | `linea-texto` (1,618), `linea-titulo` (1,272) |
| Espacio | `espacio-1` … `espacio-9` |
| Radio | `radio-s`, `radio-m`, `radio-l`, `radio-xl`, `radio-pildora`, `radio-circulo` |
| Movimiento | `mov-rapido`, `mov-medio`, `mov-lento`, `curva-entrada`, `curva-salida` |
| Sombra | `sombra-flotante` |
| Quiebre | `sm` (600), `md` (900), `lg` (1200) |

## Tokens de rol

| Token de rol | Apunta a |
|--------------|----------|
| `fondo-pagina` | `crema` |
| `fondo-superficie` | `blanco` |
| `fondo-suave` | `morado-50` |
| `fondo-seccion` | `morado-100` |
| `texto-principal` | `tinta` |
| `texto-secundario` | `tinta-suave` |
| `texto-titulo` | `morado-900` |
| `texto-enlace` | `morado-700` |
| `accion-fondo` | `morado-600` |
| `accion-fondo-activo` | `morado-700` |
| `accion-texto` | `blanco` |
| `accion-suave-fondo` | `morado-100` |
| `accion-suave-texto` | `morado-700` |
| `ayuda-fondo` | `amarillo-500` |
| `ayuda-texto` | `tinta` |
| `aviso-fondo` / `aviso-texto` | `amarillo-100` / `tinta` |
| `exito-fondo` / `exito-texto` | `agua-100` / `agua-700` |
| `error-fondo` / `error-texto` | `coral-100` / `coral-700` |
| `borde-control` | `borde` |
| `borde-suave` | `morado-100` |
| `foco` | `morado-600` |

## Organización en Figma

| Página | Contenido |
|--------|-----------|
| 0 · Portada | Estado del archivo y enlace a este cerebro |
| 1 · Fundamentos | Variables: color, tipografía, espacio, radios |
| 2 · Componentes | Biblioteca, cada pieza con todos sus estados |
| 3 · Ilustraciones | Motivos, personajes, gama de pieles, viñetas |
| 4 · Sitio público | Mockups 360 y 1280 |
| 5 · Formulario de cita | Flujo completo paso a paso |
| 6 · Panel | Admin y psicólogo |
| 7 · Correos | Plantillas |
| 8 · Archivo | Descartes y exploraciones |
| Biblioteca Wireframe | Kit de baja fidelidad para armar distribuciones (ver abajo) |
| Biblioteca de imágenes | Imágenes de referencia con ID `IMG-NN` para los wireframes |

### Biblioteca Wireframe CAPL (vigente)

Página **Biblioteca Wireframe** del archivo de Figma: 100 componentes (más 37 variantes) en grises de baja fidelidad, con el prefijo `WF/` en el panel Assets. Los colores salen de la colección de variables `wireframe` (`wf-fondo`, `wf-superficie`, `wf-suave`, `wf-medio`, `wf-fuerte`, `wf-borde`, `wf-sobre-fuerte`, `wf-nota`, `wf-marcador`…), que tiene dos modos: **claro** y **oscuro**. Para pasar un marco a oscuro, cámbiale el modo de la colección `wireframe`.

| Sección | Componentes |
|---------|-------------|
| 00 · Anotaciones | `Anotación/Nota`, `Marcador`, `Marcador-con-texto`, `Zona`, `Ref-imagen`, `Flecha`, `Estado` · ejemplo de uso anotado |
| 01 · Marcos y plantillas | Plantillas para duplicar: Web 1440, Tableta 768, Móvil 390 · `Sistema/Barra-estado-móvil`, `Indicador-inicio`, `Barra-navegador` |
| 02 · Navegación | Barra web, barra flotante, barra móvil, barra con volver, pestañas móviles, dock, pestañas de segmento y subrayadas, migas, paginación, pasos (web y móvil), menú lateral, menú desplegable, pie web y móvil, `Controles-carrusel`, `Redes-sociales` |
| 03 · Texto | Títulos H1–H3, antetítulo, párrafos de 2, 3 y 5 líneas, párrafo centrado, listas de viñetas y de verificación, cita, bloque de título, `Título-real` y `Párrafo-real` (con el texto exacto) |
| 04 · Botones | `Botón` (Primario, Secundario, Contorno y Fantasma, en L, M y S), botón con icono, `Botón-icono` (48, 40 y 32), enlace con flecha, grupo de botones, botón flotante, `Botón-emergencia` |
| 05 · Formularios | Campo de texto (Normal, Foco, Error y Deshabilitado), área de texto, selector, buscador, casilla, radio, interruptor, deslizador, chip, `Selector-fecha`, `Franjas-horarias`, subir archivo, código de verificación |
| 06 · Medios | Imágenes 16:9, 4:3, 1:1, 3:4, 9:16, 21:9 y circular, avatar (32–96), grupo de avatares, icono (16–32), video, reproductor de audio, logo, fila de logos, mapa, galería |
| 07 · Tarjetas | Imagen arriba, horizontal, servicio, perfil, evento, testimonio, cifra, bento alta y ancha, vidrio, fila de lista, `Fila-cita`, `Imagen-con-texto` |
| 08 · Avisos | Alerta (4 tipos), `Banner-emergencia`, toast, modal, modal de confirmación, hoja inferior, estado vacío, esqueleto, barra y círculo de progreso, tooltip, insignia |
| 09 · Datos | Tabla, gráficos de barras, línea y dona, acordeón, `Agenda-semana`, línea de tiempo, lista dato–valor |
| 10 · Secciones web | Bloques de 1200 px: 3 heroes, servicios, bento, pasos, CTA, FAQ, testimonios, equipo, cifras, eventos, formulario de contacto, mapa y contacto, encabezado de panel, panel de escritorio |
| 11 · Secciones móviles | Bloques de 390 px: hero, carrusel, servicios, lista, formulario de cita, banner de emergencia, CTA, FAQ, perfil, lista de citas |
| 12 · Privacidad y consentimiento | Patrones calmos sin sobrecarga: `WF/Privacidad/Aviso-Sereno-Cookies-Web`, `Aviso-Sereno-Cookies-Mobile`, `2FA-Recordar-Dispositivo`, `Consentimiento-Tratamiento-Datos-Cita`, `Micro-Informativo-Footer` |

Los botones, campos, chips, notas y marcadores tienen texto editable desde el panel de propiedades de la instancia.

#### Privacidad, Cookies y Consentimiento Calmo (Neurobienestar)

En CAPL no se utilizan modales bloqueantes de cookies ni rastreadores de terceros (`RNF-PRI-08`, `S07 §2`). En `Page 1` (al lado de `Notas · Wireframe - 1`, en `x: 2000, y: 0`) se incorporó el tablero `❖ PRIVACIDAD, COOKIES & CONSENTIMIENTO CALMO` con los componentes atómicos:
- **`WF/Privacidad/Aviso-Sereno-Cookies-Web`**: Píldora flotante inferior no bloqueante (680 px) con escudo sutil, texto que transmite tranquilidad, enlace a la política y botón píldora *"Entendido"*.
- **`WF/Privacidad/Aviso-Sereno-Cookies-Mobile`**: Formato adaptado a 360 px para dispositivos móviles, flotante y sin obstruir el botón fijo de ayuda inmediata.
- **`WF/Privacidad/2FA-Recordar-Dispositivo`**: Checkbox para el formulario de login `/ingresar` con explicación transparente sobre el almacenamiento de la cookie de confianza de 30 días para administradores.
- **`WF/Privacidad/Consentimiento-Tratamiento-Datos-Cita`**: Bloque para el Paso 5 de `/pedir-cita` con autorización explícita para la gestión clínica (Ley 1581 / Habeas Data) sin cláusulas ocultas.
- **`WF/Privacidad/Micro-Informativo-Footer`**: Barra discreta para el pie de página de todo el sitio web recordando que el entorno es 100% libre de rastreadores y analítica invasiva.

#### Del wireframe al mockup

Ejemplo armado: el marco `Wireframe - 1 · labs.google (prueba de biblioteca)` en Page 1 reproduce la portada de labs.google solo con piezas `WF/`, con sus notas al lado.


1. **Armar:** duplica una plantilla de la sección 01 y apila dentro las secciones (10 u 11) o los componentes sueltos.
2. **Numerar:** pon un `Anotación/Marcador` sobre cada zona que necesite explicación (1, 2, 3…).
3. **Explicar:** junto al marco, una `Anotación/Nota` por número, con el título «NOTA n · zona» y, en el texto, el contenido exacto, el comportamiento o la idea.
4. **Imágenes:** pega cada imagen de referencia en la página **Biblioteca de imágenes**, en una casilla renombrada `IMG-NN · descripción`. En el wireframe pon un `Anotación/Ref-imagen` con el mismo ID.
5. **Entregar:** marca el marco con `Anotación/Estado` = «LISTO PARA MOCKUP» y pasa el enlace del marco a Claude. Con eso, Claude lee la distribución por los nombres `WF/…`, las notas por número y las imágenes por ID, y monta el mockup con los tokens de rol de esta nota.

Normas:

1. **Variables de Figma** con los mismos nombres de esta nota, en dos colecciones: `base` y `rol`.
2. **Estilos de texto** con los nombres de rol (`h1`, `texto`…), no "Título grande 2".
3. **Componentes con variantes** por tipo y estado; nombres en español, iguales a [[N06-Componentes-y-Estados]].
4. **Diseño automático** (auto layout) en todo, con espacios de la escala: es lo que permite comprobar que nada se desborda al alargar un texto.
5. Capas con nombre; nada de "Frame 427".
6. Un marco pasa a desarrollo solo cuando superó la lista de [[N09-Accesibilidad-y-Revision]] y está marcado **"Listo para desarrollo"**.
7. Los cambios posteriores a un marco ya entregado se anotan con un comentario y se avisan al equipo.

## Cómo llegan al código

```
Figma (variables)  →  archivo de tokens  →  hoja de estilos / configuración  →  componentes
```

- Un solo archivo de tokens en el repositorio es la fuente para el código; se genera o se copia desde las variables de Figma.
- **Figma manda sobre el diseño; el archivo de tokens manda sobre el código.** Si difieren, se corrige el que esté mal y se deja constancia en el PR.
- Cambiar un token base es un PR propio, revisado por A.

## Nombres

- En español, minúsculas, con guion: `espacio-5`, `accion-fondo`.
- Sin tildes ni ñ en nombres técnicos (`pildora`, `circulo`).
- Nunca el valor en el nombre (`morado-oscuro` no; `morado-700` sí) ni el lugar de uso en un token base (`color-boton` no).
