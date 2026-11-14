Dueño: Sebas (infraestructura).

## Base de datos local

- `npm run bd:subir` levanta PostgreSQL (Docker, puerto **5433**). La primera vez crea los roles de `infra/bd/init.sql`:
  `capl_migrador` (dueño del esquema, lo usa solo `bd:migrar`) y `capl_app` (la aplicación: solo datos, no puede alterar tablas).
- Si ya tenías un volumen creado antes de T-016: `docker exec -i capl-db psql -U capl -d capl < infra/bd/init.sql` y luego `npm run bd:reiniciar`.
- Claves locales de desarrollo; en pruebas y producción salen de secretos del servidor.

## Túnel de Cloudflare (opcional)

`npm run tunel` — usa **tu propio** túnel y token (`CLOUDFLARE_TUNNEL_TOKEN` en `.env`); nunca compartas ni reutilices el token de un túnel que ya sirve otras aplicaciones.
