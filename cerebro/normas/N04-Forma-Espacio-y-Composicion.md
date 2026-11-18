---
tags: [capl, normas, forma, espacio]
---

# N04 · Forma, espacio y composición

Volver a [[N00-Normas-Inicio]]. Curvas elegantes y mucho aire. Todas las medidas salen de la misma proporción áurea que la tipografía ([[N03-Tipografia-y-Escala-Aurea]]).

## Forma: todo es curvo

**Regla madre: ninguna esquina visible termina en punta.**

| Token | Valor | Uso |
|-------|-------|-----|
| `radio-s` | 10 px | Etiquetas, casillas, campos pequeños |
| `radio-m` | 16 px | Campos de formulario, tarjetas pequeñas |
| `radio-l` | 26 px | Tarjetas, bloques de contenido |
| `radio-xl` | 42 px | Secciones, imágenes destacadas, modales |
| `radio-pildora` | 9999 px | **Todos los botones**, etiquetas de estado, buscador |
| `radio-circulo` | 50 % | Fotos de perfil, iconos con fondo |

Reglas:

1. **Radio anidado:** el radio interior = radio exterior − relleno. Una tarjeta `radio-l` (26) con relleno 16 contiene elementos `radio-s` (10). Así las curvas son concéntricas y se ven elegantes, no "infladas".
2. **Botones siempre píldora.** Fotos de personas siempre en círculo.
3. Las secciones se separan con **cambio de fondo y borde superior curvo** (`radio-xl`) o con una onda suave; nunca con líneas rectas duras.
4. **Formas orgánicas de fondo** ("manchas"): construidas con círculos y elipses fusionados, sin puntas, en tonos 50/100. Máximo dos por pantalla y nunca detrás de texto largo.
5. Líneas divisorias: evitarlas. Si hacen falta, 1 px en `morado-100`, con extremos redondeados.
6. **Elegancia = contención.** Las curvas son amplias y pocas. Si una pantalla parece de juguete, sobran formas: se quitan, no se achican.

### Trazo de iconos

| Propiedad | Valor |
|-----------|-------|
| Estilo | Línea, extremos y uniones **redondeados** |
| Grosor | 2 px en 24 px (proporcional en otros tamaños) |
| Color | Hereda del texto (`tinta`, `morado-600`…); nunca negro |
| Tamaños | 16 · 26 · 42 px |
| Familia | Una sola en todo el sitio (p. ej. Phosphor o Lucide, variante redondeada) |
| Regla | Todo icono funcional lleva texto al lado; solo se omite en acciones universales (cerrar, menú) y con etiqueta accesible |

## Espacio

Escala por φ desde 16 px:

| Token | px | Uso típico |
|-------|----|-----------|
| `espacio-1` | 4 | Entre icono y texto |
| `espacio-2` | 6 | Ajustes finos |
| `espacio-3` | 10 | Entre etiqueta y campo; separación mínima entre objetivos táctiles |
| `espacio-4` | 16 | Relleno de campos y tarjetas pequeñas |
| `espacio-5` | 26 | Relleno de tarjetas; entre campos del formulario |
| `espacio-6` | 42 | Entre bloques dentro de una sección |
| `espacio-7` | 68 | Entre secciones (móvil) |
| `espacio-8` | 110 | Entre secciones (escritorio) |
| `espacio-9` | 178 | Aire de portada |

Reglas:

1. Solo se usan estos valores. Si un espacio "no cuadra", se sube o baja un paso; no se inventa otro.
2. **Lo relacionado, cerca; lo distinto, lejos:** el espacio entre grupos es al menos un paso mayor que el espacio dentro del grupo.
3. Ante la duda, **más aire**. La densidad se reserva para las tablas del panel.

## Retícula y anchos (Guías oficiales de diseño)

| Dispositivo | Columnas | Separación (gutter) | Margen lateral | Ancho |
|-------------|----------|---------------------|----------------|-------|
| **Escritorio (Desktop)** | **12 columnas** | 26 px (`espacio-5`) | 42 px (`espacio-6`) | máx. 1200 px centrado |
| **Tableta (Tablet)** | **8 columnas** | 16 px (`espacio-4`) | 26 px (`espacio-5`) | fluido (600 a 899 px) |
| **Móvil (Mobile)** | **4 columnas** | 10 px (`espacio-3`) | 16 px (`espacio-4`) | fluido (320 a 599 px) |

Reglas de la retícula:
- **En Figma:** Cada página tiene configuradas las guías de columnas (12 para desktop 1280px, 8 para tablet 768px, 4 para móvil 360px).
- **En Tailwind:** Usar `grid-cols-4 md:grid-cols-8 lg:grid-cols-12`.
- Columna de lectura para texto largo: máx. 65 caracteres (`max-w-prose`).
- Formulario de cita: una sola columna, máx. 560 px centrado.

### Puntos de quiebre

| Nombre | Desde | Diseño |
|--------|-------|--------|
| base | 320 px | Una columna; es el diseño de partida |
| `sm` | 600 px | Tarjetas en 2 columnas |
| `md` | 900 px | Navegación completa; división áurea |
| `lg` | 1200 px | Ancho máximo |

Se diseña **primero el móvil** (360 px) y luego se amplía. Mockups obligatorios: 360 y 1280; 320 solo como prueba de desborde.

## Proporción áurea en la composición

| Dónde | Cómo |
|-------|------|
| Sección de dos columnas | **61,8 % / 38,2 %** (texto / ilustración) |
| Portada | El texto ocupa el 61,8 %; la ilustración el 38,2 % |
| Tarjeta con imagen | La imagen ocupa el 38,2 % del alto |
| Imágenes | Proporción 1,618 : 1 (horizontal) o 1 : 1 (perfiles) |
| Foco visual | El elemento principal se ubica cerca del 38 % superior de la pantalla |
| Panel | Barra lateral 38,2 % de la zona de contenido como máximo; normalmente fija en 260 px |

No es una regla para medir con lupa: es la proporción por defecto cuando hay que decidir "¿cuánto para cada lado?".

## Profundidad

- **Plano por defecto**: las capas se distinguen por color de fondo, no por sombra.
- Sombra permitida solo en lo que flota (menú abierto, modal, botón de ayuda): `0 10px 26px` en `morado-900` al 10 %.
- Sin biseles, sin brillos, sin efecto vidrio.

## Objetivos táctiles

| Regla | Valor |
|-------|-------|
| Tamaño mínimo de todo lo tocable | **48 × 48 px** |
| Separación mínima entre dos objetivos | 10 px |
| Zona del pulgar | La acción principal en móvil va en la mitad inferior |
| Botón de ayuda | Fijo abajo a la derecha, 68 px, sin tapar la acción principal |
