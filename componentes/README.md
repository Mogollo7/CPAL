# componentes — Atomic Design

Misma jerarquía que la biblioteca de Figma («0 · Biblioteca CAPL»). Cada nivel solo usa los de abajo, recibe
datos por props y no llama al servidor. Archivos en kebab-case (N11). Valores visuales: solo tokens de
`estilos/tokens.css` (si falta uno, se agrega allí, no se escribe el número en el componente).

| Nivel     | Carpeta                     | Qué va                                  | Ejemplos                                                                                                                                      |
| --------- | --------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Átomo     | `atomos/`                   | un solo elemento visual                 | `boton`, `titulo`, `logo-capl`, `etiqueta`, `fondo-grano`, `seccion`, `ilustracion-sobre-pie`                                                 |
| Molécula  | `moleculas/`                | unos pocos átomos con un solo propósito | `encabezado-seccion`, `tarjeta-taller`, `tarjeta-evento`, `tarjeta-perfil`, `fila-ilustrada`, `pregunta-frecuente`, `campo`, `consultar-cita` |
| Organismo | `organismos/`               | una sección completa reutilizable       | `encabezado-publico`, `pie-publico`, `hero-carrusel`, `pasos-cita`, `preguntas-frecuentes`, `cierre-pedir-cita`, `cabecera-ilustrada`         |
| Plantilla | `app/(publico)/layout.tsx`  | marco de página                         | encabezado + contenido + pie + ayuda flotante                                                                                                 |
| Página    | `app/(publico)/**/page.tsx` | compone organismos y trae los datos     |                                                                                                                                               |

`publico/` y `panel/` guardan las piezas con estado o flujo propio de una pantalla (pedir cita, mi cita,
orientador de crisis, paneles). `cn.ts` une clases y conoce los tokens propios para no borrarlos al mezclar.

## Ritmo vertical (Figma + duolingo.com)

- Sección: 96 arriba y abajo (`py-seccion`); cabecera de página: 68 (`py-cabecera`).
- Sección de transición (trae un fondo con grano nuevo): 140 arriba (`<Seccion ritmo="entrada">`, `pt-entrada`),
  título de 64 (`tamano="hero"`). Su fondo nace de la nada 340 px antes y se llena despacio, como en Duolingo.
- Filas de contenido (`FilaIlustrada`): alto mínimo 530, texto de 503 e ilustración separados 101 (`gap-fila`),
  título 48, 24 entre título y texto; las filas van seguidas, sin margen entre ellas.
- Títulos: 64 transición · 48 sección y fila · 32/28 tarjetas. Fuentes del Figma (Nunito 800, Source Sans 3).
- Entre bloques de una sección: 42 (`gap-bloque`, `space-y-bloque`); borde lateral: 42 (`px-borde`).
- Anchos: lectura 920 (`max-w-lectura`), contenido 1196.

## Degradados con grano (como tiimoapp.com)

`<FondoGrano tono fundido />` = color + ruido monótono teñido + máscara de fundido (`estilos/grano.css`).
La cabecera de una página usa `fundido="abajo"` (solo se funde hacia abajo); los fondos en medio de la
página usan `fundido="ambos"` (se funden arriba y abajo). Tonos: lavanda, lavanda-claro, crema, menta, miel, ciruela.

## Imágenes

- Fuente en `contenido/ilustraciones/` (o `contenido/fotos/`) como **WebP calidad 82, a lo sumo 2× el ancho
  con el que se muestra** (una ilustración de 420 px se guarda a 840 px).
- Siempre con `next/image` y su `sizes` real; Next sirve AVIF/WebP al tamaño de cada pantalla
  (`next.config.ts › images`). `priority` solo en la imagen de la primera pantalla.
- Decorativas con `alt=""`; las que informan (la casa, el mapa) con texto alternativo.
