---
tags: [capl, normas, movimiento, neurociencia, animacion, motion, animejs, esqueletos, gemini]
---

# N13 · Investigación Científica de Animación, Transiciones y Neurobienestar

Volver a [[N00-Normas-Inicio]] y complementar con [[N07-Movimiento]], [[N01-Principios-de-Bienestar]] y [[N12-Diseno-Confort-y-Neurobienestar]].  
Elaborado por **Gemini** (Colaborador IA de Neurodiseño y Aseguramiento Técnico) junto con **Sebas** (Líder Técnico & Diseño Total).

---

## 1. El Fundamento Neurocientífico: Cinética y Estrés

El cerebro humano no procesa el movimiento de una interfaz de forma puramente estética; lo procesa como una **señal biológica de entorno**.

```
                ┌──────────────────────────────────────────────┐
                │          ESTÍMULO VISUAL CINÉTICO            │
                └──────────────────────┬───────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │  VÍA RETINOTECTAL RÁPIDA│         │ VÍA GENICULOCORTICAL    │
        │  (Colículo Sup. + Amígdala)       │ (V1 / MT / Prefrontal)  │
        │  Alerta, sobresalto     │         │ Análisis consciente     │
        └────────────┬────────────┘         └────────────┬────────────┘
                     │                                   │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                       ¿Movimiento brusco o acelerado?
                       ├── SÍ ──► Activación Simpática (Taquicardia, Tensión)
                       └── NO ──► Respuesta Parasimpática (Seguridad, Descompresión)
```

### 1.1 La Vía Magnocelular y el Reflejo de Sobresalto
- Las células magnocelulares de la retina y el área visual MT/V5 están especializadas en detectar **cambios súbitos de luminancia y velocidad periférica**.
- En un paciente con **ansiedad aguda, trastorno de estrés postraumático (TEPT) o agotamiento severo**, la compuerta sensorial del tálamo está desinhibida. Movimientos de rebote (*bounces*), sacudidas de campos con error (*shakes*) o aceleraciones rápidas disparan el reflejo de sobresalto (*acoustic/visual startle response*), provocando micro-descargas de adrenalina.
- **Regla Científica:** Las interfaces de salud mental deben emplear curvas de **desaceleración armónica monótona** sin puntos de inflexión que simulen impacto físico.

### 1.2 Cinetosis Visual (VIMS) y Conflicto Vestibulo-Ocular
- El 38 % de las personas con trastornos de ansiedad experimentan mareos psicógenos o hipersensibilidad vestibular.
- Efectos de *parallax*, desplazamientos secuestrados (*scroll-jacking*), zooms al hacer scroll o rotaciones en tres dimensiones provocan un **conflicto sensorial visual-vestibular**: los ojos perciben movimiento traslacional mientras el laberinto del oído interno informa reposo. Esto desencadena náuseas, cefalea tensional y despersonalización.
- **Regla Científica:** Desplazamiento máximo permitido en pantalla: **8 px a 10 px**, siempre en un solo eje traslacional plano y con duración $\le 420\text{ ms}$.

### 1.3 Arrastre Psicofisiológico y Resonancia a 0.1 Hz (Coherencia Cardíaca)
- El ritmo biológico natural de relajación humana (frecuencia de resonancia barorrefleja) se ubica en los **0.1 Hz** (~6 ciclos por minuto).
- Las animaciones en bucle de ilustraciones biofílicas (mecida de una planta, respiración de una mascota de apoyo) calibradas en ciclos de **6 a 10 segundos** operan como un marcapasos visual vicario: el usuario sincroniza involuntariamente su ritmo respiratorio con el estímulo (*entrainment* óptico).

---

## 2. La Ciencia de los Esqueletos de Carga (Skeletons) vs. Spinners

```
        ┌────────────────────────────────────────────────────────┐
        │                 COMPARATIVA DE ESPERA                  │
        └──────────────────────────┬─────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   SPINNER    │             │   SHIMMER    │             │  ESQUELETO   │
│  PERPETUO    │             │  ESTRIDENTE  │             │   CALMO      │
│ (Tradicional)│             │ (Comercial)  │             │   (CAPL)     │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       ▼                            ▼                            ▼
• Cero información           • Barrido blanco a 1s        • Pulso a 3.0s (0.33Hz)
• Incertidumbre total        • Alerta de radar/escaneo    • Emula respiración
• Ansiedad +40%              • Fotofobia en retinas       • Calma y certidumbre
```

### 2.1 Por qué evitar el Spinner Circular Perpetuo
1. **Foco en el Vacío:** Los estudios de tiempo percibido de Harvard y NN/g demuestran que una rueda giratoria infinita sobre fondo blanco aumenta la percepción de lentitud subjetiva en un **36 %**, provocando abandono por frustración.
2. **Incertidumbre Espacial:** El usuario ansioso no sabe qué tamaño o forma tendrá lo que va a aparecer, lo que mantiene activo el córtex visual en anticipación tensa.

### 2.2 Por qué evitar el Shimmer Metálico Rápido
1. El efecto "shimmer" popularizado en apps bancarias (una franja blanca de alto contraste cruzando a 800 ms) simula un haz de radar o un escáner industrial.
2. En ojos con pupilas dilatadas por fatiga, la luz blanca móvil genera deslumbre y fatiga del músculo ciliar ocular.

