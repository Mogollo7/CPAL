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

### Kit de Componentes Wireframe Atómico (Google Labs x CAPL)

Disponible en el archivo oficial de Figma para que Sebas arme la distribución y arquitectura de pantallas antes del mockup final:
1. **01 · Textos & Tipografía Wireframe:** Barras píldora `WF/Text/Title-H1-Bar` (32px), `Title-H2-Bar` (22px), `Subtitle-Bar` (16px), y bloques multilínea `Paragraph-2-Lines`, `Paragraph-3-Lines`, `Paragraph-4-Lines`.
2. **02 · Botones & Acciones:** Píldoras `WF/Button/Primary-Pill`, `Secondary-Pill`, `Outline-Pill`, `Glassmorphic-Blur-Pill` (`BACKGROUND_BLUR: 20px`), botones circulares `Circle-Action-44` / `32` y badges de estado (`Tag-Dark`, `Tag-Lavender`, `Tag-Sage`, `Tag-Honey`).
3. **03 · Inputs & Formularios:** `WF/Input/Search-Bar-Pill` con `⌘K`, `Text-Field-Standard`, `Toggle-Switch` y `Slider-Bar`.
4. **04 · Medios & Placeholders:** `WF/Media/Placeholder-Image-16:9`, `Placeholder-Image-Square-1:1`, `Avatar-Individual-44`, `Avatar-Cluster-Group` y `Audio-Disc-Player-Widget`.
5. **05 · Tarjetas & Contenedores:** `WF/Card/Container-Blank-Base` (340x320 con esquinas squircle 0.6 para armar dentro), `Container-Glassmorphic-Blur` (`BACKGROUND_BLUR: 24px`, fondo al 72%), `Bento-Vertical-Content` y `Horizontal-List-Row`.
6. **06 · Navegación & Estructuras:** `WF/Shell/Browser-Window-Bar` (con controles `● ● ●` y URL pill), `Floating-Navbar-Web` (con logo y menú de píldoras), `Floating-Dock-Pill` y carcasa completa `Mobile-Device-Frame-390` (con Dynamic Island y barra de estado).
7. **Lienzo de Trabajo:** El marco `Wireframe - 1 · Lienzo de Trabajo de Sebas` queda 100% limpio y despejado para copiar y pegar los componentes y ensamblar la distribución deseada.

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
