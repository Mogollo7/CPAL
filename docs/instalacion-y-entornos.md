← [README](../README.md) · [Anterior: Correos](correos.md) · [Siguiente: Operación](operacion.md)

# Instalación y entornos

## Local

Necesitas Node 24 ([`.nvmrc`](../.nvmrc)) y Docker.

```bash
cp .env.example .env     # rellena AUTH_SECRET y CLAVE_CIFRADO
npm install
npm run bd:subir         # PostgreSQL en Docker, puerto 5433
npm run bd:migrar
npm run bd:semilla
npm run dev              # http://localhost:3000
```

`AUTH_SECRET` es una cadena aleatoria de 32 caracteres o más y `CLAVE_CIFRADO` son 32 bytes en base64. Este comando genera un valor válido para cualquiera de las dos:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Cuentas de ejemplo

La semilla crea datos ficticios. La contraseña de todas es `clave-de-prueba-capl`.

| Cuenta                                                | Rol                                               |
| ----------------------------------------------------- | ------------------------------------------------- |
| `admin@ejemplo.test` (o `ADMIN_INICIAL_CORREO`)       | Administración; pide código en un navegador nuevo |
| `psicologo1@ejemplo.test` a `psicologo4@ejemplo.test` | Psicología; la 4 está inactiva                    |

En local, con `CORREO_MODO=consola` y `CORREO_BUZON_LOCAL=./datos/buzon`, los correos (incluido el código de ingreso) quedan como archivos de texto. Los que van por la cola, como la invitación, se procesan con:

```bash
npm run correos:procesar-local
```

Para probar otra cuenta sin cerrar la tuya, abre el enlace en una ventana privada.

El **superusuario** (en local, el administrador inicial; en otros entornos, `SUPERUSUARIO_CORREO`) crea administradores y puede borrar las cuentas marcadas como **Cuenta de prueba** en local y pruebas. Las cuentas de ejemplo, las no marcadas y las que tienen citas no se borran.

## Entornos

| `ENTORNO`    | Datos      | Correo                                        |
| ------------ | ---------- | --------------------------------------------- |
| `local`      | De ejemplo | `CORREO_MODO=consola`                         |
| `pruebas`    | De ejemplo | `resend`, redirigido con `CORREO_REDIRIGIR_A` |
| `produccion` | Reales     | `resend`                                      |

## Variables principales

La lista completa, sin valores secretos, está en [`.env.example`](../.env.example). **Nunca subas `.env`.**

| Variable                                | Para qué                                                       |
| --------------------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`, `DATABASE_URL_MIGRADOR` | Conexión de la aplicación y de las migraciones                 |
| `AUTH_SECRET`                           | Firma de sesiones, enlaces y códigos                           |
| `CLAVE_CIFRADO`                         | Cifrado del motivo de consulta y de tokens en la cola          |
| `URL_SITIO`                             | Dirección usada en los enlaces de los correos                  |
| `CORREO_MODO`, `RESEND_API_KEYS`        | Modo de envío; varias llaves separadas por coma, por prioridad |
| `CORREO_REMITENTE`, `CORREO_RESPUESTA`  | Quién envía y quién recibe las respuestas                      |
| `CRON_SECRET`                           | Autoriza la tarea programada                                   |
| `RUTA_ARCHIVOS`                         | Imágenes subidas                                               |

## El sitio completo en Docker

| Comando                  | Hace                                                |
| ------------------------ | --------------------------------------------------- |
| `npm run pc:subir`       | Construye y arranca todo en `http://localhost:3000` |
| `npm run pc:subir:tunel` | Además publica por un túnel propio de Cloudflare    |
| `npm run pc:parar`       | Apaga y conserva los datos                          |
| `npm run pc:logs`        | Muestra las últimas líneas de la aplicación         |

Fuente detallada: [infra/README.md](../infra/README.md) · [E01 · Stack y entorno](../cerebro/especificacion/E01-Stack-y-Entorno.md)
