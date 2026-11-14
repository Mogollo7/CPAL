---
tags: [capl, normas, movimiento]
---

# N07 · Movimiento

Volver a [[N00-Normas-Inicio]]. El movimiento **acompaña**, no entretiene. Si se quita toda la animación, el sitio debe funcionar igual.

## Carácter

Lento, suave, corto y escaso. Como respirar, no como rebotar.

## Valores

| Token | Duración | Uso |
|-------|----------|-----|
| `mov-rapido` | 160 ms | Cursor encima, foco, presionar |
| `mov-medio` | 260 ms | Abrir menú, mostrar aviso, cambiar de paso |
| `mov-lento` | 420 ms | Entrada de ilustración, modal |

(Las tres duraciones siguen la proporción 1,618.)

| Curva | Valor | Uso |
|-------|-------|-----|
| Entrada | `cubic-bezier(0.22, 1, 0.36, 1)` | Lo que aparece: desacelera suave |
| Salida | `cubic-bezier(0.4, 0, 1, 1)` | Lo que se va: rápido y sin llamar la atención |

Sin rebotes, sin elásticos, sin sacudidas.

## Permitido

- Aparecer con opacidad + desplazamiento de **máximo 10 px**.
- Cambio de color al pasar el cursor.
- Botón que se encoge al 98 % al presionarlo.
- Indicador de carga circular.
- En ilustraciones: un movimiento muy lento y en bucle largo (una hoja que se mece, una nube que flota), ciclo de **6 segundos o más**, máximo una ilustración animada por pantalla.
- Transición suave entre pasos del formulario.

## Prohibido

| No | Por qué |
|----|---------|
| Parallax, zoom al desplazar, desplazamiento secuestrado | Mareo y pérdida de control |
| Reproducción automática de video o carruseles | Ruido; quitan control |
| Parpadeos o destellos (más de 3 por segundo) | Riesgo de convulsiones; alarma |
| Sacudir un campo con error | Se siente como regaño |
| Confeti, fuegos, celebraciones exageradas | Fuera de tono |
| Contadores que corren, barras que se agotan | Presión |
| Animaciones que retrasan una acción | La persona no debe esperar al diseño |
| Elementos que se mueven solos mientras se lee | Distracción |

## Movimiento reducido

Si el dispositivo tiene activada la preferencia de **reducir movimiento**: todas las transiciones pasan a un simple cambio de opacidad de 160 ms o a nada, y los bucles de ilustración se detienen. Esto se diseña y se prueba; no es opcional.

## Carga

- Menos de 1 segundo: no se muestra nada.
- De 1 a 3 segundos: indicador circular dentro del botón o del bloque.
- Más de 3 segundos: siluetas del contenido (bloques en `morado-50`, sin destello) y un texto ("Buscando horarios disponibles…").
- Nunca una pantalla en blanco ni un indicador a pantalla completa.
