---
tags: [capl, normas, indice]
---

# Cerebro de normas — CAPL

Volver a [[00-Inicio]]. Normativa básica de diseño y de construcción. **Aquí solo se define; no se construye nada.** Los mockups los hace el rol A a partir de estas normas.

## La idea en una frase

> Un lugar **tranquilo, redondo y cálido** donde una persona que la está pasando mal sienta que la van a tratar bien: curvas elegantes, ternura sin infantilizar, ilustración plana sin líneas negras, y morado + amarillo como voz propia.

## Mapa

| # | Nota | Define |
|---|------|--------|
| N01 | [[N01-Principios-de-Bienestar]] | Por qué: las reglas para que la persona se sienta segura (con fuentes) |
| N02 | [[N02-Color]] | Paleta morado / amarillo / aguamarina, roles, proporción y contraste verificado |
| N02B | [[N02-Color-Propuesta-Psicologia]] | Psicología del color, regla 60-30-10, confort sensorial y micro-grano de papel al 3% |
| N03 | [[N03-Tipografia-y-Escala-Aurea]] | Fuente, escala de tamaños por proporción áurea, reglas anti-desborde |
| N04 | [[N04-Forma-Espacio-y-Composicion]] | Curvas, radios, espaciado, retícula, proporciones |
| N05 | [[N05-Ilustracion]] | Estilo vectorial plano editorial: baja fatiga visual, mascotas, contención libre, sin marco rígido |
| N06 | [[N06-Componentes-y-Estados]] | Botones, campos, tarjetas, formulario de cita, estados |
| N07 | [[N07-Movimiento]] | Animación lenta y opcional |
| N08 | [[N08-Lenguaje-y-Tono]] | Cómo se le habla a la persona |
| N09 | [[N09-Accesibilidad-y-Revision]] | Mínimos de accesibilidad y lista de revisión de cada pantalla |
| N10 | [[N10-Tokens-y-Figma]] | Nombres de variables: lo que une Figma con el código |
| N11 | [[N11-Normas-Tecnicas]] | Convenciones de código para B y C |
| N12 | [[N12-Diseno-Confort-y-Neurobienestar]] | Marco maestro de confort, relax del usuario, textura táctil y neurobienestar (por Gemini y Sebas) |

## Jerarquía cuando dos normas chocan

1. **Seguridad de la persona** (ayuda de emergencia visible, nada que alarme) — [[N01-Principios-de-Bienestar]]
2. **Accesibilidad** (contraste, teclado, lectura) — [[N09-Accesibilidad-y-Revision]]
3. **Claridad** (se entiende a la primera)
4. **Estética** (se ve bonito)

Si algo bonito incumple 1, 2 o 3, se cambia lo bonito.

## Referencia visual: labs.google

Solo referencia de **carácter**, no plantilla.

| Se toma | No se toma |
|---------|-----------|
| Botones tipo píldora y tarjetas con esquinas muy redondas | Titulares gigantes de 100 px o más |
| Mucho aire entre bloques | Animación constante, 3D, video de fondo |
| Tipografía grande, amable, geométrica | Secciones oscuras |
| Superficies planas, sin sombras duras | Tono tecnológico / experimental |
| Neutro cálido de fondo (no blanco frío) | Su paleta (la nuestra es morado + amarillo) |

## Estado

- [x] Normas básicas definidas (13-nov-2026)
- [ ] Rol A valida o ajusta paleta y tipografía al hacer los primeros mockups
- [ ] Variables creadas en Figma según [[N10-Tokens-y-Figma]]
- [ ] Visto bueno del CAPL al tono y a las ilustraciones

Todo valor de estas notas es **punto de partida**: si al diseñar se ajusta un color o una medida, se cambia **aquí** y en Figma a la vez.
