tags: [capl, normas, color, psicologia-ambiental, textura]
# N02 · Color, Luz y Textura Táctil (Normativa Neuro-Relajante)

Volver a [[N00-Normas-Inicio]].

## 1. Diagnóstico psicológico del usuario del CAPL

Una persona que acude al **Centro de Atención Psicológica La Salle (CAPL)** suele llegar en estado de **fatiga mental, hipervigilancia (ansiedad), estrés agudo o agotamiento emocional**. Desde la neuroarquitectura y la psicología ambiental:

1. **Hipersensibilidad sensorial y fotofobia por estrés:** En estados de ansiedad, el sistema nervioso simpático dilata las pupilas y aumenta la sensibilidad al brillo de las pantallas y a los contrastes violentos. Los colores muy saturados o el blanco óptico puro (`#FFFFFF`) frente al negro (`#000000`) incrementan la fatiga ocular y la tensión.
2. **Luminancia cálida + Saturación baja/media:** Los tonos **desaturados (pasteles suaves y tonos empolvados)** sobre fondos cálidos reducen la sobrecarga sensorial (calificación media de confort de 4.5/5 frente a 2.0/5 en colores intensos).
3. **Longitudes de onda cortas y biofilia:** Los tonos fríos suaves (lavanda empolvado) y los verdes naturales (salvia/aguamarina suave) reducen la frecuencia cardíaca y el cortisol hasta en un 14–18 %, activando el sistema nervioso parasimpático.
4. **Percepción visuotáctil (Efecto Micro-Granulado de Papel Cálido):** Las superficies digitales 100 % lisas y brillantes se perciben inconscientemente como frías o sintéticas. Una **micro-textura táctil de papel algodón o lino (opacidad del 2 % al 3.5 %)** absorbe visualmente el brillo de la pantalla, evoca el tacto de un libro físico en casa y estimula respuestas de calma y cercanía sin generar ruido visual.

## 2. Regla de proporción cromática 60 · 30 · 10 (Sensación de "Estar en Casa")

- **60 % · Reposo y Papel Cálido (Fondos no clínicos):** Crema avena (`#FAF7F2`), lino suave (`#F3EFE6`) o lavanda niebla (`#F4F1F8`), acompañados del velo global de micro-grano de papel al `3 %`.
- **30 % · Contención y Calma Biofílica:** Lavanda empolvado (`#B8A9C9` / `#C5B9CD`) y verde salvia-aguamarina (`#9DC8B8` / `#CFE5DC`) para manchas orgánicas, vegetación, prendas y tarjetas suaves.
- **10 % · Luz de Hogar y Tinta Ciruela:** Amarillo miel/ámbar (`#F3D186`, como luz de lámpara cálida) y morado ciruela profundo (`#3B2848`) para texto y líneas finas de acento (nunca negro puro).

## 3. Tokens recomendados para UI e Ilustración

| Familia | Rol psicológico | Token sugerido | Hex referencial | Uso principal |
| --- | --- | --- | --- | --- |
| **Superficie Cálida** | Refugio doméstico, cero frialdad hospitalaria | `crema-50` / `lino-100` | `#FAF7F2` / `#F3EFE6` | Fondo principal de página, papel de rostro y espacios de aire |
| **Morado / Lavanda** | Serenidad, introspección segura y contención | `morado-100` a `morado-400` | `#EFEBF5` / `#B8A9C9` | Manchas orgánicas, prendas, sombras suaves de suelo |
| **Tinta Ciruela** | Estructura sin agresividad (reemplaza al negro) | `morado-900` | `#3B2848` | Líneas finas de acento, cabello oscuro, sombras bajo el mentón, texto |
| **Salvia / Aguamarina** | Respuesta biofílica, reducción de cortisol y frescura | `aguamarina-200` a `400` | `#D4EBE2` / `#8FC1B0` | Plantas, hojas, collares de mascotas, tazas, acentos de calma |
| **Amarillo Miel / Ámbar** | Calidez de lámpara de hogar, esperanza sin agitación | `amarillo-200` a `400` | `#F9E6B3` / `#F3D186` | La casa amarilla, luz de ventana, cojines, mejillas suaves |

## 4. Normativa del Efecto Micro-Granulado (Textura de Papel Cálido)

Para lograr la calidez artesanal de la referencia `ref-06-escena-grupal-calida.jpg` (`96643.jpg`) sin causar fatiga visual en pacientes ansiosos ni violar el límite de peso de los archivos SVG (`< 30 KB` / `< 80 KB`):

1. **Dónde SÍ se aplica:**
   - **Velo global de papel en interfaz (CSS/SVG):** Un filtro `feTurbulence` monocromático en tono ciruela (`#3B2848`) con `opacity: 0.03` (`2.5 % – 3.5 %`) y `mix-blend-mode: multiply` sobre toda la página. Así, tanto el fondo crema como las ilustraciones SVG planas adquieren textura orgánica de papel sin añadir peso a cada archivo `.svg`.
   - **Bordes suaves en manchas o sombras de ilustración (opcional):** En piezas rasterizadas (WebP/PNG) de portada, se permite textura tipo lápiz/tiza suave únicamente en manchas de fondo o ropa, como en `96643.jpg`.
2. **Dónde NO se aplica (Prohibiciones):**
   - **Cero grano pesado (> 5 % de opacidad):** Por encima del 5 %, el grano deja de percibirse como papel y pasa a ser "ruido visual" (*visual stress*), lo que incrementa la fatiga ocular y la irritabilidad en personas agotadas.
   - **Rostros, ojos y textos 100 % limpios:** Las expresiones faciales y la tipografía de lectura nunca deben verse interrumpidas por granulado denso.
   - **Cero mapas de bits de ruido incrustados dentro de cada SVG:** El grano nunca se vectoriza como miles de puntos dentro del archivo `.svg` de una ilustración; se delega al overlay CSS global.
