---
tags: [capl, especificacion, reglas]
---

# E03 · Reglas de negocio

Volver a [[E00-Especificacion-Inicio]]. Dueño: rol B. Toda esta lógica vive en `servidor/` como funciones puras y lleva pruebas.

## 1. Valores configurables

Todos en la tabla `Configuracion`, editables desde el panel. Los valores por defecto rigen hasta que el CAPL responda el [[11-Cuestionario-CAPL]].

| Valor | Por defecto | Significa |
|-------|-------------|-----------|
| `autoAutorizar` | no | Las citas nacen autorizadas |
| `anticipacionMinHoras` | 24 | No se puede pedir una cita que empiece antes de este plazo |
| `anticipacionMaxDias` | 30 | Ni después de este |
| `cancelacionMinHoras` | 12 | Hasta cuándo el paciente puede cancelar o reprogramar por su cuenta |
| `maxCitasActivas` | 1 | Citas `PENDIENTE` o `AUTORIZADA` futuras por persona |
| `maxReprogramaciones` | 2 | Veces que una misma cita puede reprogramarse |
| `vencimientoPendienteHoras` | 48 | Tiempo máximo sin respuesta |
| `duracionEnlaceHoras` | 48 | Vigencia del enlace para crear contraseña |
| `conservacionMeses` | 12 | Después se anonimiza |
| `dominiosPermitidos` | — | Dominios de correo válidos para psicólogos |
| `correoAdministracion` | — | Recibe los avisos de nuevas solicitudes |

La duración de la cita es por servicio (`Servicio.duracionMin`, 60 por defecto).

## 2. Cálculo de cupos

Función `calcularCupos(servicio, psicologos, desde, hasta, ahora, datos) → Cupo[]`. Es **pura**: recibe todo lo que necesita y no consulta nada.

```
para cada psicólogo activo que atiende el servicio:
  para cada día entre desde y hasta:
    si el día es festivo → saltar
    para cada bloque de Disponibilidad de ese día de la semana:
      partir el bloque en tramos de duracionMin, empezando en inicioMin
      (un tramo que no cabe completo antes de finMin se descarta)
      descartar el tramo si:
        · empieza antes de ahora + anticipacionMinHoras
        · empieza después de ahora + anticipacionMaxDias
        · se cruza con un Bloqueo del psicólogo o del centro
        · se cruza con una Cita PENDIENTE o AUTORIZADA del psicólogo
agrupar por hora de inicio → { inicio, fin, psicologoIds[] }
ordenar por inicio
```

Reglas de detalle:

- "Se cruza" significa que los rangos `[inicio, fin)` se solapan; tocarse en el borde no es cruce.
- El día y la hora se interpretan en `America/Bogota`.
- Si se pide un psicólogo concreto, solo se calcula ese. Si se pide "cualquiera", `psicologoIds` trae todos los libres en ese tramo.
- La consulta se limita a ventanas de máximo 14 días por llamada.

### Asignación con "cualquiera disponible"

Al crear la cita sin psicólogo elegido, el servidor asigna, entre los `psicologoIds` del tramo, **al que tenga menos citas activas ese día**; en empate, al de menor carga en la semana; en empate, al azar. Si la inserción falla por cruce, se intenta con el siguiente.

### Casos que la prueba debe cubrir

Bloque que no es múltiplo de la duración · festivo · bloqueo parcial de un tramo · bloqueo de todo el centro · cita pendiente ocupa cupo · cita cancelada lo libera · borde de anticipación mínima y máxima · psicólogo inactivo · psicólogo sin disponibilidad · dos psicólogos en el mismo tramo · servicio que el psicólogo no atiende · cambio de día por zona horaria (una cita a las 7 p. m. de Bogotá es el día siguiente en UTC).

## 3. Estados de la cita

Única función que cambia el estado: `transicionar(cita, evento, actor)`. Cualquier combinación que no esté en la tabla responde `TRANSICION_INVALIDA`.

