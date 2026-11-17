Dueño: Sebas (infraestructura).

## Base de datos local

- `npm run bd:subir` levanta PostgreSQL (Docker, puerto **5433**). La primera vez crea los roles de `infra/bd/init.sql`:
  `capl_migrador` (dueño del esquema, lo usa solo `bd:migrar`) y `capl_app` (la aplicación: solo datos, no puede alterar tablas).
- Si ya tenías un volumen creado antes de T-016: `docker exec -i capl-db psql -U capl -d capl < infra/bd/init.sql` y luego `npm run bd:reiniciar`.
- Claves locales de desarrollo; en pruebas y producción salen de secretos del servidor.

## Túnel de Cloudflare (opcional)

`npm run tunel` — usa **tu propio** túnel y token (`CLOUDFLARE_TUNNEL_TOKEN` en `.env`); nunca compartas ni reutilices el token de un túnel que ya sirve otras aplicaciones.

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
