tags: [capl, normas, ilustracion]
# N05 · Ilustración

Volver a [[N00-Normas-Inicio]].

## La idea, afinada

> **Ancla vigente (17-nov-2026):** el estilo de referencia es `contenido/ilustraciones/comunidad-unetenos.png`: ilustración con grano propio y trazo marrón suave, entregada como PNG o WebP transparente. Donde esta norma diga «SVG», «línea `morado-900`» o «grano solo por CSS», manda el ancla y el método de `contenido/ilustraciones/PROMPTS.md`. **Pendiente reescribir esta norma** para que coincida.

El estilo oficial del sitio es **ilustración vectorial plana editorial (*flat editorial*) de baja fatiga visual y acabado cálido de papel**, diseñada específicamente para recibir a una persona **cansada, estresada o con ansiedad** y hacerla sentir **cómoda, segura y en casa**.

Combina **bloques de color planos y desaturados (tonos empolvados y cálidos)** con **líneas finas de acento en tinta ciruela (`morado-900`, nunca negro puro)** para definir rasgos amables, mechones de cabello, pliegues sencillos, mascotas y objetos cotidianos de confort, integrados bajo la micro-textura táctil de papel definida en [[N02-Color]].

Tres palabras guía: **hogareño · sereno · expresivo.**

## Psicología visual para personas con estrés o agotamiento

1. **Baja carga cognitiva y visual:** Una mente agotada no debe esforzarse por descifrar formas confusas ni soportar colores estridentes. Las siluetas son claras, con abundante **espacio negativo cálido (`crema-50` `#FAF7F2`)** alrededor para que la vista descanse.
2. **Temperatura de hogar (no de clínica):** Se priorizan elementos que evocan estar a salvo en casa: una taza caliente entre las manos, un cojín suave, una planta de interior, luz cálida de lámpara o ventana, y mascotas tranquilas haciendo compañía.
3. **Suavidad cromática científicamente probada:** En lugar de colores primarios saturados que activan la alerta, se emplean **lavandas empolvados**, **verdes salvia/aguamarina suaves** (respuesta biofílica que reduce el cortisol) y **amarillo miel/ámbar suave** (asociado a luz de atardecer y refugio, sin provocar agitación).
4. **Calidez táctil mediante micro-grano de papel (2 % – 3.5 %):** Para eliminar la frialdad plástica de las pantallas digitales y mitigar la fotofobia asociada a la ansiedad, las ilustraciones conviven con un sutilísimo acabado de papel algodón/lino aplicado vía CSS global (sin ensuciar los rostros ni inflar el peso de los archivos SVG).

## Construcción y estilo

1. **Bloques planos + línea fina de acento.** Las figuras nacen de manchas de color sólido (sin degradados complejos ni 3D) complementadas con trazos finos y uniformes en `morado-900` (o líneas claras sobre rellenos oscuros) con extremos redondeados (`stroke-linecap="round"`).
2. **Nunca negro ni gris clínico.** El tono más oscuro permitido es `morado-900` (`#3B2848`). El blanco óptico puro se suaviza hacia **blanco papel cálido / crema avena (`#FAF7F2`)**.
3. **Sombra plana y geométrica suave.** En rostros y cabezas (humanos y mascotas) se aplica una **sombra triangular o curva limpia** en `morado-900` o `morado-500` justo debajo del mentón. En escenas, sombra de apoyo en elipse plana (`morado-100`).
4. **Textura táctil controlada (Regla de Grano de Papel):**
   - Los archivos `.svg` individuales se construyen con vectores 100 % limpios para mantener su peso por debajo de `30 KB` / `80 KB`.
   - El acabado granulado cálido (inspirado en `ref-06-escena-grupal-calida.jpg`) lo aporta el **velo global de papel en CSS (`opacity: 0.03`, `mix-blend-mode: multiply`)** sobre el lienzo de la web, o un borde suave tipo tiza en manchas de fondo cuando se usen imágenes de portada rasterizadas, manteniendo siempre los rostros y ojos limpios y nítidos.