| Desde | Evento | Quién | Condición | Hacia | Efectos |
|-------|--------|-------|-----------|-------|---------|
| — | crear | Persona | Cupo libre; dentro de los límites | `PENDIENTE` (o `AUTORIZADA` si `autoAutorizar`) | Fija `venceEn`; correos de [[E06-Correos]] |
| `PENDIENTE` | autorizar | Admin | `inicio` en el futuro | `AUTORIZADA` | Borra `venceEn`; correo al paciente y al psicólogo |
| `PENDIENTE` | rechazar | Admin | Motivo obligatorio | `RECHAZADA` | Correo al paciente |
| `PENDIENTE` | vencer | Sistema | `ahora ≥ venceEn` | `VENCIDA` | Correo al paciente |
| `PENDIENTE` / `AUTORIZADA` | cancelar | Persona | `ahora ≤ inicio − cancelacionMinHoras` | `CANCELADA` | Correo al paciente; al psicólogo si estaba autorizada |
| `PENDIENTE` / `AUTORIZADA` | cancelar | Admin | `inicio` en el futuro; motivo | `CANCELADA` | Igual |
| `PENDIENTE` / `AUTORIZADA` | reprogramar | Persona | Mismo límite de cancelación; `reprogramaciones < maxReprogramaciones`; nuevo cupo libre | Actual → `CANCELADA`; se crea otra | Ver §4 |
| `AUTORIZADA` | marcar atendida | Admin | `inicio` en el pasado | `ATENDIDA` | — |
| `AUTORIZADA` | marcar inasistencia | Admin | `inicio` en el pasado | `NO_ASISTIO` | — |

- `RECHAZADA`, `VENCIDA`, `CANCELADA`, `ATENDIDA` y `NO_ASISTIO` son **finales**.
- Toda transición escribe una fila en `Auditoria`.
- `venceEn = el menor entre (creadaEn + vencimientoPendienteHoras) y (inicio − 2 horas)`.
- Los correos y la publicación en el calendario no ocurren dentro de la transición: se encolan en `Trabajo` **en la misma transacción** que el cambio de estado ([[S05-Colas-y-Tareas]]).

## 4. Reprogramar

En **una sola transacción**: se crea la cita nueva (mismo paciente, nuevo horario, `reprogramadaDeId` apuntando a la anterior y `reprogramaciones + 1`) y la anterior pasa a `CANCELADA`. Si el nuevo cupo ya no está libre, no cambia nada y se responde `CUPO_OCUPADO`.

La cita nueva sigue el flujo normal: `AUTORIZADA` si hay auto-autorización; si no, `PENDIENTE` y administración vuelve a autorizar. El enlace del correo anterior deja de ofrecer acciones; el correo nuevo trae el enlace de la cita nueva.

## 5. Límites al pedir cita

Antes de crear, en este orden:

1. Datos válidos según el contrato → si no, `VALIDACION`.
2. Límite de intentos por dirección de red → `DEMASIADOS_INTENTOS`.
3. Servicio activo y agendable en línea → `SERVICIO_NO_DISPONIBLE`.
4. Horario dentro de la anticipación mínima y máxima, y es un cupo válido según §2 → `FUERA_DE_RANGO`.
5. La persona (mismo correo **o** mismo documento) no supera `maxCitasActivas` → `LIMITE_CITAS`.
6. Inserción → si la base de datos detecta cruce, `CUPO_OCUPADO`.

## 6. Enlaces

### Crear o recuperar contraseña (`TokenAcceso`)

| Regla | Valor |
|-------|-------|
| Token | 32 bytes aleatorios; en la base de datos solo se guarda su SHA-256 |
| Vigencia | `duracionEnlaceHoras` (48 por defecto, entre 24 y 48) |
| Se puede abrir | Las veces que sea mientras esté vigente y sin usar (D-06) |
| Se invalida | Al crear la contraseña (`usadoEn`), al vencer, o al emitirse uno nuevo del mismo tipo para ese usuario |
| Vencido | La pantalla ofrece pedir otro con solo escribir el correo |
| Enumeración | "Solicitar enlace" responde siempre lo mismo, exista o no el correo |
| Usuario inactivo | El enlace no funciona |

### Gestionar una cita (ver, cancelar, reprogramar)

No se guarda token: el enlace es `/cita/{id}.{firma}`, donde `firma` es un HMAC-SHA256 del identificador con una clave derivada de `AUTH_SECRET`. Así el mismo enlace puede regenerarse para el recordatorio sin almacenar nada. Si la firma no coincide, se responde "enlace no válido" sin revelar si la cita existe. El enlace deja de ofrecer acciones cuando la cita llega a un estado final o cuando pasa el límite de cancelación; sigue mostrando el resumen hasta que la cita se anonimiza.

## 7. Cuentas

