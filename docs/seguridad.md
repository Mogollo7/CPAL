← [README](../README.md) · [Anterior: Arquitectura](arquitectura.md) · [Siguiente: Segundo paso (2FA)](autenticacion-2fa.md)

# Seguridad y privacidad

<p align="center"><img src="img/doc-seguridad.webp" alt="" width="70%"></p>

## Contraseñas e ingreso

| Mecanismo             | Cómo funciona                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Almacenamiento        | argon2id                                                                                              |
| Requisitos            | Mínimo 10 caracteres, distinta del correo y fuera de una lista de contraseñas comunes                 |
| Mensaje de error      | El mismo exista o no el correo; se verifica contra un hash de relleno para igualar tiempos            |
| Límite de intentos    | 5 fallos por correo y red en 15 minutos                                                               |
| Bloqueo               | 15 fallos en un día: la cuenta exige crear una contraseña nueva por enlace                            |
| Enlaces de contraseña | Token aleatorio del que solo se guarda el SHA-256; vigente 48 horas y se anula al crear la contraseña |
| Administradores       | [Segundo paso por correo](autenticacion-2fa.md)                                                       |

## Sesiones y permisos

| Mecanismo            | Cómo funciona                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cookie de sesión     | `HttpOnly`, `SameSite=Lax`; fuera de local, `Secure` y prefijo `__Host-`                                                                                                        |
| Inactividad          | 2 horas administración, 8 horas psicología                                                                                                                                      |
| Revocación           | Cambiar la contraseña o «cerrar mis sesiones» invalida las sesiones anteriores y olvida los dispositivos                                                                        |
| Usuario desactivado  | Pierde el acceso en la siguiente petición                                                                                                                                       |
| Permisos             | Se comprueban en el servidor en cada página y operación; cada psicólogo solo consulta lo suyo                                                                                   |
| Acciones sensibles   | Piden la contraseña de nuevo (vale 10 minutos): exportar CSV, ver o cambiar la configuración, crear administradores, activar o desactivar cuentas y gestionar cuentas de prueba |
| Último administrador | No se puede desactivar                                                                                                                                                          |
| Auditoría            | Registra, entre otros, ingresos correctos y fallidos, y cambios de citas                                                                                                        |

La [matriz de permisos completa](../cerebro/servidor/S02-Acceso-y-Permisos.md#matriz-de-permisos) está en S02.

## Datos y abuso

| Mecanismo            | Cómo funciona                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Motivo de consulta   | Cifrado con AES-256-GCM y llave versionada; nunca viaja en correos                                                    |
| Correos              | Sin motivo, documento ni edad                                                                                         |
| Registros            | Sin datos personales; direcciones de red truncadas                                                                    |
| Anonimización        | Pasados 12 meses (configurable) se borran los datos personales de la cita                                             |
| Enlace de cita       | Firmado con HMAC; si se altera, no revela si la cita existe                                                           |
| Límites por hora     | 5 solicitudes de cita por red, 5 consultas por código por red, 3 enlaces de contraseña por correo                     |
| Anti-spam            | Campo trampa en el formulario de cita                                                                                 |
| Imágenes subidas     | Se valida la cabecera binaria, se convierten a WebP sin metadatos y se renombran al azar                              |
| Webhook de Resend    | Se verifica la firma                                                                                                  |
| Tarea programada     | Exige el secreto `CRON_SECRET`                                                                                        |
| Base de datos        | La aplicación usa un rol que no puede alterar el esquema                                                              |
| Cabeceras            | CSP, HSTS en producción, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y bloqueo de incrustación en otros sitios |
| Integración continua | Escaneo de secretos (gitleaks) y `npm audit`                                                                          |

## Límites conocidos

- La CSP aún admite scripts en línea (`unsafe-inline`); falta generar un _nonce_.
- Los límites de intentos viven en memoria: se reinician con la aplicación y suponen una sola instancia.
- El segundo paso depende del buzón: quien controle ese correo y la contraseña, entra.
- Cada ingreso con la contraseña correcta genera un código nuevo con 5 intentos, y esos ingresos no tienen un límite propio.
- La [lista de seguridad](../cerebro/operacion/Lista-de-Seguridad-RNF-SEG.md) conserva comprobaciones previas al lanzamiento sin marcar. Está fechada el 16-nov-2026 y algunos puntos ya cambiaron en el código.

Fuente detallada: [S01 · Seguridad](../cerebro/servidor/S01-Seguridad.md) · [Inventario de secretos](../cerebro/operacion/Inventario-de-Secretos.md)
