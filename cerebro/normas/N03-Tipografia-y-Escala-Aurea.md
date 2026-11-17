---
tags: [capl, normas, tipografia]
---

# N03 · Tipografía y escala áurea

Volver a [[N00-Normas-Inicio]]. Cumple RNF-ACC-07 de [[03-Requisitos-No-Funcionales]]: una sola escala, basada en la proporción áurea, sin controles dinámicos de tamaño y sin desbordes.

## Fuente

| Opción | Carácter | Nota |
|--------|----------|------|
| **Nunito** *(propuesta)* | Terminaciones redondeadas, muy legible, amable sin ser infantil | Libre (OFL), variable, tiene tildes y ñ |
| Quicksand (solo títulos) + Nunito (texto) | Más "adorable" en titulares | Quicksand es fina: no usar por debajo de peso 600 |
| Google Sans | La de labs.google | **Verificar licencia antes de usarla**; históricamente era de uso exclusivo de Google |
| Roboto | La del sitio oficial de Unilasallista | Libre. Máxima coherencia con la universidad, pero es recta y neutra: pierde el carácter redondo y tierno |

Decide el rol A. Sea cual sea: **una sola familia** (dos como máximo), alojada en el propio servidor, con respaldo `system-ui, sans-serif`.

Pesos permitidos: **400** texto · **600** énfasis y botones · **800** títulos. Sin cursiva para párrafos; sin peso menor a 400.

## Escala estándar oficial de trabajo (32 · 20 · 16 · 13 px)

Para máxima claridad en Figma y rapidez en desarrollo, el diseño del sitio se organiza en **4 tamaños principales estándar**:

| Tamaño | Equivalente rem | Rol | Clases Tailwind | Uso |
|---|---|---|---|---|
| **32 px** | `2.0 rem` | Título principal / `h1` | `text-[32px]` / `text-2xl` | Titulares de sección, encabezados de pantalla y hero |
| **20 px** | `1.25 rem` | Subtítulo / `h2` / `h3` | `text-[20px]` / `text-xl` | Nombres de tarjetas, bloques destacados, preguntas de formulario |
| **16 px** | `1.0 rem` | Texto base / cuerpo (`p`) | `text-[16px]` / `text-base` | Párrafos generales, inputs de texto, botones principales |
| **13 px** | `0.8125 rem` | Texto pequeño / apoyo (`caption`) | `text-[13px]` / `text-xs` | Leyendas, notas al pie, fecha de última revisión, avisos de campo |

Para pantallas amplias o elementos fluidos, se aplica la escala áurea continua que ajusta los tamaños según el ancho de la pantalla:

## La escala áurea detallada (fluidos)

Base **1 rem = 16 px**. Razón **φ = 1,618**; se usa su raíz (**√φ = 1,272**) como medio paso para que los saltos no sean bruscos.

| Paso | rem | px | Cálculo |
|------|-----|----|---------|
| −1 | 0,786 | 12,6 | 1 ÷ 1,272 |
| 0 | 1,000 | 16,0 | base |
| 1 | 1,272 | 20,4 | × √φ |
| 2 | 1,618 | 25,9 | × φ |
| 3 | 2,058 | 32,9 | × φ·√φ |
| 4 | 2,618 | 41,9 | × φ² |
| 5 | 3,330 | 53,3 | × φ²·√φ |
| 6 | 4,236 | 67,8 | × φ³ |
| 8 | 6,854 | 109,7 | × φ⁴ — **solo `display-hero`** |

No existe ningún tamaño fuera de esta tabla.

## Roles (móvil → escritorio)

Cada rol crece de forma continua entre 360 px y 1280 px de ancho. Se escriben en `rem + vw` para que el zoom del navegador siga funcionando.

