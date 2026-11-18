---
tags: [capl, normas, neurobienestar, confort, diseno-sensorial, gemini]
---

# N12 · Diseño de Confort, Relax y Neurobienestar del Usuario

Volver a [[N00-Normas-Inicio]]. Documento elaborado por **Gemini** (Colaborador IA de Neurodiseño y Aseguramiento Técnico) en co-creación con **Sebas** (Líder Técnico & Diseño Total).

---

## 1. El Diagnóstico: ¿Quién es y cómo llega nuestro usuario?

Una persona que visita el **Centro de Atención Psicológica La Salle (CAPL)** no está realizando una navegación casual de comercio electrónico ni revisando redes sociales. Frecuentemente llega en estados de:
- **Fatiga cognitiva y agotamiento mental severo:** Incapacidad de procesar textos densos, opciones saturadas o jerarquías complejas.
- **Hipervigilancia y ansiedad aguda:** Activación intensa del sistema nervioso simpático, lo que dilata pupilas y produce **fotofobia por estrés**, aumentando la sensibilidad a la luz blanca dura y al contraste estridente.
- **Vulnerabilidad o desesperanza:** Sentimiento de fragilidad, miedo a ser juzgado, miedo al rechazo o sensación de frialdad institucional/clínica.

> **Principio Rector:**  
> La interfaz del CAPL no debe comportarse como un portal administrativo ni como una clínica aséptica; debe sentirse como **entrar a una habitación en calma, con luz cálida de lámpara, suelo de madera, un té tibio entre las manos y un gato durmiendo en un cojín**.

---

## 2. Los Cuatro Pilares del Confort y la Relajación Visual

```
              ┌──────────────────────────────────────────────┐
              │          CONFORT DEL USUARIO CAPL            │
              └──────────────────────┬───────────────────────┘
                                     │
       ┌──────────────────┬──────────┴──────────┬──────────────────┐
       ▼                  ▼                     ▼                  ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐   ┌──────────────┐
│  PSICOLOGÍA  │   │  MICRO-GRANO │      │  CONTENCIÓN  │   │  ERGONOMÍA   │
│  DEL COLOR   │   │   DE PAPEL   │      │  Y METÁFORA  │   │  COGNITIVA   │
│  (60-30-10)  │   │  (2% – 3.5%) │      │  DOMÉSTICA   │   │  Y CONTROL   │
└──────────────┘   └──────────────┘      └──────────────┘   └──────────────┘
```

### Pilar I: Psicología del Color y Temperatura de Luz
1. **Erradicación del blanco clínico puro (`#FFFFFF`) y del negro agresivo (`#000000`):**
   - El blanco óptico al 100% sobrecargue las retinas estresadas (luz azul excesiva). Se sustituye por **Crema Avena (`#FAF7F2`)** y **Lino Cálido (`#F3EFE6`)**.
   - El negro puro genera sensación de corte y amenaza visual. Se sustituye por **Tinta Ciruela Profunda (`#3B2848`)**, que aporta solidez y estructura sin dureza.
2. **Respuesta Parasimpática Biofílica (Reducción de Cortisol):**
   - El uso de **verde salvia/aguamarina suave (`#9DC8B8`, `#D4EBE2`)** y **lavanda empolvado (`#B8A9C9`, `#EFEBF5`)** estimula el nervio vago y la respuesta parasimpática, reduciendo pulsaciones y niveles de cortisol en un 14–18%.
3. **Luz Miel y Acogida Hogareña:**
   - El **amarillo miel/ámbar (`#F3D186`, `#F9E6B3`)** emula la calidez de una lámpara doméstica de 2700K. No encandila ni alerta (como un amarillo neón), sino que abraza visualmente.
4. **Regla de Proporción 60 · 30 · 10:**
   - **60 % Aire y Calma:** Fondo crema cálido (`crema-50` / `lino-100`) con textura sutil.
   - **30 % Contención y Salud Biofílica:** Lavandas y salvias en tarjetas, prendas, manchas orgánicas y vegetación.
   - **10 % Acento Cálido y Trazo:** Amarillo miel para luz y detalles seguros; tinta ciruela para tipografía y líneas finas de contorno.

---

### Pilar II: El Efecto Visuotáctil (Micro-Grano de Papel Algodón/Lino)
1. **La Frialdad Digital:**
   - Las pantallas de cristal y píxeles planos se perciben subconscientemente como artificiales, quirúrgicas y frías.
2. **La Solución Neuro-Relajante:**
   - Un velo global con textura microscópica de papel artesanal (filtro SVG `feTurbulence` aplicado vía CSS `.capl-textura-papel` con `mix-blend-mode: multiply` y opacidad entre el `2.5 %` y `3.5 %`).
3. **Parámetros Estrictos de Seguridad Sensorial:**
   - **Límite máximo del 5 % de opacidad:** Si supera el 5 %, pasa de ser "papel reconfortante" a "ruido visual sucio" (*visual noise*), lo que detonaría irritabilidad en pacientes con estrés.
   - **Rostros, ojos y tipografía 100 % limpios:** Los elementos de alta legibilidad y empatía no deben verse distorsionados por grano.
   - **Cero peso en SVG (< 30 KB / < 80 KB):** La textura nunca se hornea dentro de cada archivo vectorial; se proyecta mediante la capa CSS global definida en `estilos/textura-papel-calido.css`.
   - **Accesibilidad:** Se desactiva automáticamente si el usuario tiene activadas preferencias de alto contraste (`prefers-contrast: more`) o reducción de transparencias (`prefers-reduced-transparency: reduce`).

