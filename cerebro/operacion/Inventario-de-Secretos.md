---
tags: [capl, operacion, secretos]
---

# Inventario de secretos (T-515)

Volver a [[S01-Seguridad]] y [[S08-Mantenimiento]]. **Aquí nunca van valores**: solo qué es cada secreto, dónde vive y cuándo se rotó. Se rota cada semestre y de inmediato si alguien deja el equipo o hay sospecha. Cada entorno tiene los suyos (pruebas y producción no comparten ninguno). Al rotar, escribir la fecha en la columna del entorno y una línea en la [[Bitacora]].

## Secretos de la aplicación (`.env` del servidor, permisos 600)

| Secreto | Para qué | Dónde se genera | Pruebas: rotado | Producción: rotado |
|---------|----------|-----------------|-----------------|--------------------|
| `AUTH_SECRET` | Firma las sesiones y los enlaces de cita | `openssl rand -base64 48` | — | — |
| `CRON_SECRET` | Autoriza `POST /api/tareas` (lo usa `infra/tareas.sh`) | `openssl rand -base64 32` | — | — |
| `CLAVE_CIFRADO` (con número de versión) | Cifra el motivo de consulta | `openssl rand -base64 32` | — | — |
| `RESEND_API_KEYS` | Envío de correo (cuenta 1 y respaldo 2) | Panel de Resend, solo enviar desde el dominio del proyecto | — | — |
| `RESEND_WEBHOOK_SECRET` | Firma de los avisos de entrega | Panel de Resend | — | — |
| `GMAIL_CLAVE_APP` | Respaldo de envío por Gmail | Cuenta de Google dedicada | — | — |
| `GOOGLE_CREDENCIALES` | Cuenta de servicio del calendario (solo ve un calendario) | Consola de Google Cloud | — | — |
| `DATABASE_URL` (clave de `capl_app`) | La aplicación, solo datos | Al crear el rol | — | — |
| `DATABASE_URL_MIGRADOR` (clave de `capl_migrador`) | Migraciones; también las copias de seguridad | Al crear el rol | — | — |
| `ADMIN_INICIAL_CORREO` | No es secreto, pero define el primer administrador | — | — | — |

## Secretos de infraestructura (fuera del repositorio)

| Secreto | Para qué | Dónde vive | Rotado |
|---------|----------|------------|--------|
| Frase de cifrado de las copias (`RESPALDO_CLAVE_ARCHIVO`) | Abrir las copias externas | Archivo `600` en el servidor **y** gestor de contraseñas del equipo; nunca junto a las copias | — |
| Llave SSH hacia el destino de copias externas (P-21) | `rsync` de las copias | `/etc/capl/ssh`, solo escritura en esa carpeta del destino | — |
| Llave SSH de despliegue | El flujo de GitHub entra a pruebas y producción | Secretos de GitHub | — |
| Llaves SSH de las personas | Acceso al servidor | Cada persona; se retiran al salir del equipo | — |
| Token del túnel de Cloudflare (solo desarrollo) | `npm run tunel` | `.env` local de cada persona | — |
| Monitor externo | Cuenta del servicio de monitoreo | Gestor de contraseñas | — |

## Quién tiene acceso (se revisa cada semestre)

| Sistema | Personas con acceso | Revisado |
|---------|--------------------|----------|
| Servidor (SSH) | — (mínimo 2: quien opera y la segunda persona, P-25) | — |
| GitHub (repositorio y secretos) | — | — |
| Resend | — | — |
| Google (calendario, Gmail de respaldo) | — | — |
| Destino de copias externas | — | — |
| DNS / dominio | — | — |

## Reglas

1. Un secreto nuevo se **añade a esta tabla antes** de usarse y a `.env.example` (solo el nombre).
2. Nunca por chat, correo ni capturas. Se entregan por el gestor de contraseñas.
3. Rotar `AUTH_SECRET` cierra todas las sesiones e invalida los enlaces de cita ya enviados; se hace en horas de poca actividad ([[S08-Mantenimiento]]).
4. `CLAVE_CIFRADO` **no se borra** mientras existan datos cifrados con esa versión.
5. Si uno se filtra: rotarlo **primero**, investigar después, y anotarlo en la [[Bitacora]].