5. **Métodos de contención flexibles (nunca limitados a un solo marco):**
   - **Sin contenedor (flotante / abierto):** Los personajes, mascotas u objetos reposan directamente sobre el fondo cálido de la página o sobre una sombra/alfombra elíptica suave, integrándose de forma orgánica con el aire de la interfaz.
   - **Manchas orgánicas suaves (*blobs*):** Formas curvas asimétricas y fluidas en tonos muy claros (`morado-100`, `aguamarina-100`, `amarillo-100`) detrás de la escena que abrazan los elementos sin encerrarlos.
   - **Formas domésticas cotidianas:** Un sillón redondeado, un cojín, una alfombra tejida, el haz de luz suave de una ventana o una mesa baja que sirven de base natural.
   - **Arcos o ventanas redondeadas (opcional):** Útil para retratos o tarjetas puntuales, alternando colores suaves (lavanda, salvia o miel), sin obligar a que todas las ilustraciones vayan encapsuladas en un arco amarillo.
   - **Micro-elementos de calma (escasos y pausados):** Hojitas redondeadas, una pequeña ave posada, una nube suave o pequeños puntos de luz; nunca saturar el fondo de chispas o figuras que generen ruido visual.

## Color en la ilustración

- Basado en la paleta neuro-relajante de [[N02-Color]]:
  - **60 % Aire y fondo:** Transparente sobre el fondo crema texturizado de la web (`#FAF7F2`) o mancha orgánica en tono `50/100`.
  - **30 % Calma biofílica y contención:** Lavanda empolvado (`morado-200/300`) y verde salvia/aguamarina (`aguamarina-200/300`).
  - **10 % Calidez y trazo:** Amarillo miel (`amarillo-200/300`) como acento acogedor y `morado-900` para líneas finas y acentos de contraste controlado.
- **Tonos de piel:** Gama cálida y natural de acabado mate suave, más la opción estilizada en papel cálido (`#FAF7F2`) cuando la pieza use código editorial de alto contraste suave.

## Personajes y mascotas (anatomía y rasgos)

| Rasgo | Norma |
| --- | --- |
| **Cuerpo y proporción** | Proporciones editoriales estilizadas y naturales: cuello definido, hombros relajados (caídos con naturalidad, nunca tensos ni rígidos) y ropa cómoda de casa o cotidiana (suéteres tejidos suaves, camisas holgadas, bufandas ligeras) |
| **Postura** | **De descanso y regulación:** sentados cómodamente, recostados sobre un cojín, sosteniendo una taza tibia con ambas manos, acariciando un gato/perro, respirando con calma o conversando sin prisa |
| **Manos** | Estilizadas con dedos simples definidos con línea fina, en gestos de calma, abrigo o apoyo |
| **Cara** | Silueta suave y limpia (sin ruido granulado encima), **sombra limpia bajo el mentón**, **mejillas circulares suaves** (en tono miel pálido, durazno o lavanda claro), nariz mínima en curva pequeña o L suave, y **orejas en C** con un trazo interior simple |
| **Ojos** | **Arcos curvos serenos (`^ ^` o `◡ ◡`)** que transmiten descanso y confianza, o mirada tranquila con cejas relajadas. **Nunca** ojos muy abiertos en alerta ni expresión de angustia |
| **Boca** | Sonrisa suave y tranquila (`◡`) o sonrisa abierta amable en forma de **D** sin euforia forzada (una persona agotada agradece una sonrisa cálida y empática, no una alegría estridente) |
| **Mascotas (gatos y perros)** | Símbolo central de confort doméstico y del servicio de mascotas de apoyo: trazos finos en bigotes y pelaje, mejillas circulares, ojos cerrados en ronroneo (`◡ ◡`) o arcos felices (`^ ^`), acurrucados sobre cojines, alfombras o junto a las personas |

## Motivos propios (Vocabulario de Refugio y Hogar)

| Motivo | Significado psicológico | Uso |
| --- | --- | --- |
| **Mascota tranquila (gato o perro)** | Regulación emocional, compañía sin juicio, calor de hogar | Viñeta de servicio, estados vacíos, acompañamiento en secciones |
| **Dos tazas tibias / bebida caliente** | Pausa, acogida, conversación segura ("siéntate como en casa") | Cómo funciona, agendar cita, bienvenida |
| **Cojín, sillón o alfombra redonda** | Descanso físico, permiso para bajar la guardia | Fondos de escena, soporte de personajes sin usar marcos rígidos |
| **Plantas y hojas en salvia/aguamarina** | Biofilia, respiración, crecimiento a ritmo propio | Decoración orgánica, procesos paso a paso |
| **La casa color miel / ventana iluminada** | El CAPL como refugio cálido y seguro | Portada, contacto, correos |
| **Ave pequeña posada** | Ligereza y paz presente | Detalle sutil sobre un hombro, planta o cojín |
| **Manos que sostienen o acompañan** | Apoyo seguro en momentos difíciles | Guía de emergencias, ayuda inmediata |

