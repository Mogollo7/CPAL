# componentes/publico — sitio público

Piezas de las páginas de `app/(publico)/`. Archivos en kebab-case (N11); un componente grande se parte en una
carpeta con un archivo por parte (p. ej. `pedir-cita/`: un archivo por paso).

- `encabezado-publico.tsx`, `pie-publico.tsx`, `boton-ayuda-ahora.tsx`: marco de todas las páginas.
- `catalogo-servicios.tsx`: /servicios.
- `ejercicio-anclaje.tsx`, `orientador-crisis.tsx`: /ayuda-inmediata (leen `contenido/`).
- `pedir-cita/`: /pedir-cita. Habla con el servidor solo por `servidor/acciones.ts`.