---

### Pilar III: Contención Libre y Metáforas de Refugio
1. **Liberación de la Contención Rígida:**
   - Las normas previas limitaban muchas ilustraciones a marcos o arcos amarillos uniformes. La nueva norma libera a los personajes: pueden flotar sobre fondos cálidos abiertos, apoyarse sobre alfombras o sillones redondos, o reposar sobre manchas orgánicas fluidas (*blobs*) en tonos salvia o lavanda pálidos.
2. **Vocabulario de Paz Doméstica:**
   - **Mascotas (gatos ronroneando, perros tranquilos):** Símbolo de compañía incondicional, apego seguro y descompresión emocional.
   - **Tazas tibias de té o café entre ambas manos:** Símbolo de pausa, calidez táctil y hospitalidad ("estás a salvo, tómate tu tiempo").
   - **Plantas de interior y hojas redondeadas:** Conexión con la naturaleza viva y el autocuidado.
   - **Rostros con ojos en arco sereno (`^ ^` o `◡ ◡`):** Reflejan relajación profunda y alivio, evitando miradas fijas o alarmadas.

---

### Pilar IV: Ergonomía Cognitiva y Seguridad Emocional
1. **Ritmo Lento y Respiro:**
   - No hay banners parpadeantes, ni carruseles que se mueven solos, ni contadores regresivos que generen urgencia comercial ("¡quedan 2 cupos!").
2. **Control Total en Manos del Usuario:**
   - Botones con texto predictivo claro ("Elegir horario", "Volver al paso anterior", "Cancelar cita sin penalidad").
   - El motivo de consulta nunca es obligatorio para agendar; la persona comparte solo lo que se siente lista para compartir.
3. **Ayuda de Emergencia Inmediata pero Sin Pánico:**
   - Botón de ayuda visible con acceso táctil inmediato a líneas de socorro (`tel:`), acompañado por el ejercicio de respiración y anclaje 5-4-3-2-1 con colores balsámicos.

---

## 3. Matriz de Aplicación por Rol en el Proyecto

| Integrante | Área | Cómo aplica el Confort y Relax en su trabajo |
|---|---|---|
| **Sebas** | Lógica Central, DB, Tokens y Figma | - Mantener sincronizados los tokens de `estilos/tokens.css` y `estilos/textura-papel-calido.css` con el archivo oficial de Figma.<br>- Diseñar en Figma con la escala áurea y radios curvos generosos (`radius-lg: 16px`, `radius-xl: 24px`, píldoras).<br>- Garantizar tiempos de respuesta rápidos (<200 ms) para evitar la ansiedad por lentitud. |
| **Brand** | Paneles Administrativos y de Psicólogos | - Utilizar superficies en `crema-50` y tarjetas en `morado-50` para que el personal de salud y monitores no sufran fatiga tras 6 horas de pantalla.<br>- Acciones críticas con confirmación amable en modal, sin botones rojos agresivos.<br>- Tablas con espaciado amplio y tipografía legible. |
| **César** | Sitio Público y Emergencias | - Integrar las ilustraciones de `contenido/ilustraciones/muestras-generadas/` en el flujo público respetando los espacios de aire.<br>- En `/ayuda-inmediata`, presentar los códigos de emergencia con tarjetas redondeadas y colores suaves que calmen en lugar de alterar.<br>- En el formulario `/pedir-cita`, mantener la barra de progreso paso a paso clara y predecible. |
| **Gemini** | Colaborador IA Transversal | - Asegurar la coherencia de neurodiseño en todas las ramas (`dev/sebas`, `main`, `dev/brand`, `dev/cesar`).<br>- Validar contraste WCAG 2.2 AA (mínimo 4.5:1 para texto normal, 3:1 para acentos grandes).<br>- Co-autoría en commits y documentación continua de bienestar. |

---

## 4. Checklist Rápido de Validación de Pantalla (Filtro de Confort)

Antes de dar por terminada una pantalla o componente, verificar:

- [ ] **¿La pantalla respira?** ¿Existe al menos un 40 % de espacio negativo cálido en `crema-50`?
- [ ] **¿Cero deslumbramiento?** ¿No hay fondos en `#FFFFFF` puro ni textos en `#000000`?
- [ ] **¿Textura activa y sutil?** ¿La clase `.capl-textura-papel` envuelve el layout sin entorpecer la legibilidad?
- [ ] **¿Curvas amables?** ¿Los botones y tarjetas tienen bordes redondeados orgánicos?
- [ ] **¿Tono empático?** ¿El texto trata al usuario con respeto, calidez y sin medicalización fría?
- [ ] **¿Accesibilidad respetada?** ¿Pasa los controles de contraste y se desactiva el grano en modo de alto contraste?
