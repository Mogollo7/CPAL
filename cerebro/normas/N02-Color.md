---
tags: [capl, normas, color]
---

# N02 · Color

Volver a [[N00-Normas-Inicio]]. Ver también [[N02-Color-Propuesta-Psicologia]] y [[N12-Diseno-Confort-y-Neurobienestar]] para la normativa neuro-relajante (regla 60-30-10, tonos salvia/lavanda de baja saturación y micro-textura de papel táctil al 3%). Paleta **alineada con la identidad oficial de Unilasallista** (ajuste del 13-nov-2026): morado y amarillo como principales; aguamarina en menor nivel.

## De dónde sale cada color

Tomados del sitio oficial `unilasallista.edu.co` y de sus piezas gráficas:

| Color oficial | Hex | Dónde lo usa la universidad | Aquí es |
|---------------|-----|-----------------------------|---------|
| Amarillo | `#FFCB05` | Botones principales ("Chatea con un asesor") | `amarillo-500` — **sin cambios** |
| Morado oscuro | `#1B2C65` | Fondos de sección, texto de botones | `morado-900` — **sin cambios** |
| Morado vivo | `#4850C0` | Contorno de titulares en piezas gráficas ("Semilleros") | `morado-600` — **sin cambios** |
| Texto | `#0B1037` | Texto general | `tinta` — **sin cambios** |
| Turquesa | `#16BECF` | Color secundario | `agua-500` — **sin cambios** |

Los cinco colores base son los oficiales tal cual. **Lo único añadido son los tonos claros y oscuros** de cada uno (necesarios para fondos, estados y texto legible) y un fondo crema cálido.

> El morado vivo `#4850C0` se muestreó de la imagen que enviaste; conviene confirmarlo con el manual de marca de la universidad si existe.

## Paleta

### Morado — principal (confianza, identidad)

| Token | Hex | Uso |
|-------|-----|-----|
| `morado-900` | `#1B2C65` | **Oficial.** Títulos, pie de página, tono más oscuro de las ilustraciones |
| `morado-700` | `#343BA0` | Botón principal al pasar el cursor; enlaces |
| `morado-600` | `#4850C0` | **Oficial.** Botón principal, elementos activos |
| `morado-500` | `#6067D6` | Iconos, ilustración |
| `morado-300` | `#A9AEEB` | Ilustración, bordes decorativos |
| `morado-100` | `#E6E8FA` | Fondos de sección, tarjetas suaves |
| `morado-50` | `#F4F5FD` | Fondo alterno muy suave |

### Amarillo — principal (calidez, luz, la "casa amarilla")

| Token | Hex | Uso |
|-------|-----|-----|
| `amarillo-700` | `#8A6100` | Único amarillo permitido **como texto** |
| `amarillo-500` | `#FFCB05` | **Oficial.** Acentos, botón de ayuda, sol y casa en ilustraciones |
| `amarillo-300` | `#FFE066` | Resaltados, ilustración |
| `amarillo-100` | `#FFF5CC` | Fondos de aviso amable, áreas grandes |

### Aguamarina — apoyo (frescura, "todo salió bien")

| Token | Hex | Uso |
|-------|-----|-----|
| `agua-700` | `#0A6E78` | Texto de confirmación |
| `agua-500` | `#16BECF` | **Oficial.** Detalles de ilustración, indicador de éxito |
| `agua-300` | `#8FE0E8` | Ilustración |
| `agua-100` | `#D9F6F9` | Fondo de mensaje de éxito |

### Neutros

| Token | Hex | Uso |
|-------|-----|-----|
| `tinta` | `#0B1037` | **Oficial.** Texto principal (azul casi negro; **nunca `#000`**) |
| `tinta-suave` | `#50557A` | Texto secundario, ayudas |
| `borde` | `#8286A8` | Bordes de campos y controles |
| `crema` | `#FFFBF5` | **Fondo general** (cálido, no blanco frío) |
| `blanco` | `#FFFFFF` | Tarjetas sobre crema |

### Coral — solo para errores

| Token | Hex | Uso |
|-------|-----|-----|
| `coral-700` | `#B23A2E` | Texto e icono de error |
| `coral-100` | `#FDEAE6` | Fondo del mensaje de error |

## Margen de ajuste

El rol A puede mover **los tonos derivados** (50, 100, 300, 500, 700) al diseñar. No se tocan los cinco oficiales. Todo ajuste debe conservar los contrastes mínimos de la tabla de roles y registrarse aquí y en Figma a la vez.

## Proporción

```
60 %  neutros      crema, blanco
25 %  morado       sobre todo 50 y 100; el 600 solo en acciones; el 900 solo en títulos y pie
10 %  amarillo     sobre todo 100 y 300; el 500 solo en acentos
 5 %  aguamarina   detalles e ilustración
```

