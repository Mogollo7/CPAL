---
tags: [capl, servidor, seguridad]
---

# S01 · Seguridad

Volver a [[S00-Servidor-Inicio]]. Desarrolla los RNF-SEG y RNF-PRI de [[03-Requisitos-No-Funcionales]].

## Qué se protege

| Activo | Por qué importa | Dónde vive |
|--------|-----------------|------------|
| Datos de quien pide cita (nombre, documento, contacto, motivo) | Datos sensibles de salud; daño real a la persona si se filtran | Tabla `Cita` |
| El hecho mismo de que alguien pidió cita | También es sensible | `Cita`, correos, calendario |
| Cuentas de administración | Dan acceso a todo lo anterior | `Usuario` |
| Disponibilidad de la guía de emergencias | Alguien puede necesitarla en un mal momento | Páginas estáticas |
| Integridad de la agenda | Citas falsas o borradas dejan a personas sin atención | `Cita` |
| Secretos (llaves de Resend, Google, sesión, cifrado) | Permiten suplantar al sistema | `.env` del servidor |

## Amenazas consideradas

| # | Amenaza | Medidas principales |
|---|---------|---------------------|
| A1 | Robo o adivinación de la contraseña de un administrador | Segundo paso de ingreso, límite de intentos, aviso de ingreso ([[S02-Acceso-y-Permisos]]) |
| A2 | Un psicólogo ve datos que no le corresponden | Permisos en el servidor, consultas siempre filtradas por dueño |
| A3 | Envío masivo de solicitudes falsas | Límite de intentos, campo trampa, límite de citas por persona |
| A4 | Manipular identificadores para ver citas ajenas | Enlaces firmados; nunca se confía en un identificador del navegador |
| A5 | Inyección (SQL, HTML, cabeceras de correo) | Consultas parametrizadas, salida escapada, validación estricta |
| A6 | Subir un archivo malicioso como foto | Verificación de contenido, reprocesado, nombre aleatorio, sin ejecución |
| A7 | Fuga por registros, copias o correos | Sin datos personales en registros; copias cifradas; correos sin datos sensibles |
| A8 | Secreto filtrado en el repositorio | Escaneo de secretos, `.env` fuera de git, rotación |
| A9 | Dependencia comprometida | Pocas dependencias, versiones fijadas, avisos de seguridad |
| A10 | Acceso al servidor | SSH con llave, cortafuegos, base de datos no expuesta |
| A11 | Enumeración de usuarios o de citas | Respuestas idénticas exista o no el recurso |
| A12 | Abuso del sistema para enviar correo no deseado | Los correos solo salen de plantillas fijas; límites por destinatario |
| A13 | Panel de observación expuesto | Grafana con ingreso propio, sin acceso anónimo ([[S06-Observabilidad]]) |

Fuera de alcance: ataques de denegación de servicio a gran escala (se mitiga con límites básicos; no se contrata protección dedicada) y compromiso físico del servidor.

## Medidas

### Transporte y cabeceras

| Medida | Valor |
|--------|-------|
| HTTPS | Obligatorio; HTTP redirige; HSTS de un año |
| TLS | 1.2 como mínimo (lo gestiona el proxy) |
| Política de contenido | Solo recursos del propio dominio; sin scripts en línea salvo con marca de un solo uso; sin marcos de terceros |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Cámara, micrófono y ubicación desactivados |
| Marcos | El sitio no puede incrustarse en otro (`frame-ancestors 'none'`) |
| Recursos externos | Ninguno: fuentes, iconos y scripts se sirven desde el propio servidor |

### Entradas y ejecución

- **Cero input a Shell (eliminación total de inyección de comandos):** Queda **terminantemente prohibido** pasar entradas del usuario o parámetros de peticiones a comandos de consola o intérpretes de shell (`child_process.exec`, scripts bash con argumentos dinámicos, etc.). Todas las operaciones de archivo, base de datos o utilidades se ejecutan mediante código nativo de Node.js o librerías TypeScript puras.
- **Firma obligatoria en endpoints de webhook:** Cualquier webhook que reciba peticiones externas (como `POST /api/webhooks/resend`) debe validar obligatoriamente la firma criptográfica (HMAC-SHA256 con tiempo constante) antes de procesar los datos. Si la firma falta o no coincide con el secreto configurado, se rechaza de inmediato con HTTP 401.
- **Todo** lo que llega se valida en el servidor con su esquema de `contratos/`, aunque el navegador ya lo haya hecho.
- Longitud máxima en todos los campos de texto; tamaño máximo de petición general de 1 MB (6 MB exclusivo para subida de fotos).
- Los textos del usuario se muestran siempre escapados; nunca se insertan como HTML crudo.
- En correos, los datos del usuario solo entran en posiciones fijas de la plantilla; nunca en el asunto ni en las cabeceras sin limpiar saltos de línea.
- En el CSV exportado, las celdas que empiezan por `=`, `+`, `-` o `@` se anteponen con un apóstrofo para que Excel no las ejecute como fórmula.
- Las redirecciones tras ingresar solo aceptan rutas internas.

