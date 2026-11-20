Dueño: Sebas (infraestructura).

## Base de datos local

- `npm run bd:subir` levanta PostgreSQL (Docker, puerto **5433**). La primera vez crea los roles de `infra/bd/init.sql`:
  `capl_migrador` (dueño del esquema, lo usa solo `bd:migrar`) y `capl_app` (la aplicación: solo datos, no puede alterar tablas).
- Si ya tenías un volumen creado antes de T-016: `docker exec -i capl-db psql -U capl -d capl < infra/bd/init.sql` y luego `npm run bd:reiniciar`.
- Claves locales de desarrollo; en pruebas y producción salen de secretos del servidor.

## Túnel de Cloudflare (opcional)

`npm run tunel` — usa **tu propio** túnel y token (`CLOUDFLARE_TUNNEL_TOKEN` en `.env`); nunca compartas ni reutilices el token de un túnel que ya sirve otras aplicaciones.

## El sitio completo en este equipo (Docker)

`infra/compose.pc.yml`: base de datos, migraciones, app y, si quieres, el túnel; todo en contenedores.

| Comando                  | Hace                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `npm run pc:subir`       | construye y arranca; la app queda en `http://localhost:3000`          |
| `npm run pc:subir:tunel` | lo mismo + el túnel de Cloudflare propio                              |
| `npm run pc:parar`       | apaga todo (los datos quedan en los volúmenes `datos_db`, `archivos`) |
| `npm run pc:logs`        | últimas líneas de la app                                              |

- El puerto de este equipo es `3000`; cámbialo con `PUERTO_APP` en `.env`.
- Para publicarlo en un dominio hace falta un túnel **propio** (un token nuevo en `.env › CLOUDFLARE_TUNNEL_TOKEN`) cuyo
  «Public hostname» sea `tu-dominio → HTTP → app:3000`. Si el dominio ya apunta a otro túnel, se mueve ese hostname al nuevo.
- La base queda en `127.0.0.1:5434` (solo este equipo). Datos de ejemplo (`prisma/semilla.ts`; si ya hay, no duplica):
  `$env:DATABASE_URL="postgresql://capl_app:app_local@localhost:5434/capl"; npx tsx prisma/semilla.ts`
- Cuentas de ejemplo (clave de todas: `clave-de-prueba-capl`): `admin@ejemplo.test` (administración) y
  `psicologo1@ejemplo.test` … `psicologo3@ejemplo.test` (psicología). La administración pide un código de 6 dígitos al
  ingresar; con `CORREO_MODO=consola` no sale ningún correo, así que en local se fija el código a mano en la base.
- `URL_SITIO` en `.env` debe ser la dirección pública (los correos arman enlaces e imágenes con ella).

## Servicios programados (fase 1: Node sin Docker, systemd)

Dos temporizadores; todo se instala una sola vez en el servidor (nada se ejecuta desde este repositorio).

| Unidad                                       | Hace                                                  | Cuándo      |
| -------------------------------------------- | ----------------------------------------------------- | ----------- |
| `capl-tareas.timer` → `tareas.sh`            | `POST /api/tareas` con `CRON_SECRET` (S05)            | cada minuto |
| `capl-respaldo.timer` → `respaldo.sh diario` | copia de la BD y los archivos + copia externa cifrada | 2:00 a. m.  |

```sh
sudo install -d -m 750 -o capl /etc/capl
# /etc/capl/capl.env      → CRON_SECRET=…  APP_URL_INTERNA=http://127.0.0.1:3000   (permisos 600)
# /etc/capl/respaldo.env  → PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE DIR_RESPALDOS RUTA_ARCHIVOS
#                           RESPALDO_CLAVE_ARCHIVO RESPALDO_DESTINO_EXTERNO               (permisos 600)
sudo cp infra/systemd/capl-*.service infra/systemd/capl-*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now capl-tareas.timer capl-respaldo.timer
systemctl list-timers 'capl-*'            # comprobar que ambos tienen "siguiente ejecución"
journalctl -u capl-tareas -n 5            # la última llamada debe terminar sin error
```

Fase 2 (Docker): `compose.servicios.yml` define los servicios `tareas` y `respaldo` con los mismos scripts.

## Copias de seguridad (T-506, RNF-REN-04)

| Qué                                                                           | Dónde                                                                       | Retención     |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------- |
| `bd-diario-AAAAMMDD-HHMMSS.dump` (`pg_dump -Fc`) y `archivos-diario-….tar.gz` | `$DIR_RESPALDOS/local`                                                      | 14 días       |
| Las mismas, cifradas (`.gpg`, AES-256)                                        | `$DIR_RESPALDOS/externo` y `RESPALDO_DESTINO_EXTERNO` por `rsync` sobre SSH | 30 días       |
| Antes de desplegar a producción: `respaldo.sh despliegue`                     | `$DIR_RESPALDOS/local`                                                      | las 5 últimas |

- La frase de cifrado vive en `RESPALDO_CLAVE_ARCHIVO`, **en otro lugar que las copias** (S08). Se guarda también en el gestor de contraseñas del equipo: sin ella las copias externas no se pueden abrir.
- Si falta `RESPALDO_DESTINO_EXTERNO`, el script termina con error: **sin copia externa no se lanza** (P-21).
- El usuario de la copia es `capl_migrador` (lectura total); la aplicación (`capl_app`) nunca hace copias.
- Ejecutar a mano: `sudo -u capl env $(cat /etc/capl/respaldo.env | xargs) /srv/capl/infra/respaldo.sh diario`.