## Metáforas prohibidas

| No | Por qué |
| --- | --- |
| Persona con la cabeza entre las manos, llorando, encogida | Refuerza el estigma y puede reactivar malestar |
| Nube negra, tormenta o rayos sobre la cabeza | Cliché que reduce a la persona a su malestar |
| Cerebros (rotos, con engranajes, enredados) | Medicaliza y asusta |
| Cadenas, jaulas, laberintos, abismos, grietas | Sensación de encierro o peligro |
| Pastillas, jeringas, batas médicas, divanes clínicos | Imaginario hospitalario frío que aleja al usuario |
| Euforia exagerada, colores neón o granulado pesado (> 5 %) | Genera sobrecarga sensorial, fatiga ocular y agotamiento en quien llega cansado |
| Sangre, armas, cualquier referencia a métodos | Nunca, tampoco en la guía de emergencias |

En la **guía de emergencias** las ilustraciones muestran el **apoyo cálido** (una mano tendida, alguien acompañando en calma, una taza tibia), jamás el daño.

## Tipos y tamaños

| Tipo | Proporción | Contención sugerida | Uso |
| --- | --- | --- | --- |
| **Escena** | 1,618 : 1 (o 16 : 9) | Abierta sobre mancha orgánica, alfombra/sillón o composición libre | Portada, cómo funciona |
| **Viñeta** | 1 : 1 | Libre sin marco, sobre mancha suave o en arco redondeado opcional | Tarjetas de servicio, mascotas, estados vacíos |
| **Mancha** | Libre | Orgánica suave en tono 50/100 | Fondos de respiro visual |
| **Pictograma** | 1 : 1, 68 px | Sin marco, 2–3 formas limpias | Junto a títulos |

## Referencias visuales

Las láminas de referencia de trazo, anatomía facial, textura y expresividad están en `cerebro/normas/referencias-ilustracion/`, y las muestras aplicadas a mascotas en `contenido/ilustraciones/muestras-generadas/`:
- Se adopta de `96638.jpg`–`96642.jpg` la **calidad de línea fina + bloque plano** y la **anatomía de rostros, manos y mascotas** (mejillas circulares, sombra bajo el mentón, ojos en arco).
- Se adopta de `96643.jpg` (`ref-06-escena-grupal-calida.jpg`) la **calidez táctil de papel apastelado**, llevándola al sistema web mediante el velo CSS de micro-grano al `3 %` en `estilos/textura-papel-calido.css`.
- Se **suaviza la saturación** y se **libera la contención** para no depender siempre de arcos amarillos ni grillas cerradas.

## Entrega técnica

| Norma | Valor |
| --- | --- |
| Formato | SVG (o WebP/PNG en prototipos) |
| Peso | Menos de 30 KB por viñeta, menos de 80 KB por escena (el grano va por CSS, no dentro del SVG) |
| Contenido | Vectores limpios; trazos uniformes con `stroke-linecap="round"` y `stroke-linejoin="round"` |
| Colores | Tokens de [[N02-Color]] en su gama suave/desaturada |
| Lienzo | Con `viewBox`, sin ancho ni alto fijos |
| Nombre | `ilu-[tipo]-[tema].svg` → `ilu-vineta-gatos-apoyo.svg`, `ilu-escena-hogar-calma.svg` |
| Carpeta | `contenido/ilustraciones/` |
| Decorativa | Oculta a lectores de pantalla (`aria-hidden="true"`) |
| Informativa | Con texto alternativo que describe la escena |
| Movimiento | Ver [[N07-Movimiento]]; siempre lento, suave y opcional |

## Comprobación de una ilustración (Checklist anti-estrés)

- [ ] **¿Descansa la vista?** ¿Tiene suficiente aire cálido alrededor y colores de baja/media saturación (lavanda suave, salvia, miel, crema)?
- [ ] **¿Se siente como estar en casa?** ¿Transmite confort doméstico, refugio y calma sin parecer un hospital ni exigir energía?
- [ ] **¿Tiene variedad de contención?** ¿Funciona de forma abierta u orgánica sin depender obligatoriamente de un marco amarillo rígido?
- [ ] **¿La textura es sutil y limpia?** ¿El SVG está libre de ruido pesado y deja que el velo de papel al 3 % aporte calidez sin ensuciar los rostros?
- [ ] **¿Cumple el estilo flat editorial?** ¿Combina bloques planos con líneas finas en `morado-900` (sin negro puro ni degradados)?