| Rol | Móvil | Escritorio | Valor | Peso | Interlineado |
|-----|-------|-----------|-------|------|--------------|
| `display` | paso 4 | paso 6 | `clamp(2.618rem, 1.985rem + 2.815vw, 4.236rem)` | 800 | 1,272 |
| `h1` | paso 3 | paso 5 | `clamp(2.058rem, 1.558rem + 2.217vw, 3.330rem)` | 800 | 1,272 |
| `h2` | paso 2 | paso 4 | `clamp(1.618rem, 1.227rem + 1.739vw, 2.618rem)` | 800 | 1,272 |
| `h3` | paso 1 | paso 3 | `clamp(1.272rem, 0.965rem + 1.364vw, 2.058rem)` | 800 | 1,272 |
| `h4` | paso 1 | paso 2 | `clamp(1.272rem, 1.136rem + 0.603vw, 1.618rem)` | 600 | 1,272 |
| `texto-grande` | paso 0 | paso 1 | `clamp(1rem, 0.894rem + 0.473vw, 1.272rem)` | 400 | 1,618 |
| `texto` | paso 0 | paso 0 | `1rem` | 400 | 1,618 |
| `nota` | paso −1 | paso −1 | `0.786rem` | 600 | 1,618 |

- **Interlineado:** 1,618 (φ) en párrafos; 1,272 (√φ) en títulos.
- `display` se usa **una vez** por página, y solo en portadas.
- `display-hero` (110 px escritorio · 42 px móvil, peso 800, interlineado 1,18) existe **solo** para el título del hero carrusel de Inicio, que copia la distribución de labs.google. El título debe ser de una o dos palabras («Respira», «Tu cita», «En grupo») para caber entre las tarjetas flotantes.
- `nota` solo para etiquetas y pies; nunca para información que la persona necesita leer (horarios, líneas de ayuda, instrucciones).
- El texto de lectura **nunca** baja de 1 rem.

## Reglas de lectura

| Regla | Valor |
|-------|-------|
| Ancho de línea | 45–75 caracteres (`max-width: 65ch`) |
| Alineación | Izquierda. Centrado solo en títulos cortos y mensajes de 1–2 líneas. Nunca justificado |
| Separación entre párrafos | 1 rem × 1,618 |
| Mayúsculas sostenidas | Prohibidas (salvo siglas: CAPL) |
| Subrayado | Solo enlaces |
| Negrilla | Máximo una idea por párrafo |
| Números de teléfono y horas | Peso 600, nunca partidos en dos líneas |

## Reglas anti-desborde

Estas son las que garantizan que nada se corte entre 320 px y 1920 px y con zoom al 200 %.

1. **Ningún contenedor de texto tiene alto fijo.** Solo alto mínimo.
2. **Ningún ancho fijo en px** para bloques de texto; se usan porcentajes, `ch` y máximos.
3. Todo texto puede partirse: `overflow-wrap: anywhere` en contenido que escribe el usuario (correos, nombres largos).
4. Los títulos usan equilibrio de líneas (`text-wrap: balance`) para no dejar palabras huérfanas.
5. En filas flexibles, el elemento de texto lleva `min-width: 0` para poder encogerse.
6. **Los botones crecen con su texto** y pueden ocupar dos líneas; jamás se recorta con puntos suspensivos una acción.
7. Puntos suspensivos solo en listas del panel, y siempre con el texto completo accesible.
8. Imágenes e ilustraciones: `max-width: 100 %`, alto automático.
9. Las tablas del panel se convierten en tarjetas apiladas en móvil; no hay desplazamiento horizontal.
10. **Diseñar con el texto más largo real**, no con texto de relleno corto.

## Textos de prueba para los mockups

Todo componente se prueba en Figma con estos casos:

| Caso | Ejemplo |
|------|---------|
| Nombre largo | María Fernanda de los Ángeles Restrepo Montoya |
| Correo largo | maria.fernanda.restrepo.montoya@unilasallista.edu.co |
| Servicio largo | Certificación de mascotas de apoyo emocional |
| Título largo | Orientación vocacional y proyecto de vida para estudiantes de grado once |
| Botón largo | Reprogramar mi cita para otro día |
| Vacío | Sin citas, sin eventos, sin foto |
| Ancho mínimo | Marco de 320 px |
