# componentes/ui — piezas genéricas

Sin dominio del CAPL: se pueden usar en el sitio público y en el panel. Archivos en kebab-case (N11).

- `cn.ts`: une clases de Tailwind (`clsx` + `tailwind-merge`).
- `campo.tsx`: etiqueta + campo de texto + error (`Campo`, `CLASE_CONTROL`).
- `acordeon-faq.tsx`: acordeón accesible con teclado.
- `boton-llamar.tsx`: botón `tel:` táctil.
- `esqueleto-calmo.tsx`: esqueletos de carga con pulso lento (3 s).
- `transicion-suave.tsx`: entrada desvanecida con `motion/react`; respeta `prefers-reduced-motion`.

Lo que es de una pantalla va en `componentes/publico/` (sitio) o `componentes/panel/` (paneles).
