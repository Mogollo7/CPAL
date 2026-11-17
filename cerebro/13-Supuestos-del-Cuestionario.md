---
tags: [capl, supuestos, cuestionario]
---

# 13 · Supuestos tomados mientras responde el CAPL

El código del servidor se completó el 16-nov-2026 **sin esperar** las respuestas del [[11-Cuestionario-CAPL]]. Cada supuesto está marcado en el código con `// SUPUESTO(P-xx)` (buscar `SUPUESTO` en el repositorio) y casi todos son un valor de la tabla `Configuracion` o una variable de entorno: cuando el CAPL responda, se cambia el valor, no el código. Las preguntas están en [[10-Preguntas-Abiertas]].

## Supuestos que se pueden cambiar sin tocar código

| Pregunta | Supuesto | Dónde se cambia |
| -------- | -------- | --------------- |
| P-09 | Cita de 60 minutos para todos los servicios | `Servicio.duracionMin` (panel) |
| P-10 | Se ofrece «cualquiera disponible»; se asigna al de menor carga | — (ya soportado) |
| P-12 | Solo administración autoriza las citas | `servidor/citas/estados.ts` |
| P-14 | Anticipación mínima 24 h, máxima 30 días; cancelar hasta 12 h antes; 1 cita activa por persona | `Configuracion` |
| P-16 | Los datos de la cita se conservan 12 meses y luego se anonimizan | `Configuracion.conservacionMeses` |
| P-06 | El enlace de invitación o de recuperación dura 48 h | `Configuracion.duracionEnlaceHoras` |
| P-02 | Dominio de correo permitido: `unilasallista.edu.co`. Con la lista vacía, en producción se rechaza todo | `Configuracion.dominiosPermitidos`, `DOMINIOS_PERMITIDOS` |
| P-17 | El buzón de avisos es `capl@unilasallista.edu.co` | `Configuracion.correoAdministracion`, `CORREO_ADMINISTRACION` |
| P-11 | Se agendan en línea psicología individual, neuropsicología y orientación vocacional | `contenido/servicios-produccion.json`, panel |
| P-22 | Sin respaldo de envío por Gmail ni calendario compartido (T-333 y T-334 no se hicieron) | — |
| P-24 | Medición de uso apagada | `MEDICION=no` |
| P-21 | Copia externa por rsync sobre SSH, cifrada; el script falla si no hay destino | `RESPALDO_DESTINO_EXTERNO` |
| P-19 | HSTS de un año sin `preload` hasta conocer el subdominio | `next.config.ts` |

## Lo que NO se supuso y bloquea publicar

- **P-03 y P-04 · Emergencias.** `contenido/emergencias.json` y `contenido/orientador.json` van enteros con `porConfirmar: true`. Los teléfonos son solo los que ya estaban en los requisitos (123, 106, 155, 141, 444 44 48); los textos de «qué hacer / qué no hacer» son redacción del equipo. **No se publica sin aprobación del CAPL y sin llamar a cada número.**
- **P-05 · Contenido del sitio.** Las descripciones de los servicios y las preguntas frecuentes son redacción del equipo a partir de los nombres documentados.
- **P-13 · Menores.** El formulario exige acudiente si es menor, pero los requisitos legales y el texto de consentimiento están sin validar.
- **Textos legales.** `contenido/legal/privacidad.md` y `terminos.md` son borradores con marcadores `[POR CONFIRMAR]`.
- **Dirección y teléfono del centro** en los correos: salen de `CAPL_DIRECCION` y `CAPL_TELEFONO`; sin ellas dicen «por confirmar».
- **P-25 y pregunta 14 del cuestionario.** Segunda persona con acceso al servidor y administrador principal: sin nombre.

## Deuda conocida (marcada `ponytail:` en el código)

Resuelto el 16-nov-2026: límite de citas por persona atómico, «cerrar mis sesiones» que invalida las sesiones ya iniciadas, bloqueo de la cuenta tras 15 ingresos fallidos en un día, lista de supresión para quien marca un correo como no deseado, plantillas `cita-reasignada` y `aviso-acceso-emergencia`, subida de imagen de evento, ruta `/archivos/…`, descarga de CSV y acciones de servidor (`servidor/acciones.ts`, ver [[E10-Guia-de-Operaciones]]).

Sigue pendiente:

- La política de contenido permite scripts en línea. Quitarlo exige generar un identificador de un solo uso en `proxy.ts` para **todas** las páginas, lo que las vuelve dinámicas y les quita la caché: se decide cuando existan las pantallas y se pueda medir el costo.
- Al reasignar una cita, el psicólogo anterior no recibe correo (lo ve en su agenda).
- El bloqueo por 15 fallos se cuenta en memoria del proceso (el bloqueo en sí queda en la base): con más de una instancia de la aplicación habría que llevar el contador a la base.
- La lista de contraseñas comunes es corta y local (`servidor/cuentas/politicaClave.ts`).
- El despliegue con Docker (`Dockerfile`, `infra/compose.produccion.yml`, `.github/workflows/desplegar.yml`) y los scripts de copia y restauración no se han ejecutado en un servidor.
- En producción las claves de `capl_app` y `capl_migrador` nacen con el valor de desarrollo de `infra/bd/init.sql`: hay que cambiarlas en el primer arranque (pasos en `infra/README.md`).