## Restaurar

```sh
# 1. Elegir la copia (más reciente primero) y, si es externa, traerla del destino.
ls -1t $DIR_RESPALDOS/local/bd-diario-*.dump | head -3
# 2. Restaurar sobre una base VACÍA o de pruebas (pide escribir el nombre de la base para confirmar).
infra/restaurar.sh $DIR_RESPALDOS/local/bd-diario-AAAAMMDD-HHMMSS.dump [archivos-diario-….tar.gz]
# Si la copia es externa y cifrada: pasar el .dump.gpg; usa RESPALDO_CLAVE_ARCHIVO.
```

### Simulacro de restauración (cada semestre; lo hace la segunda persona, T-515)

1. En el servidor de **pruebas** (`/srv/capl-pruebas`), con su propia base: traer la copia **externa** más reciente.
2. Ejecutar `restaurar.sh` con ella (la `.gpg`, para probar también la frase de cifrado).
3. Arrancar la aplicación de pruebas y comprobar: `GET /api/salud` → `{"estado":"ok"}`; iniciar sesión como administrador; abrir una cita de ayer en el panel; ver que las fotos del equipo cargan.
4. Anotar en `cerebro/operacion/Bitacora.md`: fecha, copia usada, cuánto tardó, quién lo hizo, qué falló.
5. Si algo falló, arreglarlo **antes** de dar por buena la copia.

Una copia que no se ha restaurado nunca no cuenta como copia (S03).

## Monitor externo y actualizaciones (T-508, RNF-REN-06 y 09)

**Monitor externo** (gratuito; p. ej. UptimeRobot o Better Stack, fuera del servidor):

| Ajuste             | Valor                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| URL                | `https://<dominio>/api/salud` (producción) y la de pruebas aparte                       |
| Intervalo          | 5 minutos                                                                               |
| Condición de caída | HTTP distinto de 200 o texto sin `"estado":"ok"`                                        |
| Aviso              | Después de **2 fallos seguidos**, por correo al equipo y al correo del CAPL             |
| Segundo monitor    | Palabra clave en `/ayuda-inmediata` ("123"): la guía debe estar viva aunque la BD caiga |

Prueba de alerta (obligatoria antes del lanzamiento): detener `capl-app` (o `docker compose stop app`) 11 minutos, confirmar que llega el correo, volver a levantar y confirmar el aviso de recuperación. Anotarlo en la bitácora.

**Actualizaciones automáticas del sistema**: copiar `infra/sistema/20auto-upgrades` y `infra/sistema/52capl-unattended-upgrades` a `/etc/apt/apt.conf.d/` (`sudo apt install unattended-upgrades`). Solo parches de seguridad y **sin reinicio automático**. Comprobar: `sudo unattended-upgrade --dry-run -d | tail` y `systemctl status apt-daily-upgrade.timer`. Reinicio pendiente: `[ -f /var/run/reboot-required ] && echo pendiente` (se revisa en la lista del semestre; Docker o systemd levantan todo solos).

Otros documentos de operación: `cerebro/operacion/` (manual, inventario de secretos, bitácora, lista de seguridad).

## Despliegue con Docker (fase 2 de E07)

Archivos: `../Dockerfile` (imágenes `app` y `migrador`), `compose.produccion.yml` (base, migraciones, aplicación y proxy Caddy), `compose.servicios.yml` (tareas y respaldo), `Caddyfile`. El flujo `.github/workflows/desplegar.yml` publica las imágenes en `ghcr.io/mogollo7/cpal` y actualiza el servidor por SSH.

**Estado:** la imagen `app` se construye en local; el compose y el flujo **no se han ejecutado en un servidor**. Revisar en el primer despliegue.

Primera vez en el servidor:

1. Instalar Docker, crear el usuario de despliegue (grupo `docker`) y clonar el repositorio en `/srv/capl-pruebas`.
2. Crear `infra/.env` a partir de `.env.example` con `ENTORNO=pruebas`, `DOMINIO`, `POSTGRES_PASSWORD`, `AUTH_SECRET`, `CLAVE_CIFRADO`, `CRON_SECRET`, las llaves de Resend y las dos URL de base de datos apuntando a `db:5432`.
3. Si el paquete de GitHub es privado: `docker login ghcr.io` con un token de solo lectura de paquetes.
4. `docker compose -p capl-pruebas -f compose.produccion.yml up -d db` y **cambiar las claves de desarrollo** de los roles:
   `docker compose -p capl-pruebas -f compose.produccion.yml exec db psql -U capl -c "ALTER ROLE capl_app PASSWORD '…'; ALTER ROLE capl_migrador PASSWORD '…';"` (las mismas que en las URL de `infra/.env`).
5. En GitHub, crear los secretos `SSH_HOST`, `SSH_USER` y `SSH_KEY`, y lanzar el flujo «Desplegar a pruebas».
6. Apuntar el DNS de `DOMINIO` al servidor: Caddy pide el certificado solo.

Producción es otro proyecto de Compose (`-p capl`) en otra carpeta, con su propio `infra/.env` y `ENTORNO=produccion`.