| Regla | Valor |
|-------|-------|
| Contraseña | Mínimo 10 caracteres; sin reglas de composición; distinta del correo |
| Intentos de ingreso | 5 fallidos por correo y dirección de red en 15 minutos → espera de 15 minutos |
| Mensaje de ingreso fallido | Siempre "Correo o contraseña incorrectos" |
| Sesión | 8 horas de inactividad para psicólogos, **2 horas para administradores**; aviso 5 minutos antes |
| Segundo paso (solo administradores) | Código de 6 dígitos al correo en dispositivos nuevos; dispositivo de confianza por 30 días — [[S02-Acceso-y-Permisos]] |
| Acciones sensibles | Exigen confirmar la contraseña si pasaron más de 10 minutos — [[S02-Acceso-y-Permisos]] |
| Usuario desactivado | Pierde el acceso en la siguiente petición (el panel comprueba `activo` en cada carga) |
| Crear psicólogo | El correo debe pertenecer a `dominiosPermitidos`; si la lista está vacía y `ENTORNO` es `produccion`, se rechaza |
| Desactivar psicólogo | No se permite si tiene citas futuras activas: primero se reasignan o cancelan |

## 8. Límites de intentos

En memoria del proceso (una sola instancia). Techo conocido: se reinicia al reiniciar la aplicación; si algún día hay varias instancias, pasa a la base de datos.

| Acción | Límite |
|--------|--------|
| Pedir cita | 5 por hora por dirección de red |
| Inscribirse a evento | 5 por hora por dirección de red |
| Solicitar enlace de contraseña | 3 por hora por correo |
| Ingresar | Ver §7 |
| Consultar cupos | 60 por minuto por dirección de red |

Además, los formularios públicos llevan un **campo trampa** oculto: si llega lleno, se responde éxito y no se guarda nada.

## 9. Tarea programada

> El protocolo completo de la cola y de la tarea está en [[S05-Colas-y-Tareas]]; esta tabla es el resumen.

El servicio `tareas` llama a `POST /api/tareas` **cada minuto** con `CRON_SECRET`. Cada paso es idempotente: ejecutarlo dos veces no duplica nada.

| # | Paso | Detalle |
|---|------|---------|
| 1 | Procesar la cola | `Trabajo` en `PENDIENTE` con `ejecutarDespuesDe ≤ ahora`. Si falla: `intentos + 1` y reintento a 1 min, 5 min, 30 min, 2 h, 12 h. Al quinto fallo → `FALLIDO` |
| 2 | Vencer solicitudes | Citas `PENDIENTE` con `venceEn ≤ ahora` → `VENCIDA` |
| 3 | Recordatorios | Citas `AUTORIZADA` con `inicio` entre 23 y 25 horas desde ahora y `recordatorioEn` vacío → encola el correo y marca `recordatorioEn` |
| 4 | Anonimizar | Una vez al día: citas con `inicio` anterior a `conservacionMeses` |
| 5 | Limpiar | Una vez al día: `TokenAcceso` vencidos hace más de 7 días; `Trabajo` terminados hace más de 30 días; códigos y dispositivos de confianza vencidos; inscripciones de eventos terminados hace más de `conservacionMeses` |

Además, al encolar un correo se intenta enviarlo **de inmediato** tras confirmar la transacción; la tarea solo recoge lo que falló.

## 10. Eventos

| Regla | Valor |
|-------|-------|
| Visible al público | `publicado` y `fin` (o `inicio` si no hay fin) en el futuro |
| Inscripción abierta | Visible y con cupo disponible |
| Cupo | `cupo − inscripciones`; comprobado dentro de la transacción de inscripción |
| Duplicado | Mismo correo en el mismo evento → `YA_INSCRITO` |
| `soloComunidad` | Solo se aceptan correos de `dominiosPermitidos` |
| Borrar evento | Solo si no tiene inscritos; si tiene, se despublica |

## 11. Fotos e imágenes

| Regla | Valor |
|-------|-------|
| Formatos aceptados | JPG, PNG, WebP; validación por cabecera binaria (*magic bytes*) |
| Tamaño máximo | **6 MB** para fotos de perfil (triplicado) · **9 MB** para eventos |
| Aviso al usuario | Mensaje visible en el formulario: *"Tamaño máximo: 6 MB. Formatos permitidos: JPG, PNG o WebP"* |
| Formato de salida | **Siempre WebP (`.webp`)**; ninguna imagen web se sirve en PNG o JPG |
| Foto de perfil | Se recorta a cuadrado, 400 × 400 px, WebP optimizado |
| Imagen de evento | Máximo 1200 px de ancho, proporción 1,618 : 1, WebP optimizado |
| Metadatos | Eliminación total de datos EXIF (geolocalización, cámara) |
| Nombre de archivo | Identificador aleatorio (UUIDv4); nunca el original |
| Al reemplazar | Se borra físicamente el archivo anterior |