En una pantalla hay **como máximo un** bloque grande de color saturado. El amarillo 500 en áreas grandes cansa la vista; para superficies se usa 100 o 300.

## Diferencia deliberada con el sitio de la universidad

En `unilasallista.edu.co` el botón principal es **amarillo**. Aquí el botón principal es **morado**, y el amarillo queda reservado para la ayuda inmediata y los acentos. Motivo: el botón "Necesito ayuda ahora" debe ser inconfundible sin recurrir al rojo ([[N01-Principios-de-Bienestar]]), y eso solo funciona si es el único botón amarillo. Se mantiene la familia visual (mismos colores) con otro reparto.

## Roles

| Rol | Fondo | Texto | Contraste |
|-----|-------|-------|-----------|
| Texto normal | `crema` | `tinta` | 17,8 : 1 |
| Texto secundario | `crema` | `tinta-suave` | 7,0 : 1 |
| Título | `crema` | `morado-900` | 12,8 : 1 |
| Botón principal | `morado-600` | `blanco` | 6,6 : 1 |
| Botón principal (cursor) | `morado-700` | `blanco` | 9,2 : 1 |
| Botón secundario | `morado-100` | `morado-700` | 7,6 : 1 |
| Enlace | `crema` | `morado-700` | 8,9 : 1 |
| **Ayuda / emergencia** | `amarillo-500` | `tinta` | 12,1 : 1 |
| Aviso amable | `amarillo-100` | `tinta` | 16,8 : 1 |
| Éxito | `agua-100` | `agua-700` | 5,3 : 1 |
| Error | `coral-100` | `coral-700` | 5,1 : 1 |
| Borde de campo | `crema` | `borde` | 3,4 : 1 |
| Pie de página (único bloque oscuro) | `morado-900` | `amarillo-500` / `blanco` | 8,7 : 1 / 13,2 : 1 |

Todos calculados con la fórmula WCAG 2.x. Mínimos: **4,5 : 1** texto, **3 : 1** bordes de controles e iconos.

## Combinaciones prohibidas

| No | Contraste | En su lugar |
|----|-----------|-------------|
| Texto `amarillo-500` sobre crema o blanco | 1,5 : 1 | `amarillo-700`, o amarillo como fondo con `tinta` encima |
| Texto `agua-500` sobre crema o blanco | 2,2 : 1 | `agua-700` |
| Texto blanco sobre `amarillo-500` o `agua-500` | < 2,3 : 1 | `tinta` o `morado-900` |
| Texto blanco sobre `morado-500` en tamaño normal | 4,8 : 1 (justo) | `morado-600` para botones |
| `#000000` y `#FF0000` en cualquier parte | — | `tinta` y `coral-700` |

## Reglas de uso

1. **El color nunca es la única señal.** Estado de cita, error o éxito llevan además icono y texto.
2. **Morado = acción.** Lo que se puede tocar es morado; lo decorativo no usa `morado-600`.
3. **Amarillo = calidez y ayuda.** El botón "Necesito ayuda ahora" es el único botón amarillo del sitio.
4. **Aguamarina no compite.** Nunca es fondo de sección ni color de botón principal.
5. **Sin degradados** entre colores distintos; a lo sumo entre dos tonos vecinos del mismo color, y solo en fondos.
6. **Sin sombras negras.** Si hace falta profundidad: sombra `morado-900` al 8–12 % de opacidad, muy difusa.
7. **Códigos de emergencia** (dorado, fucsia, blanco…): su color va en una **etiqueta pequeña** dentro de la tarjeta, no como fondo de toda la tarjeta. Los tonos exactos se definen cuando el CAPL confirme los códigos ([[12-Codigos-de-Emergencia-Borrador]]).
8. **Logo de la universidad:** se usa tal cual lo entregue la universidad, sin recolorear, con su zona de respeto.
9. **Logo CAPL (estrella + «CAPL / Unilasallista»):** conserva sus colores propios, que no son tokens de interfaz: `marca-azul` `#1D236D` y `marca-estrella` `#FFB600`. No se recolorea a `morado-900` ni a `amarillo-500`. Dos versiones: sobre fondo oscuro, texto blanco; sobre crema, texto `marca-azul`. La estrella nunca cambia. Original en `contenido/marca/logo-capl-original.png`; falta el SVG oficial.

## Estados de la cita

| Estado | Fondo | Texto | Icono |
|--------|-------|-------|-------|
| Pendiente | `amarillo-100` | `amarillo-700` | reloj redondo |
| Autorizada | `agua-100` | `agua-700` | visto bueno |
| Rechazada / vencida | `coral-100` | `coral-700` | círculo con raya |
| Cancelada | `morado-50` | `tinta-suave` | círculo vacío |
| Atendida | `morado-100` | `morado-700` | corazón |
