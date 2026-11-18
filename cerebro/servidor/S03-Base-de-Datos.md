---
tags: [capl, servidor, datos]
---

# S03 · Base de datos

Volver a [[S00-Servidor-Inicio]]. Cómo se maneja PostgreSQL. El esquema está en [[E02-Modelo-de-Datos]].

## Acceso

| Regla | Detalle |
|-------|---------|
| Red | El contenedor de la base de datos solo es alcanzable desde la red interna de Docker; ningún puerto publicado |
| Usuarios | Dos: `capl_app` (leer y escribir datos; **no** puede crear ni alterar tablas) y `capl_migrador` (solo lo usa el paso de migración al desplegar) |
| Una base por entorno | Pruebas y producción no comparten servidor de base de datos lógico ni credenciales |
| Acceso humano | Solo por SSH al servidor y desde ahí; nunca una herramienta gráfica conectada por internet |
| Consultas a mano en producción | Solo lectura, y se anotan en `infra/BITACORA.md` (quién, cuándo, para qué). Los cambios de datos van por migración o por el panel |
| Conexiones | Un único cliente compartido por proceso; tope de 10 conexiones |

## Integridad

La base de datos es la última línea de defensa: lo que **nunca** debe pasar se impide ahí, no solo en el código.

| Regla | Mecanismo |
|-------|-----------|
| Sin doble reserva | Restricción de exclusión sobre `Cita` ([[E02-Modelo-de-Datos]]) |
| Sin datos imposibles | `CHECK` en horarios, rangos y fila única de configuración |
| Sin huérfanos | Claves foráneas en todas las relaciones; borrado restringido (nunca en cascada sobre citas) |
| Sin duplicados | Únicos en correo de usuario, código de cita, inscripción por evento y correo |
| Estados válidos | Enumeraciones de PostgreSQL, no texto libre |

## Transacciones

1. **Todo cambio de estado de una cita ocurre en una transacción** junto con su fila de auditoría y sus trabajos encolados. O se guarda todo, o nada.
2. Las transacciones son **cortas**: nunca contienen una llamada a un servicio externo (correo, calendario). Eso va a la cola ([[S05-Colas-y-Tareas]]).
3. Cuando la base de datos rechaza por la restricción de exclusión, se traduce a `CUPO_OCUPADO`; no se reintenta a ciegas.
4. Operaciones que leen y luego escriben el mismo dato (cupo de un evento, límite de citas por persona) bloquean la fila o usan una sola sentencia condicional; no se confía en "leí y estaba libre".
5. Nivel de aislamiento por defecto; no se sube sin una razón escrita.

## Migraciones

| Regla | Detalle |
|-------|---------|
| Única vía | Todo cambio de esquema es una migración versionada, revisada en un PR |
| Inmutables | Una migración unida a `main` no se edita; se crea otra |
| Compatibles hacia atrás | En dos pasos: primero **añadir** (columna nueva, opcional), desplegar el código que la usa, y en otra entrega **quitar** lo viejo. Así volver a la versión anterior no rompe nada |
| Sin pérdida | Nunca se borra una columna con datos en la misma entrega que deja de usarse |
| Sin bloqueos largos | Índices nuevos en tablas con datos se crean de forma concurrente |
| Al desplegar | Copia de seguridad → migrar → arrancar la aplicación. Si la migración falla, el despliegue se detiene y la versión anterior sigue en pie |
| Probadas | Cada migración se aplica en CI sobre una base con datos de ejemplo |
| SQL manual | Las restricciones que Prisma no expresa van comentadas en la migración con su porqué |

## Consultas

- Solo a través del ORM o de consultas parametrizadas; nunca se concatena texto del usuario.
- Listas **siempre paginadas** (25 por página) y con orden estable.
- Se piden solo las columnas necesarias; las consultas del sitio público nunca traen columnas de datos personales.
- Cada consulta que filtra u ordena por una columna tiene su índice (los de [[E02-Modelo-de-Datos]]).
- Una consulta que tarde más de 500 ms queda registrada como advertencia ([[S06-Observabilidad]]).
- Búsqueda en el panel: por código exacto, o por nombre con coincidencia sin distinguir mayúsculas ni tildes; mínimo 3 caracteres.

## Datos sensibles

| Dato | Tratamiento |
|------|-------------|
| Contraseñas | Solo hash argon2id |
| Tokens y códigos | Solo hash |
| **Motivo de consulta** | **Cifrado en la columna** (AES-256-GCM) con una llave que vive en `CLAVE_CIFRADO`, fuera de la base de datos. Una copia de seguridad robada no revela motivos |
| Documento, nombre, contacto | En claro: se necesitan para buscar, mostrar y aplicar el límite por persona. Protegidos por permisos, red cerrada y copias cifradas |
| Tras el plazo de conservación | Se anonimiza ([[E02-Modelo-de-Datos]]) |

Techo conocido: el documento y el contacto no están cifrados por columna. Si la universidad lo exige, se cifran y se añade una columna con huella para poder buscar.

Sobre `CLAVE_CIFRADO`: se guarda aparte de las copias de seguridad; **si se pierde, los motivos son irrecuperables** (el resto de la cita no). Su rotación está descrita en [[S08-Mantenimiento]].

## Copias de seguridad

Calendario y destino en [[E07-Infraestructura]]. Normas:

- Las copias se **cifran antes de salir del servidor**; la llave de cifrado no viaja con ellas.
- Hay siempre al menos una copia fuera del servidor.
- Una copia que no se ha restaurado nunca no cuenta como copia: restauración probada cada semestre.
- Antes de cualquier migración en producción se toma una copia adicional.
- Las copias heredan el plazo de conservación: ninguna vive más de 30 días, para que un dato anonimizado no "reviva" desde una copia vieja.

## Datos de prueba

- La semilla solo contiene datos inventados.
- **Nunca** se copia la base de producción a pruebas ni a un computador personal.
- Para investigar un problema de producción se trabaja con identificadores y registros, no con una copia de los datos.

## Crecimiento esperado

Unas decenas de citas por semana: en años, la base cabe en pocos megabytes. No se necesita particionar, replicar ni cachear. Se revisa el tamaño cada semestre; la única tabla que crece sin parar es `Auditoria`, y no se purga.