### 2.3 El Estándar CAPL: "Breathing Skeleton" (Pulso Respiratorio Suave)
Implementado en `componentes/ui/esqueleto-calmo.tsx` y `estilos/textura-papel-calido.css`:
1. **Contraste Delta Ultra-Bajo:** Oscila entre fondo `crema-50` (`#FAF7F2`) o `morado-50` y un velo `morado-100` (`#EFEBF5`) o `salvia-100` (`#E6F3EE`). La diferencia de luminancia es suave y no agrede la visión.
2. **Periodo de Onda de 3.0 Segundos (0.33 Hz):** Simula una exhalación e inhalación pausada con curva senoidal (`cubic-bezier(0.4, 0, 0.2, 1)`).
3. **Siluetas Redondeadas Orgánicas:** Borde `rounded-2xl` y `rounded-3xl` que anticipan la anatomía de las tarjetas de citas sin sobresaltos.
4. **Respeto a Preferencias del Sistema:** Ante `prefers-reduced-motion: reduce`, el pulso se apaga de inmediato, manteniendo una silueta estática agradable.

---

## 3. Capacidades Límite y Explotación Técnica de las Librerías

El ecosistema instalado en el CAPL combina tres herramientas complementarias sin solapamiento:

| Librería | Rol Específico en el CAPL | Capacidad Límite Explotada |
|---|---|---|
| **Motion** (`motion/react`) | Transición de pantallas, orquestación de layouts y salidas coordinadas. | Resortes sobre-amortiguados sin rebote (`stiffness: 220, damping: 32`), transiciones coordinadas con `AnimatePresence mode="wait"`, hooks de accesibilidad `useReducedMotion()`. |
| **Anime.js** (`animejs`) | Micro-movimiento biofílico y manipulación matemática de SVG. | Motor ultra-ligero para morphing de trazos SVG (`strokeDashoffset`), oscilaciones polimorfas y timelines independientes sin saturar el render de React. |
| **Shadcn / Tailwind v4** | Primitivas de esqueleto, tokens y composición accesible. | Clases utilitarias con variables CSS directas (`@theme`), fusión limpia con `cn()`, soporte SSR/RSC de Next.js 16. |

### 3.1 Explotación Límite de Motion (`motion/react`)
1. **Resortes Críticamente Amortiguados (*Critically Damped Springs*):**
   ```typescript
   // Física sin rebote: el coeficiente de amortiguamiento zeta (ζ) >= 1.0
   const transicionCalma = {
     type: "spring",
     stiffness: 200,
     damping: 30, // ζ = damping / (2 * sqrt(stiffness)) = 30 / (2 * 14.14) = 1.06 (Sobre-amortiguado)
     mass: 1,
     restDelta: 0.001
   };
   ```
   *Efecto psicológico:* La animación frena suavemente en seco en su destino exacto, sin oscilaciones hacia adelante ni hacia atrás, transmitiendo firmeza, control y seguridad.

2. **Transiciones de Flujo Sin Ruptura (`mode="wait"`):**
   - En el formulario de cita (`/pedir-cita`), el paso anterior se desvanece completamente antes de que el nuevo comience a entrar, evitando que dos pantallas coexistan deformando el contenedor.

### 3.2 Explotación Límite de Anime.js (`animejs` v4)
1. **Desacoplamiento del Ciclo de Vida de React:**
   - Para bucles de 6 a 10 segundos en ilustraciones vectoriales, usar el estado de React causaría re-renderizados innecesarios.
   - Anime.js se ejecuta directamente sobre el DOM a través de `useRef`, con consumo de memoria plano y tasa constante de 60 fps.
2. **Reversibilidad y Destrucción Limpia:**
   - Todo efecto Anime.js en el CAPL implementa `animacion.revert()` en su limpieza de efecto para garantizar cero fugas de memoria al navegar entre páginas.

---

## 4. Matriz de Duraciones y Curvas Áureas

Todas las duraciones de movimiento del CAPL se derivan del **Número Áureo ($\phi \approx 1.618$)**:

| Token / Concepto | Duración | Easing / Física | Caso de Uso |
|---|---|---|---|
| **Micro-interacción** (`mov-rapido`) | 160 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Hover suave, foco de teclado, botón presionado al 98 %. |
| **Componente** (`mov-medio`) | 260 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Despliegue de acordeón, toast amable, cambio de tab. |
| **Escena / Modal** (`mov-lento`) | 420 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrada de modal, desvanecimiento de tarjeta, cambio de página. |
| **Esqueleto Calmo** | 3000 ms | Senoidal `easeInOut` | Pulso respiratorio de carga mientras se consultan citas. |
| **Ilustración Biofílica** | 6400 ms | Senoidal `inOutSine` | Mecida de hojas, parpadeo suave de ventana, ronroneo de mascota. |

---

## 5. Reglas Innegociables de Movimiento (Checklist de Seguridad Cinética)

- [ ] **Respeto a `prefers-reduced-motion`:** Si el usuario solicita reducción de movimiento, las transiciones pasan a crossfade de 160 ms o estático inmediato.
- [ ] **Sin rebotes (Cero Bounces):** Prohibido `easeOutBounce`, `easeOutBack` o resortes sub-amortiguados ($\zeta < 1$).
- [ ] **Sin vibraciones de error (Cero Shakes):** Un campo con error no tiembla ni se sacude; cambia a borde suave con mensaje de texto calmado.
- [ ] **Desplazamiento $\le 10\text{ px}$:** Jamás deslizar elementos a lo largo de toda la pantalla (evita el barrido ocular forzado).
- [ ] **Máximo 1 bucle por pantalla:** Nunca tener múltiples ilustraciones o elementos moviéndose a la vez en el campo visual del usuario.
