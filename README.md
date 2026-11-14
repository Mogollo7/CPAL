# CAPL — Centro de Atención Psicológica La Salle

Documentación y decisiones: carpeta [`cerebro/`](cerebro/00-Inicio.md). Reparto y protocolo del equipo: `cerebro/06` y `cerebro/07`.

## Levantar el proyecto (menos de 10 minutos)

Necesitas Node 24 (`.nvmrc`) y Docker.

```bash
cp .env.example .env     # y rellena AUTH_SECRET (cadena aleatoria de 32+ caracteres)
npm install
npm run bd:subir         # PostgreSQL local (Docker, puerto 5433)
npm run bd:migrar
npm run bd:semilla
npm run dev              # http://localhost:3000
```

Comprobaciones: `npm run lint`, `npm run tipos`, `npm run pruebas`, `npm run build`.

## Datos de ejemplo para desarrollo

La semilla crea usuarios de **ejemplo** (ningún dato real). Contraseña de prueba de todos: `clave-de-prueba-capl`.
Psicólogos: `psicologo1@ejemplo.test` … `psicologo4@ejemplo.test` (el 4 está inactivo).
El administrador (`admin@ejemplo.test`, o el de `ADMIN_INICIAL_CORREO`) pide segundo paso, que llega en T-217.

## Carpetas y dueños

`servidor/`, `contratos/`, `prisma/`, `correos/`, `infra/`, `estilos/`: Sebas · `app/(panel)/`, `componentes/panel/`: Brand · `app/(publico)/`, `componentes/ui/`, `contenido/`: César.
