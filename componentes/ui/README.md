# Componentes UI Públicos — CAPL

Dueño: César (sistema de diseño público).  
Colaborador IA: Gemini.

## Primitivas de Bienestar y Movimiento

- `cn.ts`: Utilidad de fusión para Tailwind CSS y condicionales (`clsx` + `tailwind-merge`).
- `esqueleto-calmo.tsx`: Componentes de esqueleto con pulso respiratorio (3.0s / 0.33 Hz) para carga sin sobresaltos (`EsqueletoCalmo`, `EsqueletoParrafo`, `EsqueletoTarjetaCita`).
- `transicion-suave.tsx`: Envoltorio con `motion/react` para entradas desvanecidas (máximo 8-10px) y respeto estricto a `prefers-reduced-motion`.
- `animacion-biofilica.tsx`: Micro-movimientos biofílicos en bucle largo ($\ge 6\text{ s}$) impulsados por Anime.js v4.
