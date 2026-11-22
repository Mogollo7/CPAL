# componentes/publico — sitio público

Piezas de las páginas de `app/(publico)/`. Archivos en kebab-case (N11); un componente grande se parte en una
carpeta con un archivo por parte (p. ej. `pedir-cita/`: un archivo por paso).

- El marco de página (encabezado, pie, ayuda) vive en `componentes/organismos/`.
- `ejercicio-anclaje.tsx`, `orientador-crisis.tsx`: /ayuda-inmediata (leen `contenido/`).
- `pedir-cita/`: /pedir-cita. Habla con el servidor solo por `servidor/acciones.ts`.
