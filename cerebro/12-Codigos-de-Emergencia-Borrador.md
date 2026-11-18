---
tags: [capl, emergencias, borrador]
---

# 12 · Códigos de emergencia — BORRADOR

Volver a [[00-Inicio]]. Alimenta RF-EMG-01 de [[02-Requisitos-Funcionales]].

> ⚠️ **No publicar.** Sirve para **empezar el diseño** con contenido realista. El texto definitivo, los colores que usa el CAPL y los números de las líneas los entrega y aprueba el CAPL (preguntas 1 y 2 de [[11-Cuestionario-CAPL]]).

## Lo que se encontró (búsqueda web, nov-2026)

| Código | Para qué se usa | Qué tan firme es | Fuente |
|--------|-----------------|------------------|--------|
| 🟡 **Dorado** | Ruta de atención inmediata ante **conducta suicida** (ideación, intento) | Alto: es protocolo impulsado por MinSalud; Medellín lo presentó para urgencias en salud mental | MinSalud, Alcaldía de Medellín |
| 🩷 **Fucsia** | Atención integral a víctimas de **violencia sexual**; nombre muy usado en Antioquia | Alto en Antioquia | Hospitales públicos; Resolución 459 de 2012 |
| ⚪ **Blanco** | Otra denominación de la **misma ruta de violencia sexual** en algunas instituciones (p. ej. Sanidad de la Policía) | Medio: el nombre cambia según la institución | Policía Nacional; artículos universitarios |
| 🌸 **Rosa / rosado** | En hospitales: **robo o desaparición de un bebé o niño**. El CAPL podría usarlo con otro sentido | **Bajo — confirmar** | Guías hospitalarias |
| 🟣 **Púrpura / morado** | No se encontró una definición estable. A veces se asocia a violencia de género | **Sin confirmar** | — |

## Hallazgo importante para el diseño

**Los colores no son un estándar único.** El procedimiento lo define el protocolo nacional; el *nombre del color* lo elige cada institución o territorio. Consecuencias:

1. La página debe explicar la **situación** primero ("alguien quiere hacerse daño", "sufrí violencia sexual") y el color después. Una persona en crisis no conoce los códigos.
2. `contenido/emergencias.json` no puede asumir una lista fija de colores: cada entrada lleva su color, nombre, señales, qué hacer y líneas.
3. Cada tarjeta muestra fecha de **última revisión** y quién la aprobó (RG-07).

## Estructura propuesta de cada tarjeta (para Figma)

```
[color] Nombre del código
¿Qué situación es?         → 1–2 frases en lenguaje sencillo
Señales para reconocerla   → 3–5 viñetas
Qué hacer ahora            → 3 pasos numerados
A quién llamar             → botones de llamada (línea + horario)
Qué NO hacer               → 2–3 viñetas
Última revisión: fecha · CAPL
```

Diseñar con 5–7 tarjetas de ejemplo; el número final lo dirá el CAPL.

## Líneas de ayuda

No se listan aquí a propósito: se piden al CAPL y **se verifica cada número llamando** antes de publicarlo. Para maquetar, usar marcadores (`Línea de emergencias`, `Línea de salud mental`, `Línea de violencia`, `Línea de protección a la infancia`).