### Sesiones y peticiones

| Medida | Valor |
|--------|-------|
| Cookie de sesión | `HttpOnly`, `Secure`, `SameSite=Lax`, nombre con prefijo `__Host-` |
| Inactividad | 8 horas psicólogo · 2 horas administrador |
| Duración máxima | 12 horas, aunque haya actividad |
| Al cambiar la contraseña | Se cierran las demás sesiones del usuario |
| Usuario desactivado | Pierde el acceso en la siguiente petición |
| Falsificación de peticiones | Las acciones del servidor comprueban el origen; ninguna operación que cambie datos responde a `GET` |
| Caché | Las páginas del panel y `/cita/[token]` se envían con `no-store` |

### Contraseñas y enlaces

- argon2id con parámetros recomendados vigentes; el costo se revisa cada año ([[S08-Mantenimiento]]).
- Mínimo 10 caracteres, sin reglas de composición; se rechazan las contraseñas más comunes con una lista local.
- Los enlaces de acceso guardan solo el hash del token ([[E03-Reglas-de-Negocio]] §6).
- Comparaciones de tokens y firmas en tiempo constante.

### Límites de intentos

Los de [[E03-Reglas-de-Negocio]] §8. Además, el proxy limita a 20 peticiones por segundo por dirección de red para todo el sitio.

### Secretos

| Regla | Detalle |
|-------|---------|
| Dónde | Solo en el `.env` del servidor (permisos de lectura para el usuario de despliegue) y en los secretos de GitHub |
| Nunca | En el repositorio, en registros, en mensajes de error, en chats |
| Uno por entorno | Pruebas y producción no comparten ninguna llave |
| Mínimo alcance | La llave de Resend solo puede enviar desde el dominio del proyecto; la cuenta de servicio de Google solo ve un calendario |
| Rotación | Cada semestre y de inmediato si alguien deja el equipo o hay sospecha ([[S08-Mantenimiento]]) |
| Inventario | Tabla en `infra/README.md`: qué secreto, para qué, dónde se genera, cuándo se rotó. Sin valores |

### Archivos subidos y prevención de cargas maliciosas

- **Límites de tamaño estrictos:** Máximo **6 MB** para fotos de perfil (triplicado); máximo **9 MB** para imágenes de eventos. Peticiones que superen este tamaño se rechazan de inmediato con HTTP 413 y aviso claro al usuario.
- **Validación binaria (magic bytes):** Se inspecciona la cabecera binaria del archivo para comprobar que es realmente una imagen válida (JPEG, PNG, WebP), ignorando la extensión que envíe el cliente.
- **Conversión obligatoria a WebP:** Toda imagen subida se procesa con `sharp`, se convierte forzosamente a `.webp`, se eliminan todos los metadatos EXIF (ubicación geográfica, dispositivo) y se guarda con un nombre aleatorio criptográfico (UUIDv4).
- Se guardan fuera de la carpeta pública de la aplicación y se sirven con cabeceras `Content-Type: image/webp` y `X-Content-Type-Options: nosniff`.

### Algoritmos criptográficos y dependencias

- **Algoritmos modernos autorizados:** Únicamente `argon2id` para contraseñas, `HMAC-SHA256` para firmas de webhooks y tokens, y `AES-256-GCM` para datos en reposo.
- **Prohibición de algoritmos obsoletos:** Queda estrictamente vetado el uso de MD5, SHA-1, DES, 3DES, RC4 o bcrypt con factores de trabajo bajos.
- **Dependencias mínimas y sin vulnerabilidades:** Bloqueadas con `package-lock.json`, escaneadas en CI con `npm audit` estricto; cualquier dependencia con vulnerabilidad de severidad alta o crítica se actualiza o sustituye de inmediato.
- Imagen Docker base mínima, proceso sin privilegios de administrador (`non-root`), sistema de archivos de solo lectura salvo las carpetas de almacenamiento de datos.

## Comprobación antes de lanzar (tarea T-504)

- [ ] Cada operación de [[E05-Operaciones-y-Contratos]] probada con cada rol y sin sesión
- [ ] Un psicólogo no puede leer ni cambiar nada de otro, ni adivinando identificadores
- [ ] Enlace de cita con la firma alterada → rechazado sin revelar nada
- [ ] Cabeceras de seguridad presentes (comprobación con una herramienta en línea)
- [ ] Ningún recurso se carga desde otro dominio
- [ ] Búsqueda en los registros de un correo y un documento de prueba → cero resultados
- [ ] Subir un archivo que no es imagen con extensión `.jpg` → rechazado
- [ ] 10 ingresos fallidos seguidos → bloqueo temporal
- [ ] El repositorio no contiene secretos (escaneo)
- [ ] La base de datos no responde desde fuera del servidor
- [ ] El CSV con una celda `=1+1` se abre como texto
- [ ] Grafana no es accesible sin ingresar
